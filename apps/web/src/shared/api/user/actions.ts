'use server';

import { apiClient } from '../client';
import type { User } from '@snug/types';

/**
 * 사용자 API Server Actions
 *
 * 모든 비즈니스 로직과 데이터 접근은 NestJS API를 통해 처리됩니다.
 * Server Actions는 API 프록시 역할만 수행합니다.
 */

export type { User } from '@snug/types';

/**
 * Supabase ID로 사용자 조회
 * Note: 이 함수는 인증된 사용자만 호출 가능 (JWT 필요)
 */
export async function getUserBySupabaseId(_supabaseId: string): Promise<User | null> {
  try {
    // 현재 인증된 사용자 프로필 조회 (GET /users/me)
    return await apiClient.get<User>('/users/me');
  } catch {
    return null;
  }
}

/**
 * 이메일로 사용자 조회
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    return await apiClient.get<User>(`/users/by-email/${encodeURIComponent(email)}`);
  } catch {
    return null;
  }
}

/**
 * OAuth 인증 후 사용자 Upsert
 */
export async function upsertUserFromAuth(data: {
  email: string;
  supabaseId: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}): Promise<User> {
  return apiClient.post<User>('/users/upsert-from-auth', data);
}

/**
 * 사용자 정보 업데이트
 */
export async function updateUser(
  id: string,
  data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    countryCode?: string;
    avatarUrl?: string;
    preferredCurrency?: string;
    preferredLanguage?: string;
  },
): Promise<User> {
  return apiClient.patch<User>('/users/me', data);
}
