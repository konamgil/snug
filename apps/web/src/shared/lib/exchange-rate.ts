/**
 * Exchange Rate Utilities
 * 환율 조회 및 변환 유틸리티
 *
 * 서버 API를 통해 일관된 환율 제공
 * 환율은 매일 자정(KST) 업데이트됨
 */

import { type CurrencyCode, BASE_CURRENCY, CURRENCIES } from './currency';
import { config } from '@/shared/config';

/**
 * 환율 데이터 인터페이스
 */
export interface ExchangeRateData {
  currency: string;
  rate: number;
  inverseRate: number;
  displayRate: number;
  marginPercent: number;
  fetchedAt: string;
}

export interface ExchangeRates {
  base: CurrencyCode;
  rates: Record<CurrencyCode, number>;
  updatedAt: Date;
}

/**
 * 캐시 키
 */
const CACHE_KEY = 'snug_exchange_rates_v2';
const CACHE_TTL = 5 * 60 * 1000; // 5분 (서버 데이터 캐싱)

/**
 * 초기 폴백 환율 (캐시도 없고 API도 실패할 때만 사용)
 * 최초 접속 시에만 사용되는 최후의 수단
 */
const INITIAL_FALLBACK_RATES: Record<CurrencyCode, number> = {
  KRW: 1,
  USD: 0.00074, // 1 KRW = 0.00074 USD (약 1350원)
  JPY: 0.11, // 1 KRW = 0.11 JPY
  CNY: 0.0053, // 1 KRW = 0.0053 CNY
  EUR: 0.00068, // 1 KRW = 0.00068 EUR
};

/**
 * localStorage에서 캐시된 환율 조회 (TTL 무시 옵션)
 * @param ignoreTTL - true면 만료된 캐시도 반환 (폴백용)
 */
function getCachedRates(ignoreTTL = false): ExchangeRates | null {
  if (typeof window === 'undefined') return null;

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data = JSON.parse(cached) as ExchangeRates & { updatedAt: string; cachedAt: number };

    // TTL 확인 (ignoreTTL이면 만료되어도 반환)
    if (!ignoreTTL && Date.now() - data.cachedAt > CACHE_TTL) {
      return null;
    }

    return {
      ...data,
      updatedAt: new Date(data.updatedAt),
    };
  } catch {
    return null;
  }
}

/**
 * 환율 캐시 저장
 */
function setCachedRates(rates: ExchangeRates): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        ...rates,
        cachedAt: Date.now(),
      }),
    );
  } catch {
    // Intentionally ignore localStorage errors (SSR, incognito mode, quota exceeded)
    void 0;
  }
}

/**
 * 서버 API에서 환율 조회
 */
async function fetchExchangeRatesFromAPI(): Promise<ExchangeRates> {
  try {
    const response = await fetch(`${config.api.baseUrl}/exchange-rates`, {
      next: { revalidate: 300 }, // Next.js 5분 캐싱
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // API 응답을 ExchangeRates 형식으로 변환
    // 초기 폴백 환율로 초기화 후 API 데이터로 덮어쓰기
    const rates: Record<CurrencyCode, number> = { ...INITIAL_FALLBACK_RATES };

    for (const rateData of data.rates || []) {
      const currency = rateData.currency as CurrencyCode;
      // displayRate 사용 (마진 적용된 환율)
      if (currency in rates) {
        rates[currency] = rateData.displayRate;
      }
    }

    const exchangeRates: ExchangeRates = {
      base: BASE_CURRENCY,
      rates,
      updatedAt: new Date(data.updatedAt),
    };

    // 캐시 저장
    setCachedRates(exchangeRates);

    return exchangeRates;
  } catch (error) {
    console.error('Failed to fetch exchange rates from API:', error);

    // 1순위: 만료된 캐시라도 사용 (이전에 수집된 환율)
    const expiredCache = getCachedRates(true);
    if (expiredCache) {
      console.warn('Using expired cached exchange rates as fallback');
      return expiredCache;
    }

    // 2순위: 초기 폴백 환율 (캐시도 없을 때만)
    console.warn('No cached rates available, using initial fallback rates');
    return {
      base: BASE_CURRENCY,
      rates: INITIAL_FALLBACK_RATES,
      updatedAt: new Date(),
    };
  }
}

/**
 * 환율 조회 (캐시 우선)
 *
 * @example
 * const rates = await getExchangeRates();
 * console.log(rates.rates.USD); // 0.00074
 */
export async function getExchangeRates(): Promise<ExchangeRates> {
  // 캐시 확인
  const cached = getCachedRates();
  if (cached) {
    return cached;
  }

  // API 호출
  return fetchExchangeRatesFromAPI();
}

/**
 * 금액 환율 변환
 *
 * @param amount - 변환할 금액
 * @param from - 원래 통화
 * @param to - 목표 통화
 * @param rates - 환율 데이터 (없으면 폴백 사용)
 * @returns 변환된 금액
 *
 * @example
 * // KRW → USD
 * const usd = convertCurrency(1500000, 'KRW', 'USD', rates);
 * // 결과: 약 1111
 */
export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  rates?: ExchangeRates,
): number {
  if (from === to) return amount;

  const exchangeRates = rates?.rates ?? getCachedRates(true)?.rates ?? INITIAL_FALLBACK_RATES;

  // KRW 기준으로 변환
  // 1. from → KRW
  const amountInKRW = from === 'KRW' ? amount : amount / exchangeRates[from];

  // 2. KRW → to
  const converted = to === 'KRW' ? amountInKRW : amountInKRW * exchangeRates[to];

  // 3. 통화별 소수점에 맞게 올림
  const { decimals } = CURRENCIES[to];
  const multiplier = Math.pow(10, decimals);
  return Math.ceil(converted * multiplier) / multiplier;
}

/**
 * 동기식 환율 변환 (폴백 환율 사용)
 * React 컴포넌트에서 즉시 사용 가능
 *
 * @example
 * const usd = convertCurrencySync(1500000, 'KRW', 'USD');
 */
export function convertCurrencySync(amount: number, from: CurrencyCode, to: CurrencyCode): number {
  return convertCurrency(amount, from, to);
}

/**
 * 특정 통화의 환율 반환 (KRW 기준)
 */
export function getRate(currency: CurrencyCode, rates?: ExchangeRates): number {
  if (currency === 'KRW') return 1;
  return (
    rates?.rates[currency] ??
    getCachedRates(true)?.rates[currency] ??
    INITIAL_FALLBACK_RATES[currency]
  );
}

/**
 * 환율 캐시 강제 새로고침
 */
export async function refreshExchangeRates(): Promise<ExchangeRates> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CACHE_KEY);
  }
  return fetchExchangeRatesFromAPI();
}

/**
 * 환율 정보 문자열 반환
 * 예: "1 USD = ₩1,350"
 */
export function formatExchangeRate(currency: CurrencyCode, rates?: ExchangeRates): string {
  if (currency === 'KRW') return '1 KRW = ₩1';

  const rate = getRate(currency, rates);
  const krwAmount = Math.round(1 / rate);

  return `1 ${currency} = ₩${krwAmount.toLocaleString()}`;
}
