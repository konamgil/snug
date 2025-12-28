'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { X, RotateCcw, Clock, Loader2 } from 'lucide-react';
import { LocationIcon, CalendarIcon, UserIcon, SearchIcon } from '@/shared/ui/icons';
import { DatePicker } from './date-picker';
import { GuestPicker, formatGuestSummary, type GuestCount } from './guest-picker';
import { AddressAutocompleteDropdown } from './address-autocomplete-dropdown';
import {
  getRecentSearches,
  saveRecentSearch,
  removeRecentSearch,
  type RecentSearch,
} from '../lib/recent-searches';
import { useAddressAutocomplete, type AutocompleteResult } from '../lib/use-address-autocomplete';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (params: SearchParams) => void;
}

export interface SearchParams {
  location: string;
  checkIn: Date | null;
  checkOut: Date | null;
  guests: GuestCount;
}

type ExpandedSection = 'none' | 'location' | 'dates' | 'guests';

const popularLocations = [
  { dong: 'Seocho-dong', gu: 'Gangnam-gu' },
  { dong: 'Yeoksam-dong', gu: 'Gangnam-gu' },
  { dong: 'Apgujeong-dong', gu: 'Gangnam-gu' },
  { dong: 'Seonneung-dong', gu: 'Gangnam-gu' },
  { dong: 'Cheongdam-dong', gu: 'Gangnam-gu' },
  { dong: 'Yangjae-dong', gu: 'Gangnam-gu' },
  { dong: 'Bangbae-dong', gu: 'Gangnam-gu' },
];

const MONTH_NAMES_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const DEFAULT_GUESTS: GuestCount = {
  adults: 0,
  children: 0,
  infants: 0,
};

