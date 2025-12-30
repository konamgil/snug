'use client';

/**
 * Server Action 안전 호출 유틸리티
 *
 * 배포 후 Server Action 해시 불일치 에러를 감지하고 처리합니다.
 * - "Failed to find Server Action" 에러 감지
 * - 자동 페이지 새로고침 또는 사용자 알림
 */

export class ServerActionError extends Error {
  constructor(
    message: string,
    public readonly isVersionMismatch: boolean = false,
  ) {
    super(message);
    this.name = 'ServerActionError';
  }
}

/**
 * Server Action 버전 불일치 에러인지 확인
 */
export function isVersionMismatchError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message?.includes('Failed to find Server Action') ||
      error.message?.includes('older or newer deployment')
    );
  }
  return false;
}

/**
 * Server Action을 안전하게 호출
 *
 * @example
 * const result = await safeAction(
 *   () => createAccommodation(data),
 *   {
 *     onVersionMismatch: () => toast.error('새 버전이 배포되었습니다. 새로고침해주세요.'),
 *   }
 * );
 */
export async function safeAction<T>(
  action: () => Promise<T>,
  options?: {
    /** 버전 불일치 시 호출 */
    onVersionMismatch?: () => void;
    /** 자동 새로고침 (기본: false) */
    autoRefresh?: boolean;
    /** 에러 발생 시 호출 */
    onError?: (error: Error) => void;
  },
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    if (isVersionMismatchError(error)) {
      console.warn('[safeAction] Server Action version mismatch detected');

      if (options?.onVersionMismatch) {
        options.onVersionMismatch();
      }

      if (options?.autoRefresh) {
        // 약간의 딜레이 후 새로고침 (토스트 메시지 표시 시간)
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }

      throw new ServerActionError(
        '새 버전이 배포되었습니다. 페이지를 새로고침해주세요.',
        true,
      );
    }

    if (options?.onError && error instanceof Error) {
      options.onError(error);
    }

    throw error;
  }
}

/**
 * Server Action 래퍼 생성
 *
 * 기존 Server Action을 감싸서 버전 불일치 처리 추가
 *
 * @example
 * const safeCreateAccommodation = wrapAction(createAccommodation, {
 *   onVersionMismatch: () => toast.error('새로고침이 필요합니다'),
 * });
 */
export function wrapAction<TArgs extends unknown[], TReturn>(
  action: (...args: TArgs) => Promise<TReturn>,
  options?: {
    onVersionMismatch?: () => void;
    autoRefresh?: boolean;
    onError?: (error: Error) => void;
  },
): (...args: TArgs) => Promise<TReturn> {
  return async (...args: TArgs) => {
    return safeAction(() => action(...args), options);
  };
}
