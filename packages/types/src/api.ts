// API Types

// Generic API Response
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: Required<ApiMeta>;
}

// Sort
export type SortOrder = 'asc' | 'desc';

export interface SortParams {
  sortBy?: string;
  sortOrder?: SortOrder;
}

// Common Query Params
export interface ListQueryParams extends PaginationParams, SortParams {
  search?: string;
}

// Auth Types
export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  role?: 'GUEST' | 'HOST';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
  };
  tokens: AuthTokens;
}

// File Upload
export interface UploadResponse {
  url: string;
  key: string;
  size: number;
  mimeType: string;
}

// Location
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeoSearchParams extends Coordinates {
  radius?: number; // in kilometers
}
