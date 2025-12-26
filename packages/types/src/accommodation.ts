// Accommodation Types - Prisma 스키마와 동기화
// 순수 interface/type만 정의 (class-validator 없음)

// ============================================
// ENUMS
// ============================================

export type AccommodationType = 'HOUSE' | 'SHARE_ROOM' | 'SHARE_HOUSE' | 'APARTMENT';

export type BuildingType = 'APARTMENT' | 'VILLA' | 'HOUSE' | 'OFFICETEL';

export type UsageType = 'STAY' | 'SHORT_TERM';

export type GenderRule = 'MALE_ONLY' | 'FEMALE_ONLY' | 'PET_ALLOWED';

export type AccommodationStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE';

// ============================================
// INTERFACES
// ============================================

/**
 * 숙소 그룹 (선택적)
 * 여러 숙소를 그룹으로 묶어 관리
 */
export interface AccommodationGroup {
  id: string;
  hostId: string;
  name: string;
  address: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 숙소 사진
 */
export interface AccommodationPhoto {
  id: string;
  accommodationId: string;
  category: string; // main, room, living_room, kitchen, bathroom
  url: string;
  order: number;
  createdAt: Date;
}

/**
 * 숙소 시설
 */
export interface AccommodationFacility {
  id: string;
  accommodationId: string;
  facilityCode: string; // digital_lock, wifi, tv, ...
}

/**
 * 숙소 어메니티
 */
export interface AccommodationAmenity {
  id: string;
  accommodationId: string;
  amenityCode: string; // hair_dryer, towel, ...
}

/**
 * 숙소 담당자 (매니저)
 */
export interface AccommodationManager {
  id: string;
  accommodationId: string;
  name: string;
  phone: string;
  additionalInfo: string | null;
  createdAt: Date;
}

/**
 * 침대 개수 정보
 */
export interface BedCounts {
  king?: number;
  queen?: number;
  double?: number;
  single?: number;
  sofa?: number;
  bunk?: number;
}

/**
 * 숙소 (개별 방)
 */
export interface Accommodation {
  id: string;
  hostId: string;
  groupId: string | null;

  // 기본 정보
  roomName: string;
  accommodationType: AccommodationType;
  buildingType: BuildingType | null;
  usageTypes: UsageType[];
  minReservationDays: number;

  // 위치
  address: string;
  addressDetail: string | null;
  zipCode: string | null;
  latitude: number | null;
  longitude: number | null;
  nearestStation: string | null;
  walkingMinutes: number | null;

  // 가격
  basePrice: number;
  includesUtilities: boolean;
  weekendPrice: number | null;
  weekendDays: string[];
  managementFee: number | null;
  cleaningFee: number | null;
  extraPersonFee: number | null;
  petFee: number | null;

  // 공간 정보
  capacity: number;
  genderRules: GenderRule[];
  sizeM2: number | null;
  sizePyeong: number | null;

  // 방 개수
  roomCount: number;
  livingRoomCount: number;
  kitchenCount: number;
  bathroomCount: number;
  terraceCount: number;

  // 침대 개수 (JSON)
  bedCounts: BedCounts | null;

  // 텍스트 정보
  houseRules: string | null;
  introduction: string | null;

  // 상태
  status: AccommodationStatus;
  isOperating: boolean;
  openDate: Date | null;

  createdAt: Date;
  updatedAt: Date;

