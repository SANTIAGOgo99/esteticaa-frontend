import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, createHandlerBoundToURL, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
clientsClaim();
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();
self.addEventListener('message', event => { if (event.data?.type === 'SKIP_WAITING') self.skipWaiting(); });
// Own timestamp enforces absolute TTL even when CORS hides the server Date header.
const absoluteLifetime = {
  cacheWillUpdate: async ({ response }) => {
    const headers = new Headers(response.headers);
    headers.set('X-EC-Cached-At', String(Date.now()));
    return new Response(await response.clone().arrayBuffer(), { status: response.status, statusText: response.statusText, headers });
  },
  cachedResponseWillBeUsed: async ({ cachedResponse }) => {
    if (!cachedResponse) return null;
    const saved = Number(cachedResponse.headers.get('X-EC-Cached-At'));
    return saved > 0 && Date.now() - saved < 86400000 ? cachedResponse : null;
  },
};
const api = new URL(import.meta.env.VITE_API_URL || '/api', self.location.origin);
const publicPaths = ['/services/active', '/products/active', '/site-settings/public'].map(p => api.pathname.replace(/\/$/, '') + p);
registerRoute(({ request, url }) => request.method === 'GET' && !request.headers.has('authorization') && url.origin === api.origin && !url.search && publicPaths.includes(url.pathname), new NetworkFirst({
 cacheName: 'ec-public-v1', networkTimeoutSeconds: 5,
 plugins: [new CacheableResponsePlugin({ statuses: [200] }),
 { cacheWillUpdate: async ({ response }) => {
 if (response.status !== 200 || !response.headers.get('content-type')?.includes('application/json') || /private|no-store/i.test(response.headers.get('cache-control') || '')) return null;
 return (await response.clone().arrayBuffer()).byteLength <= 1048576 ? response : null;
 } }, absoluteLifetime, new ExpirationPlugin({ maxEntries: 3, maxAgeSeconds: 86400, purgeOnQuotaError: true })]
}));
// Only existing public Cloudinary folders, never generic uploads or private references.
registerRoute(({ request, url }) => request.destination === 'image' && !request.headers.has('authorization') && url.hostname === 'res.cloudinary.com' && /\/image\/upload\//.test(url.pathname) && /\/estetica_(productos|servicios)\//.test(url.pathname), new CacheFirst({
 cacheName: 'ec-public-images-v1', plugins: [new CacheableResponsePlugin({ statuses: [200] }),
 { cacheWillUpdate: async ({ response }) => response.status === 200 && (await response.clone().arrayBuffer()).byteLength <= 2097152 ? response : null },
 absoluteLifetime, new ExpirationPlugin({ maxEntries: 40, maxAgeSeconds: 86400, purgeOnQuotaError: true })]
}));
registerRoute(new NavigationRoute(createHandlerBoundToURL('/index.html'), { denylist: [/^\/api(?:\/|$)/, /^\/uploads(?:\/|$)/] }));
