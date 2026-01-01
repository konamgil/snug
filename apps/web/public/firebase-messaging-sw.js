// Firebase Messaging Service Worker
// This file must be in the public folder for FCM to work

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
firebase.initializeApp({
  apiKey: 'YOUR_API_KEY', // Will be replaced at build time or use env vars
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
  measurementId: 'YOUR_MEASUREMENT_ID',
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'Snug';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: payload.data?.type || 'snug-notification',
    data: payload.data,
    // Action buttons
    actions: getNotificationActions(payload.data?.type),
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Get notification actions based on type
function getNotificationActions(type) {
  switch (type) {
    case 'reservation':
      return [
        { action: 'view', title: 'View Reservation' },
        { action: 'dismiss', title: 'Dismiss' },
      ];
    case 'message':
      return [
        { action: 'reply', title: 'Reply' },
        { action: 'dismiss', title: 'Dismiss' },
      ];
    default:
      return [{ action: 'open', title: 'Open' }];
  }
}

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);

  event.notification.close();

  const data = event.notification.data;
  let url = '/';

  // Determine URL based on notification type and data
  if (data?.url) {
    url = data.url;
  } else if (data?.roomId) {
    url = `/ko/room/${data.roomId}`;
  } else if (data?.reservationId) {
    url = `/ko/reservations/${data.reservationId}`;
  } else if (data?.messageId) {
    url = `/ko/messages/${data.messageId}`;
  }

  // Handle action clicks
  if (event.action === 'reply' && data?.messageId) {
    url = `/ko/messages/${data.messageId}?reply=true`;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there's already a window open
      for (const client of windowClients) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
