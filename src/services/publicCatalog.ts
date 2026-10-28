import publicApi from './publicApi';

export type CatalogKind = 'services' | 'products';
export interface PublicCatalogItem {
  id: number;
  name: string;
  description?: string;
  price: string | number;
  image_url?: string;
  duration_minutes?: number;
  brand?: string;
  category?: string;
  stock?: number;
}
export interface PublicCatalogSnapshot {
  items: PublicCatalogItem[];
  savedAt: number;
}
export const PUBLIC_CATALOG_TTL = 7 * 24 * 60 * 60 * 1000;
const memory = new Map<CatalogKind, PublicCatalogSnapshot>();
const requests = new Map<CatalogKind, Promise<PublicCatalogSnapshot>>();

function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ec-public-catalog', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('snapshots');
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function readCatalog(kind: CatalogKind): Promise<PublicCatalogSnapshot | undefined> {
  let snapshot = memory.get(kind);
  if (!snapshot) {
    try {
      const db = await database();
      try {
        snapshot = await new Promise<PublicCatalogSnapshot | undefined>((resolve, reject) => {
          const request = db.transaction('snapshots').objectStore('snapshots').get(kind);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      } finally { db.close(); }
    } catch { return undefined; }
  }
  if (!snapshot || !Array.isArray(snapshot.items) || Date.now() - snapshot.savedAt > PUBLIC_CATALOG_TTL) return undefined;
  memory.set(kind, snapshot);
  return snapshot;
}

async function saveCatalog(kind: CatalogKind, snapshot: PublicCatalogSnapshot) {
  memory.set(kind, snapshot);
  try {
    const db = await database();
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction('snapshots', 'readwrite');
        transaction.objectStore('snapshots').put(snapshot, kind);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
      });
    } finally { db.close(); }
  } catch { /* Storage may be unavailable; the SW remains an independent fallback. */ }
}

// Store only the public DTO, never tokens, appointments, profiles or arbitrary API data.
function publicItems(data: unknown): PublicCatalogItem[] {
  if (!Array.isArray(data) || data.length > 500 || JSON.stringify(data).length > 1048576) throw new Error('Catálogo público inválido.');
  return data.map(value => {
    if (!value || typeof value !== 'object' || !Number.isSafeInteger(Number(value.id)) || typeof value.name !== 'string') throw new Error('Catálogo público inválido.');
    const item: PublicCatalogItem = { id: Number(value.id), name: value.name, price: value.price };
    for (const field of ['description', 'image_url', 'brand', 'category'] as const) {
      if (typeof value[field] === 'string') item[field] = value[field];
    }
    for (const field of ['duration_minutes', 'stock'] as const) {
      if (Number.isFinite(Number(value[field])) && value[field] != null) item[field] = Number(value[field]);
    }
    return item;
  });
}

export function warmCatalogResources() {
  if (!navigator.onLine || !('serviceWorker' in navigator)) return;
  // Independent of rendering; also covers first visits before the worker takes control.
  void navigator.serviceWorker.ready.then(registration => {
    registration.active?.postMessage({ type: 'CACHE_PUBLIC_CATALOG' });
  }).catch(() => undefined);
}

export function fetchCatalog(kind: CatalogKind): Promise<PublicCatalogSnapshot> {
  const pending = requests.get(kind);
  if (pending) return pending;
  const request = (async () => {
    const cached = await readCatalog(kind);
    if (!navigator.onLine && cached) return cached;
    try {
      const response = await publicApi.get(`/${kind}/active`, { timeout: 8000 });
      const snapshot = { items: publicItems(response.data), savedAt: Date.now() };
      // Finish persistence before announcing that the catalog has loaded.
      await saveCatalog(kind, snapshot);
      warmCatalogResources();
      return snapshot;
    } catch (error) {
      if (cached) return cached;
      throw error;
    }
  })().finally(() => requests.delete(kind));
  requests.set(kind, request);
  return request;
}
