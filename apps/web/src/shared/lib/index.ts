export { cn } from './utils';
export { EasterEggProvider, useEasterEgg } from './easter-egg-context';

// Currency utilities
export {
  type CurrencyCode,
  type CurrencyConfig,
  CURRENCIES,
  BASE_CURRENCY,
  SUPPORTED_CURRENCIES,
  formatPrice,
  formatPriceCompact,
  formatMonthlyPrice,
  formatNightlyPrice,
  getCurrencySymbol,
  getCurrencyConfig,
  isValidCurrency,
} from './currency';

// Exchange rate utilities
export {
  type ExchangeRates,
  getExchangeRates,
  convertCurrency,
  convertCurrencySync,
  getRate,
  refreshExchangeRates,
  formatExchangeRate,
} from './exchange-rate';
