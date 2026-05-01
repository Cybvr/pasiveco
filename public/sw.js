const CACHE_NAME = 'pasive-cache-v4';
const ASSETS = ['/', '/favicon.ico', '/manifest.json', '/images/logo.svg'];
const DEFAULT_NOTIFICATION_URL = '/dashboard/notifications';

function shouldBypassRequest(request) {
  if (request.method !== 'GET') {
    return true;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return true;
  }

  if (
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/_next') ||
    url.searchParams.has('_rsc') ||
    url.searchParams.has('__flight__') ||
    request.headers.has('RSC') ||
    request.headers.has('Next-Router-State-Tree') ||
    request.headers.has('Next-Url')
  ) {
    return true;
  }

  return false;
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        ASSETS.map((asset) =>
          cache.add(asset).catch((error) => {
            console.warn('[sw] Failed to cache asset:', asset, error);
          })
        )
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (shouldBypassRequest(event.request)) {
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/') || Response.error())
    );
    return;
  }

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
