import type { AccommodationSearchParams } from '@snug/types';

// Query keys for cache management (can be used in both server and client components)
export const accommodationKeys = {
  all: ['accommodation'] as const,
  list: (params?: AccommodationSearchParams) => [...accommodationKeys.all, 'list', params] as const,
  detail: (id: string) => [...accommodationKeys.all, 'detail', id] as const,
  similar: (id: string) => [...accommodationKeys.all, 'similar', id] as const,
};
