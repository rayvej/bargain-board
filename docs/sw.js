// ─── Bargain Board — Service Worker v5 ───
const CACHE_NAME = 'bargain-board-v5';

const STATIC_ASSETS = [
    './',
    './index.html',
    './style.css',
    './tailwind.min.css',
    './manifest.json',
    './deals-data.json',
    './js/app.js',
    './js/deals.js',
    './js/search.js',
    './js/categories.js',
    './js/image-search.js',
    './js/modules/ui.js',
    './js/modules/firestore-client.js',
    './js/modules/deal-card.js',
    './js/modules/filters.js',
    './js/modules/web-search.js'
];

// Install — cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .catch(err => console.warn('SW: Failed to cache some assets:', err))
    );
    self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(names =>
            Promise.all(
                names.filter(name => name !== CACHE_NAME)
                     .map(name => caches.delete(name))
            )
        )
    );
    self.clients.claim();
});

// Fetch — cache-first for static, network-first for API & deals data
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Network-first for deals-data.json (so live deals always update when online)
    if (url.pathname.endsWith('deals-data.json')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Network-first for Firestore/Firebase API calls
    if (url.hostname.includes('googleapis.com') || url.hostname.includes('firebaseio.com')) {
        event.respondWith(
            fetch(event.request)
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Network-first for Google Fonts (they update)
    if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Cache-first for same-origin static assets
    if (url.origin === self.location.origin) {
        event.respondWith(
            caches.match(event.request)
                .then(cached => {
                    if (cached) return cached;
                    return fetch(event.request).then(response => {
                        if (response.ok) {
                            const clone = response.clone();
                            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                        }
                        return response;
                    });
                })
        );
    }
});
