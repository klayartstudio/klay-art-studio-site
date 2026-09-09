// ============================================================
// KLAY ART STUDIO - SERVICE WORKER
// Bump CACHE_VERSION whenever site content changes meaningfully so
// visitors' browsers pick up the new files instead of serving stale
// cached ones.
// ============================================================

const CACHE_VERSION = 'v4';
const CACHE_NAME = `klay-cache-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  '/',
  '/css/style.css',
  '/js/script.js',
  '/js/gallery.js',
  '/data/artworks.js',
  '/images/logo/logo-full.png',
  '/images/logo/logo-mark.png',
  '/favicon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // leave fonts/CDN/placeholder requests alone

  const isHTML = request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html');

  if (isHTML) {
    // Network-first: always show the latest page when online, fall back
    // to the cached copy (or the cached homepage) when offline/slow.
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
    );
    return;
  }

  // Static assets (CSS, JS, images): cache-first for instant repeat loads,
  // filling the cache the first time a given file is requested.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