function formatDateRange(checkIn: Date | null, checkOut: Date | null): string | null {
  if (!checkIn) return null;

  const formatDate = (date: Date) => {
    const month = MONTH_NAMES_SHORT[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear().toString().slice(-2);
    return `${month} ${day}, ${year}`;
  };

  if (!checkOut) {
    return formatDate(checkIn);
  }

  return `${formatDate(checkIn)} - ${formatDate(checkOut)}`;
}

export function SearchModal({ isOpen, onClose, onSearch }: SearchModalProps) {
  const t = useTranslations('home.search');
  const locale = useLocale();
  const [expandedSection, setExpandedSection] = useState<ExpandedSection>('location');
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState<GuestCount>(DEFAULT_GUESTS);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  // Autocomplete hook
  const {
    query: locationInput,
    setQuery: setLocationInput,
    results: autocompleteResults,
    isLoading: isLoadingAutocomplete,
    isSuggested: isAutocompleteSuggested,
    showResults: showAutocomplete,
    clearResults: clearAutocomplete,
    startSelecting,
  } = useAddressAutocomplete();

  const locationRef = useRef<HTMLDivElement>(null);
  const datesRef = useRef<HTMLDivElement>(null);
  const guestsRef = useRef<HTMLDivElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);

  // 최근 검색어 로드 (setTimeout으로 마이크로태스크로 지연하여 연쇄 렌더링 방지)
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setRecentSearches(getRecentSearches());
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleContentClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    // Check if click is outside all section cards
    const isOutsideLocation = locationRef.current && !locationRef.current.contains(target);
    const isOutsideDates = datesRef.current && !datesRef.current.contains(target);
    const isOutsideGuests = guestsRef.current && !guestsRef.current.contains(target);

    if (isOutsideLocation && isOutsideDates && isOutsideGuests) {
      setExpandedSection('none');
    }
  };

  const handleReset = () => {
    setLocation('');
    setCheckIn(null);
    setCheckOut(null);
    setGuests(DEFAULT_GUESTS);
    setExpandedSection('none');
    clearAutocomplete();
  };

  const handleSearch = () => {
    // Use selected location or typed input
    const searchLocation = location || locationInput.trim();
    // 검색어가 있으면 최근 검색에 저장
    if (searchLocation) {
      saveRecentSearch(searchLocation);
    }
    onSearch({ location: searchLocation, checkIn, checkOut, guests });
    onClose();
  };

  const handleRecentSearchSelect = (searchLocation: string) => {
    setLocation(searchLocation);
    clearAutocomplete();
    setExpandedSection('dates');
  };

  const handleRemoveRecentSearch = (e: React.MouseEvent, searchLocation: string) => {
    e.stopPropagation();
    removeRecentSearch(searchLocation);
    setRecentSearches(getRecentSearches());
  };

  const handleLocationSelect = (dong: string, gu: string) => {
    const newLocation = `${dong}, ${gu}`;
    setLocation(newLocation);
    clearAutocomplete();
    setExpandedSection('dates');
  };

  const handleAutocompleteSelect = (result: AutocompleteResult) => {
    const displayLabel = locale === 'ko' ? result.labelKo : result.label;
    setLocation(displayLabel);
    clearAutocomplete();
    setExpandedSection('dates');
  };

  const handleLocationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocationInput(value);
    setLocation(''); // Clear selected location when typing

    // 확장 섹션 열기
    if (expandedSection !== 'location') {
      setExpandedSection('location');
    }
  };

  const handleClearLocation = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocation('');
    clearAutocomplete();
  };

  const handleDateSelect = useCallback((newCheckIn: Date | null, newCheckOut: Date | null) => {
    setCheckIn(newCheckIn);
    setCheckOut(newCheckOut);
    if (newCheckIn && newCheckOut) {
      setExpandedSection('guests');
    }
  }, []);

  const handleClearDates = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCheckIn(null);
    setCheckOut(null);
  };

  const handleGuestChange = useCallback((newGuests: GuestCount) => {
    setGuests(newGuests);
  }, []);

  const dateRangeText = formatDateRange(checkIn, checkOut);
  const guestSummary = formatGuestSummary(guests);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/20 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`fixed inset-x-0 top-0 bottom-0 bg-white z-50 flex flex-col transition-all duration-300 ease-out ${
          isOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
      >
        {/* Header */}
        <div className="flex justify-end p-4">
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-[hsl(var(--snug-light-gray))] rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-[hsl(var(--snug-text-primary))]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden px-4 pb-32" onClick={handleContentClick}>
          {/* Location Section */}
          <div
            ref={locationRef}
            className={`border rounded-2xl mb-3 transition-all duration-300 overflow-hidden ${
              expandedSection === 'location'
                ? 'border-[hsl(var(--snug-orange))] border-2'
                : 'border-[hsl(var(--snug-border))]'
            }`}
          >
            {/* 헤더 인풋 필드 */}
            <div className="p-4">
              <div className="flex items-center gap-2">
                <LocationIcon
                  className={`w-4 h-4 flex-shrink-0 ${
                    expandedSection === 'location'
                      ? 'text-[hsl(var(--snug-orange))]'
                      : 'text-[hsl(var(--snug-gray))]'
                  }`}
                />
                <input
                  ref={locationInputRef}
                  type="text"
                  value={location || locationInput}
                  onChange={handleLocationInputChange}
                  onFocus={() => setExpandedSection('location')}
                  placeholder={t('location')}
                  className="flex-1 text-sm bg-transparent border-none outline-none placeholder:text-[hsl(var(--snug-placeholder))] tracking-tight"
                />
                {isLoadingAutocomplete && (
                  <Loader2 className="w-4 h-4 text-[hsl(var(--snug-gray))] animate-spin flex-shrink-0" />
                )}
                {(location || locationInput) && !isLoadingAutocomplete && (
                  <button
                    type="button"
                    onClick={handleClearLocation}
                    className="p-1 hover:bg-[hsl(var(--snug-light-gray))] rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
                  </button>
                )}
              </div>
            </div>

            {/* Expandable Content */}
            <div
              className={`transition-all duration-300 ease-out overflow-hidden ${
                expandedSection === 'location' ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-4 pb-4">
                <div className="border-t border-[hsl(var(--snug-border))] pt-3">
                  {/* 자동완성 결과 */}
                  {showAutocomplete && (
                    <AddressAutocompleteDropdown
                      results={autocompleteResults}
                      isLoading={isLoadingAutocomplete}
                      isSuggested={isAutocompleteSuggested}
                      onSelect={handleAutocompleteSelect}
                      onStartSelecting={startSelecting}
                      variant="header"
                    />
                  )}

                  {/* 최근 검색 섹션 - 자동완성이 없을 때만 표시 */}
                  {!showAutocomplete && recentSearches.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-[hsl(var(--snug-text-primary))] mb-2 tracking-tight flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        {t('recentSearches')}
                      </p>
                      <div className="space-y-0.5">
                        {recentSearches.map((search) => (
                          <div
                            key={search.timestamp}
                            className="flex items-center justify-between group"
                          >
                            <button
                              type="button"
                              onPointerDown={(e) => {
                                e.preventDefault();
                                handleRecentSearchSelect(search.location);
                              }}
                              className="flex-1 text-left py-1.5 px-2 hover:bg-[hsl(var(--snug-light-gray))] rounded transition-colors"
                            >
                              <span className="text-sm text-[hsl(var(--snug-text-primary))] tracking-tight">
                                {search.location}
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleRemoveRecentSearch(e, search.location)}
                              className="p-1 opacity-0 group-hover:opacity-100 hover:bg-[hsl(var(--snug-light-gray))] rounded-full transition-all"
                            >
                              <X className="w-3 h-3 text-[hsl(var(--snug-gray))]" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 인기 검색 섹션 - 자동완성이 없을 때만 표시 */}
                  {!showAutocomplete && (
                    <div>
                      <p className="text-xs font-semibold text-[hsl(var(--snug-text-primary))] mb-2 tracking-tight flex items-center gap-1.5">
                        <LocationIcon className="w-3 h-3" />
                        {t('popularSearches')}
                      </p>
                      <div className="space-y-0.5">
                        {popularLocations.map((loc) => (
                          <button
                            key={loc.dong}
                            type="button"
                            onPointerDown={(e) => {
                              e.preventDefault();
                              handleLocationSelect(loc.dong, loc.gu);
                            }}
                            className="w-full text-left py-1.5 px-2 hover:bg-[hsl(var(--snug-light-gray))] rounded transition-colors"
                          >
                            <span className="text-sm text-[hsl(var(--snug-text-primary))] tracking-tight">
                              {loc.dong}, {loc.gu}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Dates Section */}
          <div
            ref={datesRef}
            className={`border rounded-2xl mb-3 transition-all duration-300 overflow-hidden ${
              expandedSection === 'dates'
                ? 'border-[hsl(var(--snug-orange))] border-2'
                : 'border-[hsl(var(--snug-border))]'
            }`}
          >
            <div className="flex items-center justify-between p-4">
              <button
                type="button"
                onClick={() => setExpandedSection(expandedSection === 'dates' ? 'none' : 'dates')}
                className="flex items-center gap-2 flex-1"
              >
                <CalendarIcon
                  className={`w-4 h-4 flex-shrink-0 ${
                    expandedSection === 'dates'
                      ? 'text-[hsl(var(--snug-orange))]'
                      : 'text-[hsl(var(--snug-gray))]'
                  }`}
                />
                <span
                  className={`text-sm tracking-tight ${
                    dateRangeText
                      ? 'text-[hsl(var(--snug-text-primary))]'
                      : 'text-[hsl(var(--snug-placeholder))]'
                  } ${expandedSection === 'dates' ? 'text-[hsl(var(--snug-orange))]' : ''}`}
                >
                  {dateRangeText || t('dates')}
                </span>
              </button>
              {dateRangeText && (
                <button
                  type="button"
                  onClick={handleClearDates}
                  className="p-1 hover:bg-[hsl(var(--snug-light-gray))] rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
                </button>
              )}
            </div>

            {/* Expandable Content */}
            <div
              className={`transition-all duration-300 ease-out overflow-hidden ${
                expandedSection === 'dates' ? 'max-h-[700px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-4 pb-4">
                <div className="border-t border-[hsl(var(--snug-border))] pt-3">
                  <DatePicker
                    checkIn={checkIn}
                    checkOut={checkOut}
                    onDateSelect={handleDateSelect}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Guests Section */}
          <div
            ref={guestsRef}
            className={`border rounded-2xl transition-all duration-300 overflow-hidden ${
              expandedSection === 'guests'
                ? 'border-[hsl(var(--snug-orange))] border-2'
                : 'border-[hsl(var(--snug-border))]'
            }`}
          >
            <button
              type="button"
              onClick={() => setExpandedSection(expandedSection === 'guests' ? 'none' : 'guests')}
              className="w-full flex items-center gap-2 p-4"
            >
              <UserIcon
                className={`w-4 h-4 flex-shrink-0 ${
                  expandedSection === 'guests'
                    ? 'text-[hsl(var(--snug-orange))]'
                    : 'text-[hsl(var(--snug-gray))]'
                }`}
              />
              <span
                className={`text-sm tracking-tight ${
                  guestSummary
                    ? 'text-[hsl(var(--snug-text-primary))]'
                    : 'text-[hsl(var(--snug-placeholder))]'
                } ${expandedSection === 'guests' ? 'text-[hsl(var(--snug-orange))]' : ''}`}
              >
                {guestSummary || t('guests')}
              </span>
            </button>

            {/* Expandable Content */}
            <div
              className={`transition-all duration-300 ease-out overflow-hidden ${
                expandedSection === 'guests' ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-4 pb-4">
                <div className="border-t border-[hsl(var(--snug-border))] pt-3">
                  <GuestPicker guests={guests} onGuestChange={handleGuestChange} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[hsl(var(--snug-border))] px-4 py-4 flex items-center gap-4">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 text-sm text-[hsl(var(--snug-text-primary))] tracking-tight"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          <button
            type="button"
            onClick={handleSearch}
            className="flex-1 bg-[hsl(var(--snug-orange))] text-white py-3 rounded-full text-sm font-semibold tracking-tight hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <SearchIcon className="w-4 h-4" />
            <span>Search</span>
          </button>
        </div>
      </div>
    </>
  );
}
