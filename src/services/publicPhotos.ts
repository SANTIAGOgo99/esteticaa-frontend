const TTL = 7 * 86400000;
const pending = new Map<string, Promise<Blob | undefined>>();
const queue: Array<() => void> = [];
let running = 0;
function pump() { while (running < 3 && queue.length) queue.shift()?.(); }
function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ec-public-photos', 1);
    request.onupgradeneeded = () => {
      const store = request.result.createObjectStore('photos', { keyPath: 'url' });
      store.createIndex('savedAt', 'savedAt');
    };
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}
export async function readPublicPhoto(url: string): Promise<Blob | undefined> {
  try {
    const db = await database();
    try {
      return await new Promise((resolve, reject) => {
        const r = db.transaction('photos').objectStore('photos').get(url);
        r.onerror = () => reject(r.error);
        r.onsuccess = () => resolve(r.result && Date.now() - r.result.savedAt < TTL ? r.result.blob : undefined);
      });
    } finally { db.close(); }
  } catch { return undefined; }
}
async function save(url: string, blob: Blob) {
  const db = await database();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('photos', 'readwrite');
      const store = tx.objectStore('photos');
      store.put({ url, blob, savedAt: Date.now() });
      const count = store.count();
      count.onsuccess = () => {
        let excess = count.result - 60;
        if (excess <= 0) return;
        const cursor = store.index('savedAt').openCursor();
        cursor.onsuccess = () => { if (cursor.result && excess-- > 0) { cursor.result.delete(); cursor.result.continue(); } };
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally { db.close(); }
}
export function fetchPublicPhoto(url: string): Promise<Blob | undefined> {
  const old = pending.get(url);
  if (old) return old;
  const request = new Promise<Blob | undefined>(resolve => {
    queue.push(() => {
      running++;
      void (async () => {
        const cached = await readPublicPhoto(url);
        if (cached || !navigator.onLine) return cached;
        const parsed = new URL(url);
        if (parsed.hostname !== 'res.cloudinary.com' || !/\/image\/upload\//.test(parsed.pathname) || !/\/estetica_(productos|servicios)\//.test(parsed.pathname)) return undefined;
        const response = await fetch(url, { mode: 'cors', credentials: 'omit', signal: AbortSignal.timeout(10000) });
        if (!response.ok || /private|no-store/i.test(response.headers.get('cache-control') || '')) return undefined;
        const blob = await response.blob();
        if (!/^image\/(jpeg|png|webp|avif|gif)$/.test(blob.type) || blob.size > 2097152) return undefined;
        try { await save(url, blob); } catch { /* Quota limitations must not break online images. */ }
        return blob;
      })().then(resolve).catch(() => resolve(undefined)).finally(() => { running--; pump(); });
    });
    pump();
  }).finally(() => pending.delete(url));
  pending.set(url, request);
  return request;
}
