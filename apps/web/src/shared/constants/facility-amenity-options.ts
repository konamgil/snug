/**
 * Filter options for facilities and amenities
 * Used in search filter modal and room detail page
 */

import {
  FACILITY_CODES,
  AMENITY_CODES,
  getFacilityI18nKey,
  getAmenityI18nKey,
} from '../lib/accommodation-codes';

interface FilterOption {
  key: string;
  label: string;
}

interface SelectionOption {
  id: string;
  label: string;
}

// ============================================
// FACILITY/AMENITY CATEGORIES (for room detail)
// ============================================

export const KITCHEN_AMENITIES = [
  'refrigerator',
  'microwave',
  'induction',
  'gas_stove',
  'oven',
  'dishwasher',
  'coffee_maker',
];

export const LAUNDRY_AMENITIES = ['washer', 'dryer', 'iron'];

export const PARKING_FACILITIES = ['parking', 'elevator'];

// ============================================
// FILTER OPTIONS (for search filter modal)
// ============================================

/**
 * Get facility options for filter modal
 * @param t - Translation function for facilities namespace
 * @param allLabel - Label for "All" option
 */
export function getFilterFacilityOptions(
  t: (key: string) => string,
  allLabel: string,
): FilterOption[] {
  const options: FilterOption[] = [{ key: 'all', label: allLabel }];

  for (const code of FACILITY_CODES) {
    const i18nKey = getFacilityI18nKey(code);
    options.push({
      key: code,
      label: t(i18nKey),
    });
  }

  return options;
}

/**
 * Get amenity options for filter modal
 * @param t - Translation function for amenities namespace
 * @param allLabel - Label for "All" option
 */
export function getFilterAmenityOptions(
  t: (key: string) => string,
  allLabel: string,
): FilterOption[] {
  const options: FilterOption[] = [{ key: 'all', label: allLabel }];

  for (const code of AMENITY_CODES) {
    const i18nKey = getAmenityI18nKey(code);
    options.push({
      key: code,
      label: t(i18nKey),
    });
  }

  return options;
}

// ============================================
// SELECTION OPTIONS (for host selection modal)
// ============================================

/**
 * Get facility options for selection modal (host page)
 * @param t - Translation function for facilities namespace
 */
export function getFacilityOptions(t: (key: string) => string): SelectionOption[] {
  return FACILITY_CODES.map((code) => ({
    id: code,
    label: t(getFacilityI18nKey(code)),
  }));
}

/**
 * Get amenity options for selection modal (host page)
 * @param t - Translation function for amenities namespace
 */
export function getAmenityOptions(t: (key: string) => string): SelectionOption[] {
  return AMENITY_CODES.map((code) => ({
    id: code,
    label: t(getAmenityI18nKey(code)),
  }));
}
