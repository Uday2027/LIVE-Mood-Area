// public/sw.js
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'MoodMap Alert';
  const options = {
    body: data.body || 'Something new is happening on the map!',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: data.url || '/',
    vibrate: [100, 50, 100],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data)
  );
});
