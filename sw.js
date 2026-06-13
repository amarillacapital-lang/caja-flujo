/* ===========================================================
   Service Worker — Flujo de Caja · Comida Paraguaya Premium
   Versión: 1.0.0
   =========================================================== */

const CACHE_NAME = 'caja-premium-v1';

// Recursos a cachear al instalar
const PRECACHE_URLS = [
  'index.html',
  'manifest.json',
  'icons/icon-192.svg',
  'icons/icon-512.svg',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

// CDN resources que queremos cachear
const CDN_CACHE = [
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'
];

// -------------------------------------------------------------------
// INSTALACIÓN — precachear archivos esenciales
// -------------------------------------------------------------------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// -------------------------------------------------------------------
// ACTIVACIÓN — limpiar cachés antiguas
// -------------------------------------------------------------------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// -------------------------------------------------------------------
// INTERCEPCIÓN DE FETCH — estrategia: network-first + fallback a caché
// -------------------------------------------------------------------
self.addEventListener('fetch', (event) => {
  // Solo interceptar GET
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Para CDN: cache-first (no cambian seguido)
  if (CDN_CACHE.some(cdnUrl => event.request.url.startsWith(cdnUrl))) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
          return response;
        }).catch(() => {
          // Si falla, devolver el HTML principal como fallback
          return caches.match('index.html');
        });
      })
    );
    return;
  }

  // Para nuestros propios archivos: network-first
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(event.request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clone);
        });
        return response;
      }).catch(() => {
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // Si no hay nada en caché, devolver index.html
          if (event.request.destination === 'document') {
            return caches.match('index.html');
          }
          return new Response('', { status: 408 });
        });
      })
    );
    return;
  }

  // Para todo lo demás (google fonts, etc): intentar red, fallback a caché
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
