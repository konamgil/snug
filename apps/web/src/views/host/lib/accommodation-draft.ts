'use client';

import type { AccommodationFormData } from '../ui/accommodations/types';

const STORAGE_KEY_PREFIX = 'snug_accommodation_draft';
const DRAFT_VERSION = 1;

interface StoredDraft {
  data: AccommodationFormData;
  savedAt: number;
  version: number;
}

/**
 * Get the storage key for a draft
 * @param accommodationId - undefined for new, string for edit
 */
function getStorageKey(accommodationId?: string): string {
  return accommodationId
    ? `${STORAGE_KEY_PREFIX}_${accommodationId}`
    : `${STORAGE_KEY_PREFIX}_new`;
}

/**
 * Filter out blob URLs from photos (they can't be restored)
 */
function filterBlobUrls(data: AccommodationFormData): AccommodationFormData {
  return {
    ...data,
    mainPhotos: data.mainPhotos.map((category) => ({
      ...category,
      photos: category.photos.filter((photo) => !photo.url.startsWith('blob:')),
    })),
  };
}

/**
 * Check if a draft exists
 */
export function hasDraft(accommodationId?: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const key = getStorageKey(accommodationId);
    const stored = localStorage.getItem(key);
    return stored !== null;
  } catch {
    return false;
  }
}

/**
 * Get the timestamp of when the draft was saved
 */
export function getDraftTimestamp(accommodationId?: string): number | null {
  if (typeof window === 'undefined') return null;

  try {
    const key = getStorageKey(accommodationId);
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as StoredDraft;
    return parsed.savedAt || null;
  } catch {
    return null;
  }
}

/**
 * Get the saved draft data
 */
export function getDraft(accommodationId?: string): AccommodationFormData | null {
  if (typeof window === 'undefined') return null;

  try {
    const key = getStorageKey(accommodationId);
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as StoredDraft;

    // Version check for future compatibility
    if (parsed.version !== DRAFT_VERSION) {
      // Clear incompatible draft
      localStorage.removeItem(key);
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
}

/**
 * Save draft to localStorage
 */
export function saveDraft(data: AccommodationFormData, accommodationId?: string): void {
  if (typeof window === 'undefined') return;

  try {
    const key = getStorageKey(accommodationId);
    const filteredData = filterBlobUrls(data);

    const draft: StoredDraft = {
      data: filteredData,
      savedAt: Date.now(),
      version: DRAFT_VERSION,
    };

    localStorage.setItem(key, JSON.stringify(draft));
  } catch {
    // Intentionally ignore localStorage errors (SSR, incognito mode, quota exceeded)
    void 0;
  }
}

/**
 * Clear the saved draft
 */
export function clearDraft(accommodationId?: string): void {
  if (typeof window === 'undefined') return;

  try {
    const key = getStorageKey(accommodationId);
    localStorage.removeItem(key);
  } catch {
    // Intentionally ignore localStorage errors (SSR, incognito mode, quota exceeded)
    void 0;
  }
}

/**
 * Format the draft timestamp for display
 */
export function formatDraftTime(timestamp: number, locale: string = 'ko'): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // For recent times, show relative time
  if (diffMins < 1) {
    return locale === 'ko' ? '방금 전' : 'just now';
  }
  if (diffMins < 60) {
    return locale === 'ko' ? `${diffMins}분 전` : `${diffMins} min ago`;
  }
  if (diffHours < 24) {
    return locale === 'ko' ? `${diffHours}시간 전` : `${diffHours}h ago`;
  }
  if (diffDays < 7) {
    return locale === 'ko' ? `${diffDays}일 전` : `${diffDays}d ago`;
  }

  // For older times, show date
  return date.toLocaleDateString(locale === 'ko' ? 'ko-KR' : locale, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
