const CACHE_NAME = 'nutritrack-v1';
const RUNTIME_CACHE = 'nutritrack-runtime-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(URLS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - Network first, then cache
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request)
          .then((response) => response || caches.match('/'));
      })
  );
});

// Handle water reminder messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'WATER_REMINDER') {
    const { title, body, badge, tag } = event.data;
    self.registration.showNotification(title, {
      body,
      badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%2322c55e"/><text x="50" y="55" font-size="60" font-weight="bold" fill="white" text-anchor="middle">💧</text></svg>',
      tag,
      requireInteraction: false,
      actions: [
        {
          action: 'close',
          title: 'Chiudi',
        }
      ]
    });
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'close') {
    return;
  }
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (let client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Periodic background sync for water reminders (if available)
if ('periodicSync' in self.registration) {
  self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'water-reminder-sync') {
      event.waitUntil(checkAndNotifyWaterReminder());
    }
  });
}

async function checkAndNotifyWaterReminder() {
  // This will be called periodically if the browser supports periodic background sync
  try {
    const clients = await self.clients.matchAll();
    for (const client of clients) {
      client.postMessage({
        type: 'CHECK_WATER_REMINDER',
      });
    }
  } catch (error) {
    console.error('Error in water reminder sync:', error);
  }
}
