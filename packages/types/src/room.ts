// Room Types

import type { UserProfile } from './user';

export type RoomStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'DELETED';
export type RoomType = 'STUDIO' | 'ONE_ROOM' | 'TWO_ROOM' | 'SHARE_HOUSE' | 'OFFICETEL';

export interface Room {
  id: string;
  title: string;
  titleKo: string | null;
  description: string;
  descriptionKo: string | null;

  // Pricing
  price: number;
  deposit: number;
  maintenanceFee: number | null;

  // Location
  address: string;
  addressDetail: string | null;
  city: string;
  district: string | null;
  neighborhood: string | null;
  latitude: number | null;
  longitude: number | null;
  nearestStation: string | null;
  walkingMinutes: number | null;

  // Room Details
  roomType: RoomType;
  size: number | null;
  floor: number | null;
  totalFloors: number | null;
  direction: string | null;
  builtYear: number | null;

  // Amenities & Features
  images: string[];
  amenities: string[];
  rules: string[];

  // Availability
  availableFrom: Date | null;
  minimumStay: number | null;
  maximumStay: number | null;

  status: RoomStatus;
  viewCount: number;

  createdAt: Date;
  updatedAt: Date;

  // Relations
  hostId: string;
  host?: UserProfile;
}

export interface RoomListItem extends Pick<
  Room,
  | 'id'
  | 'title'
  | 'price'
  | 'deposit'
  | 'address'
  | 'district'
  | 'roomType'
  | 'size'
  | 'images'
  | 'nearestStation'
  | 'walkingMinutes'
  | 'availableFrom'
> {
  host?: UserProfile;
  isFavorite?: boolean;
}

export interface CreateRoomInput {
  title: string;
  titleKo?: string;
  description: string;
  descriptionKo?: string;
  price: number;
  deposit: number;
  maintenanceFee?: number;
  address: string;
  addressDetail?: string;
  city?: string;
  district?: string;
  neighborhood?: string;
  latitude?: number;
  longitude?: number;
  nearestStation?: string;
  walkingMinutes?: number;
  roomType: RoomType;
  size?: number;
  floor?: number;
  totalFloors?: number;
  direction?: string;
  builtYear?: number;
  images: string[];
  amenities?: string[];
  rules?: string[];
  availableFrom?: Date;
  minimumStay?: number;
  maximumStay?: number;
}

export interface UpdateRoomInput extends Partial<CreateRoomInput> {
  status?: RoomStatus;
}

export interface RoomFilters {
  city?: string;
  district?: string;
  roomType?: RoomType[];
  priceMin?: number;
  priceMax?: number;
  depositMin?: number;
  depositMax?: number;
  amenities?: string[];
  availableFrom?: Date;
  nearStation?: string;
}

export const AMENITIES = [
  'wifi',
  'aircon',
  'heating',
  'washer',
  'dryer',
  'refrigerator',
  'microwave',
  'tv',
  'desk',
  'closet',
  'bed',
  'sofa',
  'kitchen',
  'bathroom_private',
  'balcony',
  'elevator',
  'parking',
  'security',
  'cctv',
  'intercom',
  'pet_allowed',
  'smoking_allowed',
] as const;

export type Amenity = (typeof AMENITIES)[number];
