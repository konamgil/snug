'use client';

import { useRef } from 'react';
import { MapPin, SearchX, Lightbulb } from 'lucide-react';
import { LocationIcon } from '@/shared/ui/icons';
import type { AutocompleteResult } from '../lib/use-address-autocomplete';

interface AddressAutocompleteDropdownProps {
  results: AutocompleteResult[];
  isLoading: boolean;
  isSuggested?: boolean;
  onSelect: (result: AutocompleteResult) => void;
  onStartSelecting?: () => void;
  variant?: 'modal' | 'header';
}

export function AddressAutocompleteDropdown({
  results,
  isLoading,
  isSuggested = false,
  onSelect,
  onStartSelecting,
  variant = 'modal',
}: AddressAutocompleteDropdownProps) {
  // 중복 이벤트 방지용 ref
  const handledRef = useRef(false);

  const hasNoResults = results.length === 0 && !isLoading;

  const createSelectHandler = (result: AutocompleteResult, _index: number) => {
    return (e: React.MouseEvent | React.TouchEvent) => {
      // 이미 처리된 이벤트면 무시
      if (handledRef.current) {
        return;
      }
      handledRef.current = true;
      // 짧은 시간 후 리셋
      setTimeout(() => {
        handledRef.current = false;
      }, 300);

      e.preventDefault();
      e.stopPropagation();
      onStartSelecting?.();
      onSelect(result);
    };
  };

  if (variant === 'header') {
    const handleContainerInteraction = () => {
      // 드롭다운 영역 터치 시 결과 숨김 방지
      onStartSelecting?.();
    };

    // 결과 없음
    if (hasNoResults) {
      return (
        <div className="mb-4">
          <div className="flex items-center gap-2 py-3 px-2 text-[hsl(var(--snug-gray))]">
            <SearchX className="w-4 h-4" />
            <span className="text-sm">No results found</span>
          </div>
        </div>
      );
    }

    return (
      <div
        className="mb-4"
        onMouseDown={handleContainerInteraction}
        onTouchStart={handleContainerInteraction}
      >
        {/* 추천 지역 안내 메시지 */}
        {isSuggested && (
          <div className="flex items-start gap-2 py-2 px-2 mb-2 bg-[hsl(var(--snug-light-gray))] rounded-lg">
            <Lightbulb className="w-4 h-4 text-[hsl(var(--snug-primary))] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[hsl(var(--snug-gray))] leading-relaxed">
              정확히 일치하는 지역은 없어요.
              <br />
              입력한 위치와 관련된 지역을 추천드려요.
            </p>
          </div>
        )}
        <p className="text-xs font-semibold text-[hsl(var(--snug-text-primary))] mb-2 tracking-tight flex items-center gap-1.5">
          <LocationIcon className="w-3 h-3" />
          {isSuggested ? 'Suggested Areas' : 'Search Results'}
        </p>
        <div className="space-y-0.5">
          {results.map((result, index) => {
            const handleSelect = createSelectHandler(result, index);
            return (
              <button
                key={`autocomplete-${index}-${result.label}`}
                type="button"
                onMouseDown={handleSelect}
                onTouchStart={handleSelect}
                className="w-full text-left py-1.5 px-2 hover:bg-[hsl(var(--snug-light-gray))] rounded transition-colors"
              >
                <span className="text-sm text-[hsl(var(--snug-text-primary))] tracking-tight">
                  {result.label}
                </span>
                <span className="text-xs text-[hsl(var(--snug-gray))] ml-2">{result.labelKo}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Modal variant
  const handleContainerInteraction = () => {
    onStartSelecting?.();
  };

  // 결과 없음
  if (hasNoResults) {
    return (
      <div className="absolute left-4 right-4 top-full mt-1 bg-white border border-[hsl(var(--snug-border))] rounded-xl shadow-lg z-10">
        <div className="flex items-center gap-2 px-4 py-3 text-[hsl(var(--snug-gray))]">
          <SearchX className="w-4 h-4" />
          <span className="text-sm">No results found</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="absolute left-4 right-4 top-full mt-1 bg-white border border-[hsl(var(--snug-border))] rounded-xl shadow-lg z-10 max-h-[280px] overflow-y-auto"
      onMouseDown={handleContainerInteraction}
      onTouchStart={handleContainerInteraction}
    >
      {/* 추천 지역 안내 메시지 */}
      {isSuggested && (
        <div className="flex items-start gap-2 px-4 py-3 bg-[hsl(var(--snug-light-gray))] border-b border-[hsl(var(--snug-border))]">
          <Lightbulb className="w-4 h-4 text-[hsl(var(--snug-primary))] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-[hsl(var(--snug-gray))] leading-relaxed">
              정확히 일치하는 지역은 없어요.
              <br />
              입력한 위치와 관련된 지역을 추천드려요.
            </p>
          </div>
        </div>
      )}
      {results.map((result, index) => {
        const handleSelect = createSelectHandler(result, index);
        return (
          <button
            key={`autocomplete-${index}-${result.label}`}
            type="button"
            onMouseDown={handleSelect}
            onTouchStart={handleSelect}
            className="w-full text-left px-4 py-3 text-sm text-[hsl(var(--snug-text-primary))] hover:bg-[hsl(var(--snug-light-gray))] transition-colors flex items-center gap-2 border-b border-[hsl(var(--snug-border))] last:border-b-0"
          >
            <MapPin className="w-4 h-4 text-[hsl(var(--snug-gray))] flex-shrink-0" />
            <div>
              <div>{result.label}</div>
              <div className="text-xs text-[hsl(var(--snug-gray))]">{result.labelKo}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
