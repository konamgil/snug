'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { getFirebaseAnalytics, logPageView, setAnalyticsUserId } from './analytics';
import { useAuthStore } from '@/shared/stores';

interface AnalyticsProviderProps {
  children: ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);

  // Initialize analytics on mount
  useEffect(() => {
    const initAnalytics = () => {
      try {
        getFirebaseAnalytics();
        console.log('Firebase Analytics initialized');
      } catch (error) {
        console.error('Failed to initialize Firebase Analytics:', error);
      }
    };

    initAnalytics();
  }, []);

  // Set user ID when user logs in/out
  useEffect(() => {
    if (user?.id) {
      setAnalyticsUserId(user.id);
    } else {
      setAnalyticsUserId(null);
    }
  }, [user?.id]);

  // Track page views on route changes
  useEffect(() => {
    if (pathname) {
      // Build full path with search params
      const url = searchParams?.toString() ? `${pathname}?${searchParams.toString()}` : pathname;

      logPageView(url, document.title);
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}
