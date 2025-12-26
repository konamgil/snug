'use server';

import { revalidatePath } from 'next/cache';
import { apiClient, ApiClientError } from '../client';
import type {
  Accommodation,
  AccommodationGroup,
  CreateAccommodationInput,
  UpdateAccommodationInput,
  CreateAccommodationGroupInput,
  UpdateAccommodationGroupInput,
  CreateAccommodationResponse,
  AccommodationPublic,
} from '@snug/types';

// ============================================
// ACCOMMODATION ACTIONS
// ============================================

/**
 * 내 숙소 목록 조회
 *
 * @returns 현재 로그인한 호스트의 숙소 목록 (미로그인 시 빈 배열)
 */
export async function getAccommodations(): Promise<Accommodation[]> {
  try {
    // NestJS returns { success: true, data: [...] }
    const result = await apiClient.get<{ success: boolean; data: Accommodation[] }>('/accommodations');
    return result.data ?? [];
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error(`[getAccommodations] API Error: ${error.statusCode} - ${error.message}`);
      // 401: 미로그인 상태 - 빈 배열 반환
      if (error.statusCode === 401) {
        return [];
      }
    }
    throw error;
  }
}

/**
 * 숙소 상세 조회
 *
 * @param id - 숙소 ID
 * @returns 숙소 상세 정보 (photos, facilities, amenities, managers 포함)
 * @throws ApiClientError - 숙소를 찾을 수 없거나 권한이 없는 경우
 */
export async function getAccommodation(id: string): Promise<Accommodation | null> {
  try {
    return await apiClient.get<Accommodation>(`/accommodations/${id}`);
  } catch (error) {
    if (error instanceof ApiClientError && error.statusCode === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * 숙소 공개 정보 조회 (SEO용)
 * 인증 불필요
 *
 * @param id - 숙소 ID
 * @returns 공개 정보만 포함된 숙소 데이터
 */
export async function getAccommodationPublic(id: string): Promise<AccommodationPublic | null> {
  try {
    return await apiClient.get<AccommodationPublic>(`/accommodations/public/${id}`);
  } catch (error) {
    if (error instanceof ApiClientError && error.statusCode === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * 숙소 생성
 *
 * GUEST 역할인 경우 자동으로 HOST로 업그레이드됩니다.
 *
 * @param data - 숙소 생성 데이터
 * @returns 생성된 숙소와 역할 업그레이드 여부
 */
export async function createAccommodation(
  data: CreateAccommodationInput
): Promise<CreateAccommodationResponse> {
  const result = await apiClient.post<CreateAccommodationResponse>('/accommodations', data);

  // 캐시 무효화
  revalidatePath('/host/properties');
  revalidatePath('/host');

  return result;
}

/**
 * 숙소 수정
 *
 * @param id - 숙소 ID
 * @param data - 수정할 데이터
 * @returns 수정된 숙소
 */
export async function updateAccommodation(
  id: string,
  data: UpdateAccommodationInput
): Promise<Accommodation> {
  const result = await apiClient.patch<Accommodation>(`/accommodations/${id}`, data);

  // 캐시 무효화
  revalidatePath('/host/properties');
  revalidatePath(`/host/properties/${id}`);

  return result;
}

/**
 * 숙소 삭제
 *
 * @param id - 숙소 ID
 */
export async function deleteAccommodation(id: string): Promise<void> {
  await apiClient.delete(`/accommodations/${id}`);

  // 캐시 무효화
  revalidatePath('/host/properties');
}

// ============================================
// ACCOMMODATION GROUP ACTIONS
// ============================================

/**
 * 숙소 그룹 목록 조회
 *
 * @returns 현재 로그인한 호스트의 숙소 그룹 목록 (미로그인 시 빈 배열)
 */
export async function getAccommodationGroups(): Promise<AccommodationGroup[]> {
  try {
    // NestJS returns { success: true, data: [...] }
    const result = await apiClient.get<{ success: boolean; data: AccommodationGroup[] }>('/accommodations/groups/list');
    return result.data ?? [];
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error(`[getAccommodationGroups] API Error: ${error.statusCode} - ${error.message}`);
      // 401: 미로그인 상태 - 빈 배열 반환
      if (error.statusCode === 401) {
        return [];
      }
    }
    throw error;
  }
}

/**
 * 숙소 그룹 생성
 *
 * @param data - 그룹 생성 데이터
 * @returns 생성된 그룹
 */
export async function createAccommodationGroup(
  data: CreateAccommodationGroupInput
): Promise<AccommodationGroup> {
  const result = await apiClient.post<AccommodationGroup>('/accommodations/groups', data);

  // 캐시 무효화
  revalidatePath('/host/properties');

  return result;
}

/**
 * 숙소 그룹 수정
 *
 * @param id - 그룹 ID
 * @param data - 수정할 데이터
 * @returns 수정된 그룹
 */
export async function updateAccommodationGroup(
  id: string,
  data: UpdateAccommodationGroupInput
): Promise<AccommodationGroup> {
  const result = await apiClient.patch<AccommodationGroup>(`/accommodations/groups/${id}`, data);

  // 캐시 무효화
  revalidatePath('/host/properties');

  return result;
}

/**
 * 숙소 그룹 삭제
 *
 * @param id - 그룹 ID
 */
export async function deleteAccommodationGroup(id: string): Promise<void> {
  await apiClient.delete(`/accommodations/groups/${id}`);

  // 캐시 무효화
  revalidatePath('/host/properties');
}
