import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, createHandlerBoundToURL, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

clientsClaim();
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();
const MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const api = new URL(import.meta.env.VITE_API_URL || '/api', self.location.origin);
const apiPath = api.pathname.replace(/\/$/, '');
const publicPaths = ['/services/active', '/products/active', '/site-settings/public'].map(path => apiPath + path);
const isPublicApi = url => url.origin === api.origin && !url.search && publicPaths.includes(url.pathname);
const isPublicImage = url => (url.hostname === 'res.cloudinary.com' && /\/image\/upload\//.test(url.pathname) && /\/estetica_(productos|servicios)\//.test(url.pathname)) ||
  (url.hostname === 'images.unsplash.com' && url.pathname === '/photo-1560066984-138dadb4c035');

function publicResponse(maxBytes, json = false) {
  return {
    cacheWillUpdate: async ({ response }) => {
      if (response.status !== 200 || /private|no-store/i.test(response.headers.get('cache-control') || '')) return null;
      if (json && !response.headers.get('content-type')?.includes('application/json')) return null;
      const bytes = await response.clone().arrayBuffer();
      if (bytes.byteLength > maxBytes) return null;
      const headers = new Headers(response.headers);
      headers.set('X-EC-Cached-At', String(Date.now()));
      headers.delete('content-encoding');
      headers.delete('content-length');
      return new Response(bytes, { status: 200, headers });
    },
    cachedResponseWillBeUsed: async ({ cachedResponse }) => {
      if (!cachedResponse) return null;
      const saved = Number(cachedResponse.headers.get('X-EC-Cached-At'));
      return saved > 0 && Date.now() - saved < MAX_AGE ? cachedResponse : null;
    },
  };
}
const catalogs = new NetworkFirst({
  cacheName: 'ec-public-v2', networkTimeoutSeconds: 3, matchOptions: { ignoreVary: true },
  plugins: [publicResponse(1048576, true), new ExpirationPlugin({ maxEntries: 3, maxAgeSeconds: MAX_AGE / 1000, purgeOnQuotaError: true })],
});
const images = new CacheFirst({
  cacheName: 'ec-public-images-v2', matchOptions: { ignoreVary: true },
  plugins: [publicResponse(2097152), new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: MAX_AGE / 1000, purgeOnQuotaError: true })],
});
registerRoute(({ request, url }) => !request.headers.has('authorization') && isPublicApi(url), catalogs);
registerRoute(({ request, url }) => request.destination === 'image' && !request.headers.has('authorization') && isPublicImage(url), images);
registerRoute(new NavigationRoute(createHandlerBoundToURL('/index.html'), { denylist: [/^\/api(?:\/|$)/, /^\/uploads(?:\/|$)/] }));

let warming;
let lastWarm = 0;
async function warmPublicCatalog(event) {
  if (warming) return warming;
  if (Date.now() - lastWarm < 60000) return;
  warming = (async () => {
    const imageUrls = new Set(['https://images.unsplash.com/photo-1560066984-138dadb4c035?q=75&w=760&auto=format&fit=crop']);
    for (const path of ['/services/active', '/products/active']) {
      try {
        const request = new Request(api.origin + apiPath + path, { credentials: 'omit', mode: 'cors', signal: AbortSignal.timeout(10000) });
        const response = await catalogs.handle({ event, request });
        if (!response.ok) continue;
        const items = await response.clone().json();
        if (!Array.isArray(items)) continue;
        for (const item of items.slice(0, 500)) {
          if (typeof item.image_url !== 'string') continue;
          const url = new URL(item.image_url, api.origin);
          if (isPublicImage(url)) imageUrls.add(url.href);
        }
      } catch { /* Offline activation must never prevent the shell from opening. */ }
    }
    const queue = [...imageUrls].slice(0, 60);
    await Promise.all(Array.from({ length: 3 }, async () => {
      while (queue.length) {
        const url = queue.shift();
        try {
          const request = new Request(url, { credentials: 'omit', mode: 'cors', signal: AbortSignal.timeout(10000) });
          await images.handle({ event, request });
        } catch { /* A missing image does not discard an already saved catalog. */ }
      }
    }));
    lastWarm = Date.now();
  })().finally(() => { warming = undefined; });
  return warming;
}
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data?.type === 'CACHE_PUBLIC_CATALOG') event.waitUntil(warmPublicCatalog(event));
});
self.addEventListener('activate', event => {
  event.waitUntil(warmPublicCatalog(event));
});
