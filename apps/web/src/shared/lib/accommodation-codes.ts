/**
 * Accommodation Codes Mapping
 * 숙소 시설/편의시설 코드를 다국어 레이블로 변환
 */

// ============================================
// FACILITY CODES
// ============================================

export const FACILITY_CODES = [
  'digital_lock',
  'refrigerator',
  'air_conditioner',
  'coffee_maker',
  'washer',
  'closet',
  'tv',
  'wifi',
  'cctv',
  'elevator',
  'parking',
  'microwave',
  'induction',
  'gas_stove',
  'oven',
  'dishwasher',
  'dryer',
  'iron',
  'desk',
  'chair',
] as const;

export type FacilityCode = (typeof FACILITY_CODES)[number];

// ============================================
// AMENITY CODES
// ============================================

export const AMENITY_CODES = [
  'hair_dryer',
  'shampoo',
  'conditioner',
  'body_wash',
  'soap',
  'towel',
  'toothbrush',
  'toothpaste',
  'slippers',
  'bathrobe',
  'tissue',
  'toilet_paper',
  'first_aid_kit',
  'fire_extinguisher',
  'hot_water',
] as const;

export type AmenityCode = (typeof AMENITY_CODES)[number];

// ============================================
// ACCOMMODATION TYPE CODES
// ============================================

export const ACCOMMODATION_TYPE_LABELS: Record<string, Record<string, string>> = {
  HOUSE: {
    ko: '하우스',
    en: 'House',
    ja: 'ハウス',
    zh: '独栋房屋',
    vi: 'Nhà riêng',
  },
  SHARE_ROOM: {
    ko: '쉐어 룸',
    en: 'Shared Room',
    ja: 'シェアルーム',
    zh: '合住房间',
    vi: 'Phòng chung',
  },
  SHARE_HOUSE: {
    ko: '쉐어 하우스',
    en: 'Share House',
    ja: 'シェアハウス',
    zh: '合租房',
    vi: 'Nhà chia sẻ',
  },
  APARTMENT: {
    ko: '아파트',
    en: 'Apartment',
    ja: 'アパート',
    zh: '公寓',
    vi: 'Căn hộ',
  },
};

export const BUILDING_TYPE_LABELS: Record<string, Record<string, string>> = {
  APARTMENT_VILLA: {
    ko: '아파트/빌라',
    en: 'Apartment/Villa',
    ja: 'アパート/ヴィラ',
    zh: '公寓/别墅',
    vi: 'Căn hộ/Biệt thự',
  },
  VILLA: {
    ko: '빌라',
    en: 'Villa',
    ja: 'ヴィラ',
    zh: '别墅',
    vi: 'Biệt thự',
  },
  HOUSE: {
    ko: '주택/단독주택',
    en: 'House/Detached',
    ja: '一戸建て',
    zh: '独栋房屋',
    vi: 'Nhà riêng',
  },
  HOTEL: {
    ko: '호텔',
    en: 'Hotel',
    ja: 'ホテル',
    zh: '酒店',
    vi: 'Khách sạn',
  },
  MOTEL: {
    ko: '모텔',
    en: 'Motel',
    ja: 'モーテル',
    zh: '汽车旅馆',
    vi: 'Nhà nghỉ',
  },
  DORMITORY: {
    ko: '기숙사/고시원',
    en: 'Dormitory/Goshiwon',
    ja: '寮/コシウォン',
    zh: '宿舍/考试院',
    vi: 'Ký túc xá',
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * 숙소 유형 레이블 반환
 */
export function getAccommodationTypeLabel(type: string | null, locale: string = 'en'): string {
  if (!type) return '';
  const labels = ACCOMMODATION_TYPE_LABELS[type.toUpperCase()];
  return labels?.[locale] || labels?.['en'] || type;
}

/**
 * 건물 유형 레이블 반환
 */
export function getBuildingTypeLabel(type: string | null, locale: string = 'en'): string {
  if (!type) return '';
  const labels = BUILDING_TYPE_LABELS[type.toUpperCase()];
  return labels?.[locale] || labels?.['en'] || type;
}

/**
 * 시설 코드가 유효한지 확인
 */
export function isValidFacilityCode(code: string): code is FacilityCode {
  return FACILITY_CODES.includes(code as FacilityCode);
}

/**
 * 편의시설 코드가 유효한지 확인
 */
export function isValidAmenityCode(code: string): code is AmenityCode {
  return AMENITY_CODES.includes(code as AmenityCode);
}

/**
 * snake_case를 camelCase로 변환
 * 예: digital_lock → digitalLock
 */
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * 시설 코드를 i18n 키로 변환
 * DB의 snake_case 코드를 i18n의 camelCase 키로 변환
 * 사용: t(`facilities.${getFacilityI18nKey(code)}`)
 * 예: digital_lock → digitalLock, WIFI → wifi
 */
export function getFacilityI18nKey(code: string): string {
  return snakeToCamel(code.toLowerCase());
}

/**
 * 편의시설 코드를 i18n 키로 변환
 * DB의 snake_case 코드를 i18n의 camelCase 키로 변환
 * 사용: t(`amenities.${getAmenityI18nKey(code)}`)
 * 예: hair_dryer → hairDryer, SHAMPOO → shampoo
 */
export function getAmenityI18nKey(code: string): string {
  return snakeToCamel(code.toLowerCase());
}
