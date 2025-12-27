'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { useAuthStore } from '@/shared/stores';
import {
  type CurrencyCode,
  type ExchangeRates,
  BASE_CURRENCY,
  formatPrice,
  formatPriceCompact,
  formatMonthlyPrice,
  formatNightlyPrice,
  getExchangeRates,
  convertCurrency,
  isValidCurrency,
} from '@/shared/lib';

/**
 * Currency Context Value
 */
interface CurrencyContextValue {
  /** 현재 선택된 통화 */
  currency: CurrencyCode;
  /** 환율 데이터 (로딩 중이면 undefined) */
  rates: ExchangeRates | undefined;
  /** 환율 로딩 중 */
  isLoading: boolean;
  /** 통화 변경 (로컬만, DB 저장은 Settings에서) */
  setCurrency: (currency: CurrencyCode) => void;
  /**
   * 금액을 현재 통화로 변환하고 포맷팅
   * @param amount - KRW 기준 금액
   */
  format: (amount: number, options?: { compact?: boolean }) => string;
  /**
   * 월세 포맷 (예: ₩1,500,000/월)
   */
  formatMonthly: (amount: number) => string;
  /**
   * 1박 가격 포맷 (예: ₩150,000/박)
   */
  formatNightly: (amount: number) => string;
  /**
   * 금액만 변환 (포맷팅 없이)
   * @param amount - KRW 기준 금액
   */
  convert: (amount: number) => number;
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

interface CurrencyProviderProps {
  children: ReactNode;
  /** 초기 통화 (SSR용) */
  initialCurrency?: CurrencyCode;
}

/**
 * Currency Provider
 * 전역 통화 설정 및 환율 변환 제공
 */
export function CurrencyProvider({ children, initialCurrency = 'KRW' }: CurrencyProviderProps) {
  const user = useAuthStore((state) => state.user);

  // 사용자 설정에서 통화 가져오기 (없으면 초기값 사용)
  const userCurrency = user?.preferredCurrency;
  const defaultCurrency = isValidCurrency(userCurrency ?? '')
    ? (userCurrency as CurrencyCode)
    : initialCurrency;

  const [currency, setCurrencyState] = useState<CurrencyCode>(defaultCurrency);
  const [rates, setRates] = useState<ExchangeRates | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // 사용자 설정 변경 시 동기화
  useEffect(() => {
    if (userCurrency && isValidCurrency(userCurrency)) {
      setCurrencyState(userCurrency as CurrencyCode);
    }
  }, [userCurrency]);

  // 환율 로드
  useEffect(() => {
    let cancelled = false;

    async function loadRates() {
      setIsLoading(true);
      try {
        const exchangeRates = await getExchangeRates();
        if (!cancelled) {
          setRates(exchangeRates);
        }
      } catch (error) {
        console.error('Failed to load exchange rates:', error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    // KRW가 아닌 경우에만 환율 로드
    if (currency !== 'KRW') {
      loadRates();
    } else {
      setIsLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [currency]);

  // 통화 변경
  const setCurrency = useCallback((newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
  }, []);

  // 금액 변환
  const convert = useCallback(
    (amount: number): number => {
      if (currency === BASE_CURRENCY) return amount;
      return convertCurrency(amount, BASE_CURRENCY, currency, rates);
    },
    [currency, rates],
  );

  // 포맷팅 함수들
  const format = useCallback(
    (amount: number, options?: { compact?: boolean }): string => {
      const converted = convert(amount);
      if (options?.compact) {
        return formatPriceCompact(converted, currency);
      }
      return formatPrice(converted, currency);
    },
    [convert, currency],
  );

  const formatMonthly = useCallback(
    (amount: number): string => {
      const converted = convert(amount);
      return formatMonthlyPrice(converted, currency);
    },
    [convert, currency],
  );

  const formatNightly = useCallback(
    (amount: number): string => {
      const converted = convert(amount);
      return formatNightlyPrice(converted, currency);
    },
    [convert, currency],
  );

  const value: CurrencyContextValue = {
    currency,
    rates,
    isLoading,
    setCurrency,
    format,
    formatMonthly,
    formatNightly,
    convert,
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

/**
 * useCurrency Hook
 *
 * @example
 * const { format, formatMonthly, currency } = useCurrency();
 *
 * // 기본 포맷
 * format(1500000) // "₩1,500,000" 또는 "$1,111"
 *
 * // 월세 포맷
 * formatMonthly(1500000) // "₩1,500,000/월" 또는 "$1,111/mo"
 *
 * // 간략 포맷
 * format(1500000, { compact: true }) // "150만원" 또는 "$1.1K"
 */
export function useCurrency(): CurrencyContextValue {
  const context = useContext(CurrencyContext);

  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }

  return context;
}

/**
 * useCurrency를 안전하게 사용 (Provider 없어도 폴백)
 */
export function useCurrencySafe(): CurrencyContextValue {
  const context = useContext(CurrencyContext);

  // 폴백 값
  if (!context) {
    return {
      currency: 'KRW',
      rates: undefined,
      isLoading: false,
      setCurrency: () => {},
      format: (amount) => formatPrice(amount, 'KRW'),
      formatMonthly: (amount) => formatMonthlyPrice(amount, 'KRW'),
      formatNightly: (amount) => formatNightlyPrice(amount, 'KRW'),
      convert: (amount) => amount,
    };
  }

  return context;
}
