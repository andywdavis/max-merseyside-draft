const CACHE = 'rj-merseyside-max-20261019-corrected-headers-v2';
const PREFIX = 'rj-merseyside-max-';
const CORE = ['./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-180.png','./icon-maskable-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(name => name.startsWith(PREFIX) && name !== CACHE).map(name => caches.delete(name))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(response => {
      if (response.ok) {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE).then(cache => cache.put(request, copy)).catch(() => {}));
      }
      return response;
    }).catch(async () => (await caches.match(request)) || (await caches.match('./index.html'))));
    return;
  }
  // Catalogue page images: online-first, then previously cached page if offline.
  if (/\/pages\/\d{3}\.webp$/.test(url.pathname)) {
    event.respondWith(fetch(new Request(request, {cache:'no-cache'})).then(response => {
      if (response.ok) {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE).then(cache => cache.put(request, copy)).catch(() => {}));
      }
      return response;
    }).catch(async () => (await caches.match(request)) || Response.error()));
    return;
  }
  event.respondWith(caches.match(request).then(hit => hit || fetch(request).then(response => {
    if (response.ok) {
      const copy = response.clone();
      event.waitUntil(caches.open(CACHE).then(cache => cache.put(request, copy)).catch(() => {}));
    }
    return response;
  })));
});
