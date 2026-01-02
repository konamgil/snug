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

// Accommodation code utilities
export {
  type FacilityCode,
  type AmenityCode,
  FACILITY_CODES,
  AMENITY_CODES,
  ACCOMMODATION_TYPE_LABELS,
  BUILDING_TYPE_LABELS,
  getAccommodationTypeLabel,
  getBuildingTypeLabel,
  isValidFacilityCode,
  isValidAmenityCode,
  getFacilityI18nKey,
  getAmenityI18nKey,
} from './accommodation-codes';

// Server Action utilities
export { ServerActionError, isVersionMismatchError, safeAction, wrapAction } from './safe-action';

// Version check utilities (global error handler for Server Action mismatch)
export { useVersionCheck, VersionCheckProvider } from './version-check';

// Debounce utilities
export { useDebouncedCallback, useDebouncedValue } from './use-debounce';
