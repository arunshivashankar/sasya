const CACHE_NAME = 'plant-care-v2';
const urlsToCache = [
  '/',
  '/css/styles.css',
  '/js/data/plantCareData.js',
  '/js/db.js',
  '/js/services/scheduleEngine.js',
  '/js/services/weatherService.js',
  '/js/api.js',
  '/js/app.js',
  '/js/components/weatherWidget.js',
  '/js/components/plantCard.js',
  '/js/components/scheduleCard.js',
  '/js/pages/dashboard.js',
  '/js/pages/plants.js',
  '/js/pages/calendar.js',
  '/js/pages/settings.js',
  '/manifest.json',
  '/icons/icon.svg',
  '/icons/apple-touch-icon.svg',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // Cache-first for all static assets (fully offline app)
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response.ok && event.request.method === 'GET') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        });
      })
      .catch(() => {
        // SPA fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(
        names.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});
