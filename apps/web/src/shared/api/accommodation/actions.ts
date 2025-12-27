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
  AccommodationSearchParams,
  AccommodationPublicListResponse,
  AccommodationListItem,
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
    const result = await apiClient.get<{ success: boolean; data: Accommodation[] }>(
      '/accommodations',
    );
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
    // NestJS returns { success: true, data: Accommodation }
    const result = await apiClient.get<{ success: boolean; data: Accommodation }>(
      `/accommodations/${id}`,
    );
    console.log('[getAccommodation] Raw API response:', result);
    console.log('[getAccommodation] Extracted data:', result.data);
    return result.data;
  } catch (error) {
    console.error('[getAccommodation] Error:', error);
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
 * 공개 숙소 목록 조회 (검색 페이지용)
 * 인증 불필요
 *
 * @param params - 검색 파라미터 (페이지, 필터, 정렬 등)
 * @returns 페이지네이션된 숙소 목록
 */
export async function getPublicAccommodations(
  params?: AccommodationSearchParams,
): Promise<AccommodationPublicListResponse> {
  try {
    // Query string 생성
    const searchParams = new URLSearchParams();

    if (params) {
      if (params.page) searchParams.set('page', params.page.toString());
      if (params.limit) searchParams.set('limit', params.limit.toString());
      if (params.location) searchParams.set('location', params.location);
      if (params.guests) searchParams.set('guests', params.guests.toString());
      if (params.minPrice) searchParams.set('minPrice', params.minPrice.toString());
      if (params.maxPrice) searchParams.set('maxPrice', params.maxPrice.toString());
      if (params.sortBy) searchParams.set('sortBy', params.sortBy);

      // 배열 파라미터
      if (params.accommodationType?.length) {
        params.accommodationType.forEach((type) => {
          searchParams.append('accommodationType', type);
        });
      }
      if (params.buildingType?.length) {
        params.buildingType.forEach((type) => {
          searchParams.append('buildingType', type);
        });
      }
      if (params.genderRules?.length) {
        params.genderRules.forEach((rule) => {
          searchParams.append('genderRules', rule);
        });
      }
    }

    const queryString = searchParams.toString();
    const url = `/accommodations/public${queryString ? `?${queryString}` : ''}`;

    // NestJS returns { success: true, data: AccommodationPublicListResponse }
    const result = await apiClient.get<{ success: boolean; data: AccommodationPublicListResponse }>(
      url,
    );
    return result.data;
  } catch (error) {
    console.error('[getPublicAccommodations] Error:', error);
    // 에러 시 빈 응답 반환
    return {
      data: [],
      total: 0,
      page: 1,
      limit: 20,
      hasNext: false,
    };
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
  data: CreateAccommodationInput,
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
  data: UpdateAccommodationInput,
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
    const result = await apiClient.get<{ success: boolean; data: AccommodationGroup[] }>(
      '/accommodations/groups/list',
    );
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
  data: CreateAccommodationGroupInput,
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
  data: UpdateAccommodationGroupInput,
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

// ============================================
// SIMILAR ACCOMMODATIONS
// ============================================

/**
 * 유사 숙소 조회 (같은 지역 + 같은 타입)
 * 인증 불필요
 *
 * @param id - 기준 숙소 ID
 * @param limit - 최대 개수 (기본값: 6)
 * @returns 유사 숙소 목록
 */
export async function getSimilarAccommodations(
  id: string,
  limit: number = 6,
): Promise<AccommodationListItem[]> {
  try {
    const result = await apiClient.get<{ success: boolean; data: AccommodationListItem[] }>(
      `/accommodations/public/similar/${id}?limit=${limit}`,
    );
    return result.data ?? [];
  } catch (error) {
    console.error('[getSimilarAccommodations] Error:', error);
    return [];
  }
}
