/**
 * STABLEMATE Boxing Trainer - Service Worker
 * Enables offline functionality and faster load times
 */

const CACHE_NAME = 'stablemate-v1';
const AUDIO_CACHE_NAME = 'stablemate-audio-v1';

// Core app files to cache immediately
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/App.tsx',
  '/components/BoxingTrainer.tsx',
  '/components/mobile-audio-player.ts',
  '/styles/globals.css',
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching core assets');
        return cache.addAll(CORE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== AUDIO_CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle audio files from GitHub separately (cache-first)
  if (url.hostname === 'raw.githubusercontent.com' && url.pathname.includes('boxing-trainer-audio')) {
    event.respondWith(
      caches.open(AUDIO_CACHE_NAME)
        .then((cache) => {
          return cache.match(request)
            .then((cached) => {
              if (cached) {
                console.log('[SW] Audio cache hit:', url.pathname);
                return cached;
              }
              
              // Not cached - fetch and cache
              console.log('[SW] Audio cache miss, fetching:', url.pathname);
              return fetch(request)
                .then((response) => {
                  // Only cache successful responses
                  if (response.ok) {
                    cache.put(request, response.clone());
                  }
                  return response;
                });
            });
        })
    );
    return;
  }
  
  // Handle app assets (network-first for fresh content)
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone the response before caching
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(request, responseToCache);
          });
        
        return response;
      })
      .catch(() => {
        // Network failed - try cache
        return caches.match(request)
          .then((cached) => {
            if (cached) {
              console.log('[SW] Serving from cache:', request.url);
              return cached;
            }
            
            // Not in cache either - return offline page or error
            console.error('[SW] No cache entry for:', request.url);
            return new Response('Offline - content not available', {
              status: 503,
              statusText: 'Service Unavailable',
            });
          });
      })
  );
});

// Listen for messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_AUDIO_CACHE') {
    caches.delete(AUDIO_CACHE_NAME)
      .then(() => {
        console.log('[SW] Audio cache cleared');
        event.ports[0].postMessage({ success: true });
      });
  }
});
