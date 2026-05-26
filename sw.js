const CACHE_NAME = 'pocketzero-v3';

// Build absolute precache URLs from the SW's actual scope at runtime,
// so this works at any deployment path (e.g. /PocketZero/ on GitHub Pages).
function getPrecacheUrls(scope) {
  return [
    scope,
    scope + 'index.html',
    scope + 'main.js',
    scope + 'style.css',
    scope + 'manifest.json',
    scope + 'icons/icon.svg',
    scope + 'icons/icon-192.png',
    scope + 'icons/icon-512.png',
  ];
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(getPrecacheUrls(self.registration.scope))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((networkResponse) => {
        if (
          networkResponse.ok &&
          event.request.url.startsWith(self.registration.scope)
        ) {
          const responseClone = networkResponse.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      });
    })
  );
});
