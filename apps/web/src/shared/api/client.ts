import { createServerSupabaseClient } from '@/shared/lib/supabase/server';

/**
 * NestJS API 클라이언트
 *
 * Server Actions에서 NestJS API를 호출할 때 사용합니다.
 * Supabase 세션에서 JWT 토큰을 읽어 Authorization 헤더로 전달합니다.
 *
 * @example
 * // Server Action에서 사용
 * 'use server';
 * import { apiClient } from '@/shared/api/client';
 *
 * export async function getAccommodations() {
 *   return apiClient.get<Accommodation[]>('/accommodations');
 * }
 */

const API_BASE_URL = process.env.NEST_API_URL || 'http://localhost:4000';

interface ApiClientOptions {
  /** Request cache 설정 */
  cache?: RequestCache;
  /** Next.js revalidation tags */
  tags?: string[];
  /** 타임아웃 (ms) */
  timeout?: number;
}

interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

class ApiClientError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public error?: string
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

/**
 * 인증 토큰 가져오기
 * Supabase 세션에서 access token을 읽습니다.
 */
async function getAuthToken(): Promise<string | undefined> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  } catch {
    return undefined;
  }
}

/**
 * API 응답 처리
 */
async function handleResponse<T>(response: Response, url: string): Promise<T> {
  if (!response.ok) {
    let errorData: ApiError & { message: string | string[] };
    try {
      errorData = await response.json();
    } catch {
      errorData = {
        message: response.statusText || 'Unknown error',
        statusCode: response.status,
      };
    }

    // 디버깅용 로그 - 전체 에러 객체 출력
    console.error(`[API Error] ${response.status} ${url}:`, JSON.stringify(errorData, null, 2));

    // NestJS validation error: message가 배열일 수 있음
    const errorMessage = Array.isArray(errorData.message)
      ? errorData.message.join(', ')
      : errorData.message;

    throw new ApiClientError(
      response.status,
      errorMessage || `API Error: ${response.status}`,
      errorData.error
    );
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

/**
 * 공통 헤더 생성
 */
async function createHeaders(token?: string): Promise<HeadersInit> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const authToken = token ?? (await getAuthToken());
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  return headers;
}

export const apiClient = {
  /**
   * GET 요청
   *
   * @example
   * const accommodations = await apiClient.get<Accommodation[]>('/accommodations');
   */
  get: async <T>(url: string, options?: ApiClientOptions): Promise<T> => {
    const headers = await createHeaders();

    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'GET',
      headers,
      cache: options?.cache ?? 'no-store',
      next: options?.tags ? { tags: options.tags } : undefined,
    });

    return handleResponse<T>(response, url);
  },

  /**
   * POST 요청
   *
   * @example
   * const result = await apiClient.post<CreateResponse>('/accommodations', {
   *   roomName: '101호',
   *   address: '서울시 강남구...',
   * });
   */
  post: async <T>(
    url: string,
    data: unknown,
    options?: ApiClientOptions
  ): Promise<T> => {
    const headers = await createHeaders();

    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
      cache: options?.cache ?? 'no-store',
    });

    return handleResponse<T>(response, url);
  },

  /**
   * PATCH 요청
   *
   * @example
   * const updated = await apiClient.patch<Accommodation>('/accommodations/123', {
   *   roomName: '102호',
   * });
   */
  patch: async <T>(
    url: string,
    data: unknown,
    options?: ApiClientOptions
  ): Promise<T> => {
    const headers = await createHeaders();

    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
      cache: options?.cache ?? 'no-store',
    });

    return handleResponse<T>(response, url);
  },

  /**
   * PUT 요청
   */
  put: async <T>(
    url: string,
    data: unknown,
    options?: ApiClientOptions
  ): Promise<T> => {
    const headers = await createHeaders();

    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
      cache: options?.cache ?? 'no-store',
    });

    return handleResponse<T>(response, url);
  },

  /**
   * DELETE 요청
   *
   * @example
   * await apiClient.delete('/accommodations/123');
   */
  delete: async <T>(url: string, options?: ApiClientOptions): Promise<T> => {
    const headers = await createHeaders();

    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
      headers,
      cache: options?.cache ?? 'no-store',
    });

    return handleResponse<T>(response, url);
  },
};

// 에러 타입 export
export { ApiClientError };
export type { ApiError };
