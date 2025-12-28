// Accommodation Types

export type AccommodationType = 'house' | 'share_room' | 'share_house' | 'apartment';
export type BuildingType = 'apartment' | 'villa' | 'house' | 'officetel';
export type UsageType = 'stay' | 'short_term';
export type GenderRule = 'male_only' | 'female_only' | 'pet_allowed';

export interface PhotoCategory {
  id: string;
  name: string;
  photos: PhotoItem[];
  order: number;
}

export interface PhotoItem {
  id: string;
  url: string;
  order: number;
}

// Default photo group options (labels come from translations: host.accommodation.photoGroups.*)
export const DEFAULT_PHOTO_GROUPS = [
  { id: 'main', order: 0 },
  { id: 'room', order: 1 },
  { id: 'living_room', order: 2 },
  { id: 'kitchen', order: 3 },
  { id: 'bathroom', order: 4 },
] as const;

export type PhotoGroupId = (typeof DEFAULT_PHOTO_GROUPS)[number]['id'];

export interface RoomCount {
  room: number;
  livingRoom: number;
  kitchen: number;
  bathroom: number;
  terrace: number;
}

export interface BedCount {
  king: number;
  queen: number;
  single: number;
  superSingle: number;
  bunkBed: number;
}

export interface AdditionalFeeItem {
  id: string;
  name: string;
  amount: number;
}

export interface PricingInfo {
  basePrice: number;
  includesUtilities: boolean;
  weekendPrice?: number;
  weekendDays: string[]; // 'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'
  managementFee?: number;
  cleaningFee?: number;
  extraPersonFee?: number;
  petFee?: number;
  additionalFees: AdditionalFeeItem[];
}

export interface SpaceInfo {
  capacity: number;
  genderRules: GenderRule[];
  sizeM2?: number;
  sizePyeong?: number;
  rooms: RoomCount;
  beds: BedCount;
  houseRules?: string;
  introduction?: string;
}

export interface ManagerInfo {
  id: string;
  name: string;
  phone: string;
  additionalInfo?: string;
}

export interface AccommodationFormData {
  // Basic Info
  mainPhotos: PhotoCategory[];
  address: string;
  addressDetail: string;
  zipCode: string;
  // 구조화된 주소 (다음 주소 API에서 파싱)
  roadAddress?: string; // 도로명 주소
  sido?: string; // 시/도 (서울특별시)
  sigungu?: string; // 시/군/구 (강남구)
  bname?: string; // 법정동/리 (역삼동)
  buildingName?: string; // 건물명
  // 좌표 (Geocoding 결과)
  latitude?: number;
  longitude?: number;
  usageTypes: UsageType[];
  minReservationDays: number;
  groupName?: string;
  accommodationType: AccommodationType;
  roomName: string;
  buildingType?: BuildingType;

  // Pricing
  pricing: PricingInfo;

  // Space
  space: SpaceInfo;

  // Facilities & Amenities
  facilities: string[];
  amenities: string[];

  // Manager
  managers: ManagerInfo[];

  // Meta
  isOperating: boolean;
  openDate?: string;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
}

// Facility options (labels come from translations: host.facilities.*)
export const FACILITY_OPTIONS = [
  'digitalLock',
  'refrigerator',
  'airConditioner',
  'conditioner',
  'coffeeMaker',
  'washer',
  'closet',
  'tv',
  'wifi',
  'cctv',
] as const;

export type FacilityId = (typeof FACILITY_OPTIONS)[number];

// Amenity options (labels come from translations: host.amenities.*)
export const AMENITY_OPTIONS = ['hairDryer', 'shampoo', 'conditioner', 'bodyWash', 'soap'] as const;

export type AmenityId = (typeof AMENITY_OPTIONS)[number];

// Accommodation type options (labels come from translations: host.accommodation.accommodationTypes.*)
export const ACCOMMODATION_TYPE_OPTIONS = [
  'house',
  'share_room',
  'share_house',
  'apartment',
] as const;

// Building type options (labels come from translations: host.accommodation.buildingTypes.*)
export const BUILDING_TYPE_OPTIONS = ['apartment', 'villa', 'house', 'officetel'] as const;

// Weekday options (labels come from translations: host.accommodation.weekdays.*)
export const WEEKDAY_OPTIONS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

export type WeekdayId = (typeof WEEKDAY_OPTIONS)[number];

// List Item for accommodation list page
export interface AccommodationListItem {
  id: string;
  thumbnailUrl: string;
  groupName?: string;
  roomName: string;
  nickname?: string;
  usageType: UsageType;
  isOperating: boolean;
  // Detail info
  pricing: {
    nights: number;
    includesUtilities: boolean;
    totalPrice: number;
  };
  address: string;
  sharedSpace: {
    totalSizeM2: number;
    description: string;
  };
  privateSpace: {
    sizeM2: number;
    description: string;
  };
  houseRule?: string;
}

// Filter type for list
export type AccommodationListFilter = 'all' | 'operating' | 'not_operating';

// Usage type options for display (labels come from translations: host.accommodation.usageTypes.*)
export const USAGE_TYPE_OPTIONS = ['stay', 'short_term'] as const;

// Default form values
export const DEFAULT_FORM_DATA: AccommodationFormData = {
  mainPhotos: [],
  address: '',
  addressDetail: '',
  zipCode: '',
  roadAddress: '',
  sido: '',
  sigungu: '',
  bname: '',
  buildingName: '',
  usageTypes: [],
  minReservationDays: 1,
  groupName: '',
  accommodationType: 'house',
  roomName: '',
  buildingType: undefined,
  pricing: {
    basePrice: 0,
    includesUtilities: false,
    weekendPrice: undefined,
    weekendDays: [],
    managementFee: undefined,
    cleaningFee: undefined,
    extraPersonFee: undefined,
    petFee: undefined,
    additionalFees: [],
  },
  space: {
    capacity: 1,
    genderRules: [],
    sizeM2: undefined,
    sizePyeong: undefined,
    rooms: {
      room: 0,
      livingRoom: 0,
      kitchen: 0,
      bathroom: 0,
      terrace: 0,
    },
    beds: {
      king: 0,
      queen: 0,
      single: 0,
      superSingle: 0,
      bunkBed: 0,
    },
    houseRules: '',
    introduction: '',
  },
  facilities: [],
  amenities: [],
  managers: [],
  isOperating: false,
  openDate: '',
  lastModifiedBy: '',
  lastModifiedAt: '',
};
