'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getAccommodationPublic,
  getSimilarAccommodations,
  getPublicAccommodations,
} from './actions';
import type { AccommodationSearchParams } from '@snug/types';
import { accommodationKeys } from './keys';

// Re-export keys for convenience
export { accommodationKeys };

// Hook for fetching public accommodation data with caching
export function useAccommodationPublic(roomId: string) {
  return useQuery({
    queryKey: accommodationKeys.detail(roomId),
    queryFn: () => getAccommodationPublic(roomId),
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
    gcTime: 10 * 60 * 1000, // 10 minutes - cache retention
    enabled: !!roomId,
  });
}

// Hook for fetching similar accommodations
export function useSimilarAccommodations(roomId: string, limit = 6) {
  return useQuery({
    queryKey: accommodationKeys.similar(roomId),
    queryFn: () => getSimilarAccommodations(roomId, limit),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!roomId,
  });
}

// Hook for fetching public accommodations list with caching (search page)
export function usePublicAccommodations(params?: AccommodationSearchParams) {
  return useQuery({
    queryKey: accommodationKeys.list(params),
    queryFn: () => getPublicAccommodations(params),
    staleTime: 2 * 60 * 1000, // 2 minutes - search results stay fresh
    gcTime: 5 * 60 * 1000, // 5 minutes - cache retention for back navigation
  });
}
