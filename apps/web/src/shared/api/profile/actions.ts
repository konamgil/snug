'use server';

import { apiClient } from '../client';

/**
 * 프로필 API Server Actions
 *
 * 모든 비즈니스 로직과 데이터 접근은 NestJS API를 통해 처리됩니다.
 * Server Actions는 API 프록시 역할만 수행합니다.
 */

export type PurposeOfStay =
  | 'WORK'
  | 'STUDY'
  | 'BUSINESS'
  | 'FAMILY'
  | 'TOURISM'
  | 'MEDICAL'
  | 'OTHER';

export interface ProfileData {
  // User 테이블
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  countryCode: string | null;
  emailVerified: boolean;
  avatarUrl: string | null;
  // 사용자 설정
  preferredCurrency: string;
  preferredLanguage: string;
  // GuestProfile 테이블
  aboutMe: string | null;
  purposeOfStay: PurposeOfStay | null;
  passportNumber: string | null;
  nationality: string | null;
}

/**
 * 현재 인증된 사용자 프로필 조회
 */
export async function getProfile(_userId: string): Promise<ProfileData | null> {
  try {
    return await apiClient.get<ProfileData>('/users/me');
  } catch {
    return null;
  }
}

/**
 * Supabase ID로 프로필 조회
 * @deprecated Use getProfile instead - JWT로 현재 사용자 조회
 */
export async function getProfileBySupabaseId(_supabaseId: string): Promise<ProfileData | null> {
  try {
    return await apiClient.get<ProfileData>('/users/me');
  } catch {
    return null;
  }
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  countryCode?: string;
  emailVerified?: boolean;
  avatarUrl?: string;
  // 사용자 설정
  preferredCurrency?: string;
  preferredLanguage?: string;
  // GuestProfile
  aboutMe?: string;
  purposeOfStay?: PurposeOfStay;
  passportNumber?: string;
  nationality?: string;
}

/**
 * 프로필 업데이트
 */
export async function updateProfile(
  userId: string,
  data: UpdateProfileInput,
): Promise<ProfileData | null> {
  try {
    return await apiClient.patch<ProfileData>('/users/me', data);
  } catch {
    return null;
  }
}
