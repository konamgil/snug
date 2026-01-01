import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging';
import { getFirebaseApp } from './config';

let messaging: Messaging | null = null;

// Initialize Messaging (lazy initialization)
export function getFirebaseMessaging(): Messaging | null {
  if (typeof window === 'undefined') return null;

  // Check if notifications are supported
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return null;
  }

  if (!messaging) {
    try {
      const app = getFirebaseApp();
      messaging = getMessaging(app);
    } catch (error) {
      console.error('Failed to initialize Firebase Messaging:', error);
      return null;
    }
  }

  return messaging;
}

// Request notification permission and get FCM token
export async function requestNotificationPermission(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return null;
    }

    const messagingInstance = getFirebaseMessaging();
    if (!messagingInstance) return null;

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.error('VAPID key not configured');
      return null;
    }

    const token = await getToken(messagingInstance, { vapidKey });
    return token;
  } catch (error) {
    console.error('Failed to get FCM token:', error);
    return null;
  }
}

// Get current FCM token (without requesting permission)
export async function getFCMToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  if (Notification.permission !== 'granted') return null;

  const messagingInstance = getFirebaseMessaging();
  if (!messagingInstance) return null;

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) return null;

  try {
    const token = await getToken(messagingInstance, { vapidKey });
    return token;
  } catch (error) {
    console.error('Failed to get FCM token:', error);
    return null;
  }
}

// Listen for foreground messages
export function onForegroundMessage(callback: (payload: unknown) => void): (() => void) | null {
  const messagingInstance = getFirebaseMessaging();
  if (!messagingInstance) return null;

  const unsubscribe = onMessage(messagingInstance, (payload) => {
    callback(payload);
  });

  return unsubscribe;
}

// ============================================
// Snug-specific notification types
// ============================================

export interface SnugNotification {
  type: 'reservation' | 'message' | 'review' | 'promotion' | 'system';
  title: string;
  body: string;
  data?: {
    roomId?: string;
    reservationId?: string;
    messageId?: string;
    url?: string;
  };
}

// Handle Snug notification
export function handleSnugNotification(payload: unknown): SnugNotification | null {
  if (!payload || typeof payload !== 'object') return null;

  const data = payload as {
    notification?: { title?: string; body?: string };
    data?: Record<string, string>;
  };

  if (!data.notification) return null;

  return {
    type: (data.data?.type as SnugNotification['type']) || 'system',
    title: data.notification.title || '',
    body: data.notification.body || '',
    data: {
      roomId: data.data?.roomId,
      reservationId: data.data?.reservationId,
      messageId: data.data?.messageId,
      url: data.data?.url,
    },
  };
}
