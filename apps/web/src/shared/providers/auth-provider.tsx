'use client';

import { useEffect, type ReactNode } from 'react';
import { useAuthStore } from '@/shared/stores';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const initialize = useAuthStore((state) => state.initialize);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // 초기화 완료 전에도 children을 렌더링 (로딩 UI는 각 페이지에서 처리)
  if (!isInitialized) {
    return null;
  }

  return <>{children}</>;
}
