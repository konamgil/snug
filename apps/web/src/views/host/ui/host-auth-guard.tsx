'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useAuthStore } from '@/shared/stores';

interface HostAuthGuardProps {
  children: React.ReactNode;
}

/**
 * Guard component that protects host routes
 * - Not logged in → redirect to login
 * - Logged in → can access host dashboard
 *
 * Note: Host/non-host routing is handled by the "Host Mode" button in the header.
 * This guard only checks login status.
 */
export function HostAuthGuard({ children }: HostAuthGuardProps) {
  const router = useRouter();
  const { user, isInitialized, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isInitialized || isLoading) return;

    // Not logged in → redirect to login
    if (!user) {
      router.replace('/login?redirect=/host');
    }
  }, [user, isInitialized, isLoading, router]);

  // Show loading while checking auth
  if (!isInitialized || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f5f5f5]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--snug-orange))]" />
      </div>
    );
  }

  // Redirect in progress (not logged in)
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f5f5f5]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--snug-orange))]" />
      </div>
    );
  }

  // User is logged in → allow access
  return <>{children}</>;
}
