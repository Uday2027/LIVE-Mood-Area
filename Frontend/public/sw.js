// public/sw.js
// Service Worker for receiving and displaying push notifications.

self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/logo192.png', // Update with real icon path
    badge: '/logo192.png',
    data: data.data,
    actions: [
      { action: 'open', title: 'View on MoodMap' }
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Example: navigate to the map or a specific pin
  event.waitUntil(
    clients.openWindow('/')
  );
});
