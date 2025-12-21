'use client';

import { SlidersHorizontal } from 'lucide-react';

interface MobileSearchBarProps {
  location: string;
  dateRange: string;
  guests: number;
  hasActiveFilters?: boolean;
  onSearchClick: () => void;
  onFilterClick: () => void;
}

export function MobileSearchBar({
  location,
  dateRange,
  guests,
  hasActiveFilters = false,
  onSearchClick,
  onFilterClick,
}: MobileSearchBarProps) {
  const guestText = guests > 0 ? `${guests} Guest${guests > 1 ? 's' : ''}` : '';
  const summaryParts = [dateRange, guestText].filter(Boolean).join(' · ');

  return (
    <div className="flex items-center gap-2.5 px-4 py-3">
      <button
        type="button"
        onClick={onSearchClick}
        className="flex-1 flex flex-col items-start justify-center px-5 py-2.5 border border-[hsl(var(--snug-border))] rounded-full bg-white min-h-[52px]"
      >
        <span className="text-sm font-semibold text-[hsl(var(--snug-text-primary))]">
          {location || 'Anywhere'}
        </span>
        {summaryParts && (
          <span className="text-[13px] text-[hsl(var(--snug-gray))] mt-0.5">{summaryParts}</span>
        )}
      </button>
      <button
        type="button"
        onClick={onFilterClick}
        className="relative w-11 h-11 flex items-center justify-center flex-shrink-0"
        aria-label="Filters"
      >
        <SlidersHorizontal className="w-[22px] h-[22px] text-[hsl(var(--snug-text-primary))]" />
        {hasActiveFilters && (
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[hsl(var(--snug-orange))] rounded-full" />
        )}
      </button>
    </div>
  );
}
