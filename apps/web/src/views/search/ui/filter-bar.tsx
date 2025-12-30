'use client';

import { useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import { FilterIcon, GridViewIcon, ListViewIcon } from '@/shared/ui/icons';

interface FilterBarProps {
  onViewChange?: (view: 'grid' | 'list') => void;
  currentView?: 'grid' | 'list';
  onFilterClick?: () => void;
  hasActiveFilters?: boolean;
  activeQuickFilters?: string[];
  onQuickFilterToggle?: (filterId: string) => void;
}

export function FilterBar({
  onViewChange,
  currentView = 'grid',
  onFilterClick,
  hasActiveFilters = false,
  activeQuickFilters = [],
  onQuickFilterToggle,
}: FilterBarProps) {
  const t = useTranslations('search.filters');

  const filters = [
    { id: 'womenOnly', label: t('womenOnly') },
    { id: 'parking', label: t('parking') },
  ];

  return (
    <div className="flex items-center gap-2 py-3">
      {/* Filters Button */}
      <button
        type="button"
        onClick={onFilterClick}
        className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-xs transition-colors whitespace-nowrap ${
          hasActiveFilters
            ? 'border-[hsl(var(--snug-orange))] text-[hsl(var(--snug-orange))]'
            : 'border-[hsl(var(--snug-border))] hover:border-[hsl(var(--snug-gray))]'
        }`}
      >
        <FilterIcon className="w-3.5 h-3.5 flex-shrink-0" />
        {t('filters')}
      </button>

      {/* Room Type Dropdown */}
      <button
        type="button"
        className="flex items-center gap-1.5 px-3 py-1.5 border border-[hsl(var(--snug-border))] rounded-full text-xs hover:border-[hsl(var(--snug-gray))] transition-colors whitespace-nowrap"
      >
        {t('roomType')}
        <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
      </button>

      {/* Filter Pills */}
      {filters.map((filter) => (
        <button
          key={filter.id}
          type="button"
          onClick={() => onQuickFilterToggle?.(filter.id)}
          className={`px-3 py-1.5 border rounded-full text-xs transition-colors whitespace-nowrap ${
            activeQuickFilters.includes(filter.id)
              ? 'border-[hsl(var(--snug-orange))] text-[hsl(var(--snug-orange))]'
              : 'border-[hsl(var(--snug-border))] text-[hsl(var(--snug-text-primary))] hover:border-[hsl(var(--snug-gray))]'
          }`}
        >
          {filter.label}
        </button>
      ))}

      {/* Spacer */}
      <div className="flex-1" />

      {/* View Toggle */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onViewChange?.('grid')}
          className={`p-1.5 rounded-md transition-colors ${
            currentView === 'grid'
              ? 'text-[hsl(var(--snug-orange))]'
              : 'text-[hsl(var(--snug-gray))] hover:text-[hsl(var(--snug-text-primary))]'
          }`}
        >
          <GridViewIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onViewChange?.('list')}
          className={`p-1.5 rounded-md transition-colors ${
            currentView === 'list'
              ? 'text-[hsl(var(--snug-orange))]'
              : 'text-[hsl(var(--snug-gray))] hover:text-[hsl(var(--snug-text-primary))]'
          }`}
        >
          <ListViewIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
