/**
 * Currency Configuration and Formatting Utilities
 * 통화 설정 및 포맷팅 유틸리티
 */

export type CurrencyCode = 'KRW' | 'USD' | 'JPY' | 'CNY' | 'EUR';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
  decimals: number;
}

/**
 * 지원되는 통화 설정
 */
export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  KRW: {
    code: 'KRW',
    symbol: '₩',
    name: '한국 원',
    locale: 'ko-KR',
    decimals: 0,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    locale: 'en-US',
    decimals: 2,
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: '日本円',
    locale: 'ja-JP',
    decimals: 0,
  },
  CNY: {
    code: 'CNY',
    symbol: '¥',
    name: '人民币',
    locale: 'zh-CN',
    decimals: 2,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    locale: 'de-DE',
    decimals: 2,
  },
};

/**
 * 기본 통화 (데이터베이스에 저장된 가격의 기준 통화)
 */
export const BASE_CURRENCY: CurrencyCode = 'KRW';

/**
 * 지원되는 통화 목록
 */
export const SUPPORTED_CURRENCIES: CurrencyCode[] = ['KRW', 'USD', 'JPY', 'CNY', 'EUR'];

/**
 * 숫자를 통화 형식으로 포맷팅
 *
 * @param amount - 금액
 * @param currency - 통화 코드
 * @param options - 추가 옵션
 * @returns 포맷팅된 문자열
 *
 * @example
 * formatPrice(1500000, 'KRW') // "₩1,500,000"
 * formatPrice(1234.56, 'USD') // "$1,234.56"
 * formatPrice(1500000, 'KRW', { compact: true }) // "₩150만"
 */
export function formatPrice(
  amount: number,
  currency: CurrencyCode = 'KRW',
  options: {
    compact?: boolean;
    showSymbol?: boolean;
    showCode?: boolean;
  } = {},
): string {
  const { compact = false, showSymbol = true, showCode = false } = options;
  const config = CURRENCIES[currency];

  if (!config) {
    console.warn(`Unknown currency: ${currency}, falling back to KRW`);
    return formatPrice(amount, 'KRW', options);
  }

  const formatter = new Intl.NumberFormat(config.locale, {
    style: showSymbol ? 'currency' : 'decimal',
    currency: currency,
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
    notation: compact ? 'compact' : 'standard',
  });

  let formatted = formatter.format(amount);

  // showCode 옵션이 있으면 통화 코드 추가
  if (showCode && !showSymbol) {
    formatted = `${formatted} ${currency}`;
  }

  return formatted;
}

/**
 * 통화 기호만 반환
 */
export function getCurrencySymbol(currency: CurrencyCode): string {
  return CURRENCIES[currency]?.symbol ?? '₩';
}

/**
 * 통화 설정 반환
 */
export function getCurrencyConfig(currency: CurrencyCode): CurrencyConfig {
  return CURRENCIES[currency] ?? CURRENCIES.KRW;
}

/**
 * 통화 코드가 유효한지 확인
 */
export function isValidCurrency(currency: string): currency is CurrencyCode {
  return SUPPORTED_CURRENCIES.includes(currency as CurrencyCode);
}

/**
 * 가격을 간략하게 표시 (한국식)
 * 예: 1500000 → "150만원"
 */
export function formatPriceCompact(amount: number, currency: CurrencyCode = 'KRW'): string {
  if (currency === 'KRW') {
    if (amount >= 100000000) {
      return `${(amount / 100000000).toFixed(0)}억원`;
    }
    if (amount >= 10000) {
      return `${(amount / 10000).toFixed(0)}만원`;
    }
    return `${amount.toLocaleString()}원`;
  }

  return formatPrice(amount, currency, { compact: true });
}

/**
 * 월세 표시용 포맷
 * 예: "₩1,500,000/월" 또는 "$1,200/mo"
 */
export function formatMonthlyPrice(
  amount: number,
  currency: CurrencyCode = 'KRW',
  locale: string = 'ko',
): string {
  const formatted = formatPrice(amount, currency);
  const suffix = locale === 'ko' ? '/월' : '/mo';
  return `${formatted}${suffix}`;
}

/**
 * 1박 가격 표시용 포맷
 * 예: "₩150,000/박" 또는 "$120/night"
 */
export function formatNightlyPrice(
  amount: number,
  currency: CurrencyCode = 'KRW',
  locale: string = 'ko',
): string {
  const formatted = formatPrice(amount, currency);
  const suffix = locale === 'ko' ? '/박' : '/night';
  return `${formatted}${suffix}`;
}
