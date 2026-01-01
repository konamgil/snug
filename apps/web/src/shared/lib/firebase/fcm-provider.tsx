'use client';

import { createContext, useContext, useEffect, useCallback, useState, type ReactNode } from 'react';
import { useFCM } from './use-fcm';
import { useAuthStore } from '@/shared/stores';
import { registerFcmToken } from '@/shared/api/notifications';

interface FCMContextValue {
  token: string | null;
  isSupported: boolean;
  isPermissionGranted: boolean;
  requestPermission: () => Promise<string | null>;
  error: Error | null;
}

const FCMContext = createContext<FCMContextValue | null>(null);

export function useFCMContext() {
  const context = useContext(FCMContext);
  if (!context) {
    throw new Error('useFCMContext must be used within FCMProvider');
  }
  return context;
}

interface FCMProviderProps {
  children: ReactNode;
}

export function FCMProvider({ children }: FCMProviderProps) {
  const user = useAuthStore((state) => state.user);
  const session = useAuthStore((state) => state.session);
  const isAuthenticated = !!session;
  const [isTokenSaved, setIsTokenSaved] = useState(false);

  // 토큰 저장 콜백
  const handleTokenChange = useCallback(
    async (token: string) => {
      if (!isAuthenticated || !user?.id || isTokenSaved) return;

      try {
        const result = await registerFcmToken(token, 'web');
        if (result) {
          setIsTokenSaved(true);
          console.log('FCM token saved successfully');
        }
      } catch (error) {
        console.error('Failed to save FCM token:', error);
      }
    },
    [isAuthenticated, user?.id, isTokenSaved],
  );

  // 메시지 수신 콜백
  const handleMessage = useCallback((payload: unknown) => {
    console.log('FCM message received:', payload);

    // 포그라운드 메시지는 토스트로 표시 (나중에 구현)
    const data = payload as {
      notification?: { title?: string; body?: string };
    };

    if (data.notification) {
      // TODO: 토스트 알림 표시
      console.log(`알림: ${data.notification.title} - ${data.notification.body}`);
    }
  }, []);

  const fcm = useFCM({
    onTokenChange: handleTokenChange,
    onMessage: handleMessage,
  });

  // 로그인 시 자동으로 FCM 토큰 요청 (이미 권한이 있는 경우)
  useEffect(() => {
    if (isAuthenticated && fcm.isPermissionGranted && !fcm.token) {
      fcm.requestPermission();
    }
  }, [isAuthenticated, fcm.isPermissionGranted, fcm.token, fcm]);

  // 토큰이 변경되면 저장
  useEffect(() => {
    const token = fcm.token;
    if (token && isAuthenticated) {
      const timeoutId = setTimeout(() => {
        handleTokenChange(token);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [fcm.token, isAuthenticated, handleTokenChange]);

  // 로그아웃 시 토큰 상태 리셋
  useEffect(() => {
    if (!isAuthenticated) {
      const timeoutId = setTimeout(() => {
        setIsTokenSaved(false);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [isAuthenticated]);

  return <FCMContext.Provider value={fcm}>{children}</FCMContext.Provider>;
}
