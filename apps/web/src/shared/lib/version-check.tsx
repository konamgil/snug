'use client';

import { useEffect } from 'react';

/**
 * Server Action 버전 불일치 감지 및 자동 새로고침
 *
 * 배포 후 클라이언트가 이전 버전의 JS 번들을 캐시하고 있을 때
 * "Failed to find Server Action" 에러가 발생할 수 있음.
 * 이 훅은 해당 에러를 감지하고 자동으로 페이지를 새로고침함.
 */
export function useVersionCheck() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Server Action 버전 불일치 에러 감지
      if (event.message?.includes('Failed to find Server Action')) {
        console.warn('[VersionCheck] Server Action mismatch detected, reloading...');
        window.location.reload();
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const message = event.reason?.message || event.reason?.toString() || '';
      if (message.includes('Failed to find Server Action')) {
        console.warn('[VersionCheck] Server Action mismatch detected, reloading...');
        window.location.reload();
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
}

/**
 * 버전 체크 Provider 컴포넌트
 * 앱 최상단에 배치하여 전역 에러 핸들링
 */
export function VersionCheckProvider({ children }: { children: React.ReactNode }) {
  useVersionCheck();
  return <>{children}</>;
}
