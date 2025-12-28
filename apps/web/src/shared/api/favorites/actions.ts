'use server';

import { revalidatePath } from 'next/cache';
import { apiClient, ApiClientError } from '../client';

// ============================================
// TYPES
// ============================================

export interface FavoriteItem {
  id: string;
  roomName: string;
  address: string;
  sido: string | null;
  sigungu: string | null;
  bname: string | null;
  basePrice: number;
  accommodationType: string;
  capacity: number;
  nearestStation: string | null;
  walkingMinutes: number | null;
  thumbnailUrl: string | null;
  timestamp: string;
}

export interface ToggleFavoriteResponse {
  isFavorite: boolean;
  message: string;
}

export interface CheckFavoriteResponse {
  isFavorite: boolean;
}

// ============================================
// FAVORITES ACTIONS
// ============================================

/**
 * 찜 목록 조회
 *
 * @returns 사용자의 찜 목록
 */
export async function getFavorites(): Promise<FavoriteItem[]> {
  try {
    const result = await apiClient.get<{ success: boolean; data: FavoriteItem[] }>('/favorites');
    return result.data ?? [];
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error(`[getFavorites] API Error: ${error.statusCode} - ${error.message}`);
      // 401: 미로그인 상태 - 빈 배열 반환
      if (error.statusCode === 401) {
        return [];
      }
    }
    throw error;
  }
}

/**
 * 찜 여부 확인
 *
 * @param accommodationId - 숙소 ID
 * @returns 찜 여부
 */
export async function checkFavorite(accommodationId: string): Promise<boolean> {
  try {
    const result = await apiClient.get<{ success: boolean; data: CheckFavoriteResponse }>(
      `/favorites/${accommodationId}`,
    );
    return result.data?.isFavorite ?? false;
  } catch (error) {
    if (error instanceof ApiClientError && error.statusCode === 401) {
      return false;
    }
    console.error('[checkFavorite] Error:', error);
    return false;
  }
}

/**
 * 여러 숙소의 찜 여부 확인
 *
 * @param accommodationIds - 숙소 ID 배열
 * @returns 숙소 ID별 찜 여부 맵
 */
export async function checkFavorites(accommodationIds: string[]): Promise<Record<string, boolean>> {
  if (accommodationIds.length === 0) {
    return {};
  }

  try {
    const ids = accommodationIds.join(',');
    const result = await apiClient.get<{ success: boolean; data: Record<string, boolean> }>(
      `/favorites/check?ids=${ids}`,
    );
    return result.data ?? {};
  } catch (error) {
    if (error instanceof ApiClientError && error.statusCode === 401) {
      // 미로그인 시 모든 숙소를 찜하지 않은 것으로 처리
      return accommodationIds.reduce(
        (acc, id) => {
          acc[id] = false;
          return acc;
        },
        {} as Record<string, boolean>,
      );
    }
    console.error('[checkFavorites] Error:', error);
    return {};
  }
}

/**
 * 찜 토글
 *
 * @param accommodationId - 숙소 ID
 * @returns 토글 후 찜 상태
 */
export async function toggleFavorite(accommodationId: string): Promise<ToggleFavoriteResponse> {
  const result = await apiClient.post<{ success: boolean; data: ToggleFavoriteResponse }>(
    `/favorites/${accommodationId}/toggle`,
    {},
  );

  // 캐시 무효화
  revalidatePath('/mypage/favorites');

  return result.data;
}

/**
 * 찜 추가
 *
 * @param accommodationId - 숙소 ID
 */
export async function addFavorite(accommodationId: string): Promise<void> {
  await apiClient.post(`/favorites/${accommodationId}`, {});
  revalidatePath('/mypage/favorites');
}

/**
 * 찜 삭제
 *
 * @param accommodationId - 숙소 ID
 */
export async function removeFavorite(accommodationId: string): Promise<void> {
  await apiClient.delete(`/favorites/${accommodationId}`);
  revalidatePath('/mypage/favorites');
}

// ============================================
// RECENTLY VIEWED ACTIONS
// ============================================

/**
 * 최근 본 숙소 조회
 *
 * @param limit - 조회할 개수 (기본값: 20)
 * @returns 최근 본 숙소 목록
 */
export async function getRecentlyViewed(limit = 20): Promise<FavoriteItem[]> {
  try {
    const result = await apiClient.get<{ success: boolean; data: FavoriteItem[] }>(
      `/recently-viewed?limit=${limit}`,
    );
    return result.data ?? [];
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error(`[getRecentlyViewed] API Error: ${error.statusCode} - ${error.message}`);
      if (error.statusCode === 401) {
        return [];
      }
    }
    throw error;
  }
}

/**
 * 숙소 조회 기록
 *
 * @param accommodationId - 숙소 ID
 */
export async function recordView(accommodationId: string): Promise<void> {
  try {
    await apiClient.post(`/recently-viewed/${accommodationId}`, {});
  } catch (error) {
    // 조회 기록 실패는 무시 (사용자 경험에 영향 없음)
    if (error instanceof ApiClientError && error.statusCode !== 401) {
      console.error('[recordView] Error:', error);
    }
  }
}

/**
 * 최근 본 숙소에서 삭제
 *
 * @param accommodationId - 숙소 ID
 */
export async function removeFromRecentlyViewed(accommodationId: string): Promise<void> {
  await apiClient.delete(`/recently-viewed/${accommodationId}`);
  revalidatePath('/mypage/recently-viewed');
}

/**
 * 최근 본 숙소 전체 삭제
 */
export async function clearRecentlyViewed(): Promise<void> {
  await apiClient.delete('/recently-viewed');
  revalidatePath('/mypage/recently-viewed');
}
