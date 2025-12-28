'use client';

const STORAGE_KEY = 'snug_recent_searches';
const MAX_RECENT_SEARCHES = 5;

export interface RecentSearch {
  location: string;
  timestamp: number;
}

/**
 * 최근 검색어 목록 가져오기
 */
export function getRecentSearches(): RecentSearch[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const searches = JSON.parse(stored) as RecentSearch[];
    // 유효한 데이터만 필터링
    return searches.filter((s) => s.location && typeof s.location === 'string' && s.timestamp);
  } catch {
    return [];
  }
}

/**
 * 최근 검색어 저장
 */
export function saveRecentSearch(location: string): void {
  if (typeof window === 'undefined') return;
  if (!location || location.trim() === '') return;

  try {
    const searches = getRecentSearches();

    // 이미 있는 검색어면 제거 (최신으로 다시 추가하기 위해)
    const filtered = searches.filter((s) => s.location.toLowerCase() !== location.toLowerCase());

    // 새 검색어를 맨 앞에 추가
    const newSearches: RecentSearch[] = [
      { location: location.trim(), timestamp: Date.now() },
      ...filtered,
    ].slice(0, MAX_RECENT_SEARCHES);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSearches));
  } catch {
    // Intentionally ignore localStorage errors (SSR, incognito mode, quota exceeded)
    void 0;
  }
}

/**
 * 특정 검색어 삭제
 */
export function removeRecentSearch(location: string): void {
  if (typeof window === 'undefined') return;

  try {
    const searches = getRecentSearches();
    const filtered = searches.filter((s) => s.location.toLowerCase() !== location.toLowerCase());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    // Intentionally ignore localStorage errors (SSR, incognito mode, quota exceeded)
    void 0;
  }
}

/**
 * 모든 최근 검색어 삭제
 */
export function clearRecentSearches(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Intentionally ignore localStorage errors (SSR, incognito mode, quota exceeded)
    void 0;
  }
}
