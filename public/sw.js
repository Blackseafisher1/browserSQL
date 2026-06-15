const CACHE = 'browsersql-v1';

const PRECACHE = [
  '/editor.html',
  '/dist/app.js',
  '/css/tokens.css',
  '/css/reset.css',
  '/css/base.css',
  '/css/layouts.css',
  '/css/components/editor.css',
  '/css/components/schema.css',
  '/css/components/results.css',
  '/css/components/modal.css',
  '/css/components/dbmanager.css',
  '/css/states.css',
  '/css/utilities.css',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // ALL CDN scripts (codemirror, lezer, marked, sqlite wasm, etc) — cache-first
  if (url.hostname === 'cdn.jsdelivr.net') {
    e.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((res) => {
        if (res.ok && res.status !== 206) {
          const clone = res.clone();
          caches.open(CACHE).then((cache) => cache.put(request, clone));
        }
        return res;
      }))
    );
    return;
  }

  // Same-origin app assets (JS chunks, CSS, chunk files) — cache-first
  if (url.origin === location.origin && (url.pathname.startsWith('/dist/') || url.pathname.startsWith('/css/') || url.pathname.match(/\/chunks\//))) {
    e.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((res) => {
        if (res.ok && res.status !== 206) {
          const clone = res.clone();
          caches.open(CACHE).then((cache) => cache.put(request, clone));
        }
        return res;
      }))
    );
    return;
  }

  // HTML and other same-origin — network-first, fallback to cache
  if (url.origin === location.origin) {
    e.respondWith(
      fetch(request).then((res) => {
        if (res.ok && res.status !== 206) {
          const clone = res.clone();
          caches.open(CACHE).then((cache) => cache.put(request, clone));
        }
        return res;
      }).catch(() => caches.match(request).then((cached) => cached || new Response('Offline', { status: 503 })))
    );
  }
});
