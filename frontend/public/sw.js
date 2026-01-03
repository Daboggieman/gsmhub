const CACHE_NAME = 'gsmhub-cache-v1';
const OFFLINE_URL = '/offline'; // We should create this page

const AUTO_CACHE_URLS = [
    '/',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(AUTO_CACHE_URLS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // Only cache GET requests
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // Cache strategy: Network First, falling back to cache
    // This ensures users see latest data when online, but can see specs offline
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // If successful, clone it and save to cache
                if (response.status === 200) {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return response;
            })
            .catch(() => {
                // If network fails, try cache
                return caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    // If both fail and it's a page navigation, we could show an offline page
                    // if (event.request.mode === 'navigate') {
                    //   return caches.match(OFFLINE_URL);
                    // }
                });
            })
    );
});
