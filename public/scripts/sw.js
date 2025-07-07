// Service Worker for PWA
const CACHE_NAME = 'vchat-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/assets/styles/style.css',
  '/assets/styles/animations.css',
  '/assets/icons/app-icon.png',
  '/assets/icons/default-avatar.png',
  '/assets/icons/chat-icon.png',
  '/assets/icons/call-icon.png',
  '/assets/icons/video-icon.png',
  '/assets/images/auth-bg.jpg',
  '/assets/images/wave-bg.svg',
  '/scripts/auth.js',
  '/scripts/chat.js',
  '/scripts/call.js',
  '/scripts/friends.js',
  '/scripts/settings.js',
  '/scripts/notifications.js',
  '/scripts/main.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          }
        );
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});