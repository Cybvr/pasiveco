const CACHE_NAME = 'qrtraffic-cache-v2';
const ASSETS = ['/', '/favicon.png', '/manifest.json', '/images/logo.png'];
const DEFAULT_NOTIFICATION_URL = '/dashboard/notifications';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        return caches.match('/');
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
          return undefined;
        })
      );
    })
  );
});

self.addEventListener('push', (event) => {
  const payload = event.data ? event.data.json() : {};
  const title = payload.title || 'Pasive notification';
  const options = {
    body: payload.body || 'You have a new update waiting.',
    icon: payload.icon || '/favicon.png',
    badge: payload.badge || '/favicon.png',
    image: payload.image,
    data: {
      url: payload.url || DEFAULT_NOTIFICATION_URL,
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl =
    event.notification.data?.url || DEFAULT_NOTIFICATION_URL;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }

      return undefined;
    })
  );
});
