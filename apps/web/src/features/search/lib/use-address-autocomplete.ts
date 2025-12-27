'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface AutocompleteResult {
  label: string;
  labelKo: string;
  sigungu: string | null;
  sido: string;
  sigunguEn: string | null;
  sidoEn: string;
}

interface UseAddressAutocompleteOptions {
  debounceMs?: number;
  minChars?: number;
  limit?: number;
}

export function useAddressAutocomplete(options: UseAddressAutocompleteOptions = {}) {
  const { debounceMs = 300, minChars = 2, limit = 8 } = options;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AutocompleteResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isSuggested, setIsSuggested] = useState(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  // 클릭 중에는 결과를 숨기지 않도록 하는 플래그
  const isSelectingRef = useRef(false);

  // Autocomplete API 호출 (debounced)
  useEffect(() => {
    // 이전 타이머 취소
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // 이전 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (!query.trim()) {
      // 쿼리가 완전히 비었을 때만 결과 지움 (선택 중이 아닐 때)
      if (!isSelectingRef.current) {
        setResults([]);
        setShowResults(false);
      }
      setIsLoading(false);
      return;
    }

    if (query.length < minChars) {
      // 쿼리가 짧으면 API 호출 안함, 하지만 기존 결과는 유지
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // 새 AbortController 생성
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    const currentQuery = query; // 클로저에 현재 쿼리 저장

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

        const response = await fetch(
          `${apiUrl}/accommodations/address/autocomplete?q=${encodeURIComponent(currentQuery)}&limit=${limit}`,
          { signal: abortController.signal },
        );

        if (response.ok) {
          const json = await response.json();
          // API 응답 구조: { success, data: { data: [], isSuggested }, timestamp }
          const responseData = json.data;
          const fetchedResults = responseData?.data || responseData || json;
          const suggested = responseData?.isSuggested ?? false;

          setResults(Array.isArray(fetchedResults) ? fetchedResults : []);
          setIsSuggested(suggested);
          // 검색 완료 후에는 결과 유무와 관계없이 드롭다운 표시 (결과 없음 메시지 표시 위해)
          setShowResults(true);
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return; // abort된 요청은 무시
        }
        console.error('Autocomplete error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query, debounceMs, minChars, limit]);

  const clearResults = useCallback(() => {
    setResults([]);
    setShowResults(false);
    setQuery('');
    setIsLoading(false);
    setIsSuggested(false);
  }, []);

  const hideResults = useCallback(() => {
    setShowResults(false);
  }, []);

  // 선택 시작 시 호출 - 결과가 숨겨지는 것을 방지
  const startSelecting = useCallback(() => {
    isSelectingRef.current = true;
  }, []);

  // 선택 완료 시 호출
  const endSelecting = useCallback(() => {
    isSelectingRef.current = false;
  }, []);

  return {
    query,
    setQuery,
    results,
    isLoading,
    isSuggested,
    showResults,
    setShowResults,
    clearResults,
    hideResults,
    startSelecting,
    endSelecting,
  };
}
