'use server';

import { apiClient, ApiClientError } from '../client';

// ============================================
// TYPES
// ============================================

export interface RegisterTokenResponse {
  id: string;
  userId: string;
  token: string;
  deviceType: string | null;
  isActive: boolean;
}

// ============================================
// FCM TOKEN ACTIONS
// ============================================

/**
 * FCM 토큰 등록
 *
 * @param token - FCM 토큰
 * @param deviceType - 디바이스 타입 (web, ios, android)
 * @returns 등록된 토큰 정보
 */
export async function registerFcmToken(
  token: string,
  deviceType: string = 'web',
): Promise<RegisterTokenResponse | null> {
  try {
    const result = await apiClient.post<{ success: boolean; data: RegisterTokenResponse }>(
      '/notifications/fcm-token',
      { token, deviceType },
    );
    return result.data ?? null;
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error(`[registerFcmToken] API Error: ${error.statusCode} - ${error.message}`);
      // 401: 미로그인 상태, 404: API 미구현
      if (error.statusCode === 401 || error.statusCode === 404) {
        return null;
      }
    }
    throw error;
  }
}

/**
 * FCM 토큰 비활성화 (로그아웃 시)
 *
 * @param token - FCM 토큰
 */
export async function deactivateFcmToken(token: string): Promise<void> {
  try {
    await apiClient.post('/notifications/fcm-token/deactivate', { token });
  } catch (error) {
    // 토큰 비활성화 실패는 무시
    if (error instanceof ApiClientError && error.statusCode !== 401) {
      console.error('[deactivateFcmToken] Error:', error);
    }
  }
}
