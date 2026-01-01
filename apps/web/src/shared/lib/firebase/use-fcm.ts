'use client';

import { useEffect, useState, useCallback } from 'react';
import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging';
import { getFirebaseApp } from './config';

interface UseFCMOptions {
  onMessage?: (payload: unknown) => void;
  onTokenChange?: (token: string) => void;
}

interface UseFCMReturn {
  token: string | null;
  isSupported: boolean;
  isPermissionGranted: boolean;
  requestPermission: () => Promise<string | null>;
  error: Error | null;
}

// Check if FCM is supported
function isFCMSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
}

export function useFCM(options: UseFCMOptions = {}): UseFCMReturn {
  const [token, setToken] = useState<string | null>(null);
  const [isSupported] = useState(() => isFCMSupported());
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [messaging, setMessaging] = useState<Messaging | null>(null);

  // Initialize messaging and check permission status
  useEffect(() => {
    if (!isSupported) return;

    // Check current permission status
    setIsPermissionGranted(Notification.permission === 'granted');

    // Initialize Firebase Messaging
    try {
      const app = getFirebaseApp();
      const msg = getMessaging(app);
      setMessaging(msg);
    } catch (err) {
      console.error('Failed to initialize FCM:', err);
      setError(err instanceof Error ? err : new Error('FCM initialization failed'));
    }
  }, [isSupported]);

  // Register service worker and get token if permission already granted
  useEffect(() => {
    if (!isSupported || !isPermissionGranted || !messaging) return;

    let isMounted = true;

    const initializeToken = async () => {
      try {
        // Register service worker
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        await navigator.serviceWorker.ready;

        // Get FCM token
        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        if (!vapidKey) {
          throw new Error('VAPID key not configured');
        }

        const fcmToken = await getToken(messaging, {
          vapidKey,
          serviceWorkerRegistration: registration,
        });

        if (isMounted && fcmToken) {
          setToken(fcmToken);
          options.onTokenChange?.(fcmToken);
        }
      } catch (err) {
        console.error('Failed to get FCM token:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to get FCM token'));
        }
      }
    };

    initializeToken();

    return () => {
      isMounted = false;
    };
  }, [isSupported, isPermissionGranted, messaging, options]);

  // Listen for foreground messages
  useEffect(() => {
    if (!messaging || !options.onMessage) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      options.onMessage?.(payload);
    });

    return () => unsubscribe();
  }, [messaging, options]);

  // Request permission and get token
  const requestPermission = useCallback(async (): Promise<string | null> => {
    if (!isSupported) {
      setError(new Error('FCM is not supported in this browser'));
      return null;
    }

    try {
      const permission = await Notification.requestPermission();
      setIsPermissionGranted(permission === 'granted');

      if (permission !== 'granted') {
        return null;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      await navigator.serviceWorker.ready;

      // Initialize messaging if not already
      const app = getFirebaseApp();
      const msg = getMessaging(app);
      setMessaging(msg);

      // Get FCM token
      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      if (!vapidKey) {
        throw new Error('VAPID key not configured');
      }

      const fcmToken = await getToken(msg, {
        vapidKey,
        serviceWorkerRegistration: registration,
      });

      if (fcmToken) {
        setToken(fcmToken);
        options.onTokenChange?.(fcmToken);
      }

      return fcmToken;
    } catch (err) {
      console.error('Failed to request FCM permission:', err);
      setError(err instanceof Error ? err : new Error('Failed to request permission'));
      return null;
    }
  }, [isSupported, options]);

  return {
    token,
    isSupported,
    isPermissionGranted,
    requestPermission,
    error,
  };
}
