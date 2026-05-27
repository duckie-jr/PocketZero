const CACHE_NAME = 'pocketzero-v4';

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

  const requestUrl = new URL(event.request.url);
  const isJsOrCss = requestUrl.pathname.endsWith('.js') || requestUrl.pathname.endsWith('.css');

  if (isJsOrCss) {
    // Network-first for scripts and styles so edits are always picked up immediately.
    // Falls back to cache only when offline.
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse.ok && requestUrl.href.startsWith(self.registration.scope)) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse.clone()));
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first for everything else (HTML, images, manifests)
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