  // Relations (optional, 포함될 때만)
  group?: AccommodationGroup | null;
  photos?: AccommodationPhoto[];
  facilities?: AccommodationFacility[];
  amenities?: AccommodationAmenity[];
  managers?: AccommodationManager[];
}

// ============================================
// DTO TYPES (순수 타입, class-validator 없음)
// ============================================

/**
 * 숙소 그룹 생성 DTO
 */
export interface CreateAccommodationGroupInput {
  name: string;
  address?: string;
}

/**
 * 숙소 그룹 수정 DTO
 */
export interface UpdateAccommodationGroupInput {
  name?: string;
  address?: string | null;
}

/**
 * 숙소 생성 DTO
 */
export interface CreateAccommodationInput {
  groupId?: string;
  roomName: string;
  accommodationType: AccommodationType;
  buildingType?: BuildingType;
  usageTypes: UsageType[];
  minReservationDays?: number;
  address: string;
  addressDetail?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  nearestStation?: string;
  walkingMinutes?: number;
  basePrice: number;
  includesUtilities?: boolean;
  weekendPrice?: number;
  weekendDays?: string[];
  managementFee?: number;
  cleaningFee?: number;
  extraPersonFee?: number;
  petFee?: number;
  capacity?: number;
  genderRules?: GenderRule[];
  sizeM2?: number;
  sizePyeong?: number;
  roomCount?: number;
  livingRoomCount?: number;
  kitchenCount?: number;
  bathroomCount?: number;
  terraceCount?: number;
  bedCounts?: BedCounts;
  houseRules?: string;
  introduction?: string;
  status?: AccommodationStatus;
  isOperating?: boolean;
  photos?: AddAccommodationPhotoInput[];
}

/**
 * 숙소 수정 DTO
 */
export interface UpdateAccommodationInput {
  groupId?: string | null;
  roomName?: string;
  accommodationType?: AccommodationType;
  buildingType?: BuildingType | null;
  usageTypes?: UsageType[];
  minReservationDays?: number;
  address?: string;
  addressDetail?: string | null;
  zipCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  nearestStation?: string | null;
  walkingMinutes?: number | null;
  basePrice?: number;
  includesUtilities?: boolean;
  weekendPrice?: number | null;
  weekendDays?: string[];
  managementFee?: number | null;
  cleaningFee?: number | null;
  extraPersonFee?: number | null;
  petFee?: number | null;
  capacity?: number;
  genderRules?: GenderRule[];
  sizeM2?: number | null;
  sizePyeong?: number | null;
  roomCount?: number;
  livingRoomCount?: number;
  kitchenCount?: number;
  bathroomCount?: number;
  terraceCount?: number;
  bedCounts?: BedCounts | null;
  houseRules?: string | null;
  introduction?: string | null;
  status?: AccommodationStatus;
  isOperating?: boolean;
  photos?: AddAccommodationPhotoInput[];
}

/**
 * 숙소 사진 추가 DTO
 */
export interface AddAccommodationPhotoInput {
  category: string;
  url: string;
  order?: number;
}

/**
 * 숙소 담당자 추가 DTO
 */
export interface AddAccommodationManagerInput {
  name: string;
  phone: string;
  additionalInfo?: string;
}

// ============================================
// RESPONSE TYPES
// ============================================

/**
 * 숙소 생성 응답 (역할 업그레이드 포함)
 */
export interface CreateAccommodationResponse {
  accommodation: Accommodation;
  roleUpgraded: boolean;
}

/**
 * 숙소 목록 응답 (페이지네이션 포함)
 */
export interface AccommodationListResponse {
  data: Accommodation[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
}

/**
 * 숙소 공개 정보 (SEO용, 비공개 정보 제외)
 */
export interface AccommodationPublic {
  id: string;
  roomName: string;
  accommodationType: AccommodationType;
  buildingType: BuildingType | null;
  usageTypes: UsageType[];

  // 공개 위치 정보 (상세 주소 제외)
  latitude: number | null;
  longitude: number | null;
  nearestStation: string | null;
  walkingMinutes: number | null;

  // 가격
  basePrice: number;
  includesUtilities: boolean;
  weekendPrice: number | null;
  managementFee: number | null;
  cleaningFee: number | null;

  // 공간 정보
  capacity: number;
  genderRules: GenderRule[];
  sizeM2: number | null;
  sizePyeong: number | null;
  roomCount: number;
  bathroomCount: number;

  // 침대 개수
  bedCounts: BedCounts | null;

  // 텍스트 정보
  introduction: string | null;

  // 사진
  photos: AccommodationPhoto[];
  facilities: string[]; // facilityCode 목록
  amenities: string[]; // amenityCode 목록
}
