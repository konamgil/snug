'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, Suspense, type ReactNode } from 'react';
import { EasterEggProvider, VersionCheckProvider } from '@/shared/lib';
import { AnalyticsProvider, FCMProvider } from '@/shared/lib/firebase';
import {
  AuthProvider,
  CurrencyProvider,
  GoogleMapsProvider,
  NavigationLoadingProvider,
} from '@/shared/providers';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <VersionCheckProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Suspense fallback={null}>
            <AnalyticsProvider>
              <FCMProvider>
                <CurrencyProvider>
                  <GoogleMapsProvider>
                    <NavigationLoadingProvider>
                      <EasterEggProvider>{children}</EasterEggProvider>
                    </NavigationLoadingProvider>
                  </GoogleMapsProvider>
                </CurrencyProvider>
              </FCMProvider>
            </AnalyticsProvider>
          </Suspense>
        </AuthProvider>
      </QueryClientProvider>
    </VersionCheckProvider>
  );
}
