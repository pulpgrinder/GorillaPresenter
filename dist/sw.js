// Needs to be var, not let or const.
var CACHE_NAME = 'V0.3274Sun May 19 2024 15:03:43 GMT-0800 (Alaska Daylight Time)';
var urlsToCache = [
    '/',
    './index.html',
    './apple-touch-icon-192x192.png',
    './apple-touch-icon-512x512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response; // Serve from cache
                }
                return fetch(event.request); // Fetch from network
            })
    );
});
