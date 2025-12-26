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

// Default photo group options
export const DEFAULT_PHOTO_GROUPS = [
  { id: 'main', name: '대표사진', order: 0 },
  { id: 'room', name: '방', order: 1 },
  { id: 'living_room', name: '거실', order: 2 },
  { id: 'kitchen', name: '부엌', order: 3 },
  { id: 'bathroom', name: '화장실', order: 4 },
] as const;

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

// Facility options
export const FACILITY_OPTIONS = [
  { id: 'digital_lock', label: '디지털 도어락' },
  { id: 'refrigerator', label: '냉장고' },
  { id: 'air_conditioner', label: '컨디셔너' },
  { id: 'coffee_maker', label: '커피 메이커' },
  { id: 'washer', label: '세탁기' },
  { id: 'closet', label: '옷걸이' },
  { id: 'tv', label: 'TV' },
  { id: 'wifi', label: '와이파이' },
  { id: 'cctv', label: 'CCTV' },
] as const;

// Amenity options
export const AMENITY_OPTIONS = [
  { id: 'hair_dryer', label: '헤어 드라이어' },
  { id: 'shampoo', label: '샴푸' },
  { id: 'conditioner', label: '컨디셔너' },
  { id: 'body_wash', label: '바디워셔' },
  { id: 'soap', label: '비누' },
  { id: 'towel', label: '수건' },
  { id: 'toothbrush', label: '칫솔' },
  { id: 'toothpaste', label: '치약' },
] as const;

// Accommodation type options
export const ACCOMMODATION_TYPE_OPTIONS = [
  { id: 'house', label: '하우스' },
  { id: 'share_room', label: '쉐어 룸' },
  { id: 'share_house', label: '쉐어 하우스' },
  { id: 'apartment', label: '아파트/빌라' },
] as const;

// Building type options
export const BUILDING_TYPE_OPTIONS = [
  { id: 'apartment', label: '아파트' },
  { id: 'villa', label: '빌라' },
  { id: 'house', label: '단독주택' },
  { id: 'officetel', label: '오피스텔' },
] as const;

// Weekday options
export const WEEKDAY_OPTIONS = [
  { id: 'sun', label: '일요일' },
  { id: 'mon', label: '월요일' },
  { id: 'tue', label: '화요일' },
  { id: 'wed', label: '수요일' },
  { id: 'thu', label: '목요일' },
  { id: 'fri', label: '금요일' },
  { id: 'sat', label: '토요일' },
] as const;

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

// Usage type options for display
export const USAGE_TYPE_OPTIONS = [
  { id: 'stay', label: '숙박' },
  { id: 'short_term', label: '단기임대' },
] as const;

// Default form values
export const DEFAULT_FORM_DATA: AccommodationFormData = {
  mainPhotos: [],
  address: '',
  addressDetail: '',
  zipCode: '',
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
