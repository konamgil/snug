'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

/**
 * Locale 레벨 에러 바운더리
 *
 * 페이지 내 에러 처리 (레이아웃 유지)
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('common');

  useEffect(() => {
    console.error('[Error Boundary]', error);
  }, [error]);

  // Server Action 해시 불일치 에러 감지
  const isServerActionError =
    error.message?.includes('Failed to find Server Action') ||
    error.message?.includes('older or newer deployment');

  const handleRefresh = () => {
    window.location.reload();
  };

  if (isServerActionError) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-5">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-semibold mb-4">
            {t('newVersionAvailable', { defaultValue: '새 버전이 배포되었습니다' })}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('pleaseRefresh', { defaultValue: '페이지를 새로고침하여 최신 버전을 사용해주세요.' })}
          </p>
          <button
            onClick={handleRefresh}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            {t('refresh', { defaultValue: '새로고침' })}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-5">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-semibold mb-4">
          {t('errorOccurred', { defaultValue: '오류가 발생했습니다' })}
        </h2>
        <p className="text-gray-600 mb-6">
          {t('temporaryIssue', { defaultValue: '일시적인 문제가 발생했습니다. 다시 시도해주세요.' })}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t('retry', { defaultValue: '다시 시도' })}
          </button>
          <button
            onClick={handleRefresh}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            {t('refresh', { defaultValue: '새로고침' })}
          </button>
        </div>
      </div>
    </div>
  );
}
