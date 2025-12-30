import { useCallback, useRef, useEffect, useState } from 'react';

/**
 * 디바운스된 콜백을 반환하는 훅
 * 마지막 호출 후 지정된 지연 시간이 지나야 실행됨
 *
 * @param callback - 디바운스할 함수
 * @param delay - 지연 시간 (ms)
 * @returns 디바운스된 함수
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number,
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  // 콜백 레퍼런스 업데이트 (최신 클로저 유지)
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay],
  );
}

/**
 * 디바운스된 값을 반환하는 훅
 * 값이 변경된 후 지정된 지연 시간이 지나야 새 값 반환
 *
 * @param value - 디바운스할 값
 * @param delay - 지연 시간 (ms)
 * @returns 디바운스된 값
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
