const CACHE_NAME = 'gt-app-cache-v4';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/logo.png',
  '/logo-512.png',
  '/logo.webp',
  '/hero-banner.webp',
  '/catalog-images/ai_glow_banner.webp',
  '/manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Caching static assets failed during install:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Purging old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // NEVER intercept admin routes, API requests, Supabase calls, or external analytics
  if (
    request.method !== 'GET' ||
    request.url.includes('/admin') ||
    request.url.includes('/assets/') ||
    request.url.includes('/rest/v1/') ||
    request.url.includes('/auth/v1/') ||
    request.url.includes('google') ||
    request.url.includes('facebook') ||
    request.url.includes('clarity')
  ) {
    return;
  }

  // Network-First strategy: Always fetch fresh content, fallback to cache if offline
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === 'basic'
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});
