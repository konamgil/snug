'use client';

import { useEffect } from 'react';

/**
 * 전역 에러 바운더리
 *
 * Server Action 해시 불일치 등 치명적 에러 처리
 * - 배포 후 클라이언트 캐시와 서버 불일치
 * - "Failed to find Server Action" 에러
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러 로깅
    console.error('[GlobalError]', error);
  }, [error]);

  // Server Action 해시 불일치 에러 감지
  const isServerActionError =
    error.message?.includes('Failed to find Server Action') ||
    error.message?.includes('older or newer deployment');

  // 페이지 새로고침
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <html>
      <body>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: '400px' }}>
            {isServerActionError ? (
              <>
                <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>
                  새 버전이 배포되었습니다
                </h2>
                <p style={{ color: '#666', marginBottom: '24px' }}>
                  페이지를 새로고침하여 최신 버전을 사용해주세요.
                </p>
                <button
                  onClick={handleRefresh}
                  style={{
                    padding: '12px 24px',
                    fontSize: '16px',
                    backgroundColor: '#000',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  새로고침
                </button>
              </>
            ) : (
              <>
                <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>
                  오류가 발생했습니다
                </h2>
                <p style={{ color: '#666', marginBottom: '24px' }}>
                  일시적인 문제가 발생했습니다. 다시 시도해주세요.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button
                    onClick={reset}
                    style={{
                      padding: '12px 24px',
                      fontSize: '16px',
                      backgroundColor: '#fff',
                      color: '#000',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    다시 시도
                  </button>
                  <button
                    onClick={handleRefresh}
                    style={{
                      padding: '12px 24px',
                      fontSize: '16px',
                      backgroundColor: '#000',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    새로고침
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
