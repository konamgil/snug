'use client';

import { useQuery } from '@tanstack/react-query';
import { getAccommodationPublic, getSimilarAccommodations } from './actions';

// Query keys for cache management
export const accommodationKeys = {
  all: ['accommodation'] as const,
  detail: (id: string) => [...accommodationKeys.all, 'detail', id] as const,
  similar: (id: string) => [...accommodationKeys.all, 'similar', id] as const,
};

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
