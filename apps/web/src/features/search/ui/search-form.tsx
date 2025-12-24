'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { LocationIcon, CalendarIcon, UserIcon, SearchIcon } from '@/shared/ui/icons';
import { DatePicker } from './date-picker';
import { GuestPicker, formatGuestSummary, type GuestCount } from './guest-picker';
import type { SearchParams } from './search-modal';

interface SearchFormProps {
  className?: string;
  onFocusChange?: (focused: boolean) => void;
  onSearch?: (params: SearchParams) => void;
}

type FocusState = 'none' | 'location' | 'dates' | 'guests';

// Popular search locations in Gangnam-gu
const popularLocations = [
  { dong: 'Seocho-dong', gu: 'Gangnam-gu' },
  { dong: 'Yeoksam-dong', gu: 'Gangnam-gu' },
  { dong: 'Apgujeong-dong', gu: 'Gangnam-gu' },
  { dong: 'Seonneung-dong', gu: 'Gangnam-gu' },
  { dong: 'Cheongdam-dong', gu: 'Gangnam-gu' },
  { dong: 'Yangjae-dong', gu: 'Gangnam-gu' },
  { dong: 'Bangbae-dong', gu: 'Gangnam-gu' },
  { dong: 'Sinsa-dong', gu: 'Gangnam-gu' },
  { dong: 'Nonhyeon-dong', gu: 'Gangnam-gu' },
  { dong: 'Dogok-dong', gu: 'Gangnam-gu' },
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

export function SearchForm({ className, onFocusChange, onSearch }: SearchFormProps) {
  const t = useTranslations('home.search');
  const [focusState, setFocusState] = useState<FocusState>('none');
  const [locationValue, setLocationValue] = useState('');
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState<GuestCount>(DEFAULT_GUESTS);
  const containerRef = useRef<HTMLDivElement>(null);

  const isFocused = focusState !== 'none';

  // Notify parent when focus changes
  useEffect(() => {
    onFocusChange?.(isFocused);
  }, [isFocused, onFocusChange]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setFocusState('none');
      }
    }

    if (isFocused) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFocused]);

  const handleLocationSelect = (dong: string, gu: string) => {
    setLocationValue(`${dong}, ${gu}`);
    setFocusState('none');
  };

  const handleDateSelect = useCallback((newCheckIn: Date | null, newCheckOut: Date | null) => {
    setCheckIn(newCheckIn);
    setCheckOut(newCheckOut);
    // Close calendar when both dates are selected
    if (newCheckIn && newCheckOut) {
      setFocusState('none');
    }
  }, []);

  const handleGuestChange = useCallback((newGuests: GuestCount) => {
    setGuests(newGuests);
  }, []);

  const handleDatesClick = () => {
    setFocusState(focusState === 'dates' ? 'none' : 'dates');
  };

  const handleGuestsClick = () => {
    setFocusState(focusState === 'guests' ? 'none' : 'guests');
  };

  const handleResetDates = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCheckIn(null);
    setCheckOut(null);
  };

  const handleResetGuests = (e: React.MouseEvent) => {
    e.stopPropagation();
    setGuests(DEFAULT_GUESTS);
  };

  const dateRangeText = formatDateRange(checkIn, checkOut);
  const guestSummary = formatGuestSummary(guests);

  const handleSearch = () => {
    onSearch?.({
      location: locationValue,
      checkIn,
      checkOut,
      guests,
    });
  };

  return (
    <div ref={containerRef} className={`relative w-full max-w-[600px] ${className ?? ''}`}>
      {/* Unified Container with Orange Border on Focus */}
      <div
        className={`bg-white border-[1.5px] rounded-[20px] w-full transition-all duration-300 ease-out overflow-hidden ${
          isFocused ? 'border-[#ff7900] shadow-lg' : 'border-[#d8d8d8]'
        }`}
      >
        {/* Main Search Form */}
        <div className="p-4">
          {/* Location Input */}
          <div className="flex items-center gap-2 mb-3 px-3 py-1.5 -mx-3 -my-1.5 rounded-md hover:bg-[hsl(var(--snug-light-gray))] transition-colors">
            <LocationIcon
              className={`w-3 h-3 flex-shrink-0 transition-colors ${
                focusState === 'location'
                  ? 'text-[hsl(var(--snug-orange))]'
                  : 'text-[hsl(var(--snug-gray))]'
              }`}
            />
            <input
              type="text"
              placeholder={t('location')}
              value={locationValue}
              onChange={(e) => setLocationValue(e.target.value)}
              onFocus={() => setFocusState('location')}
              className="flex-1 text-xs text-[hsl(var(--snug-text-primary))] placeholder:text-[hsl(var(--snug-placeholder))] bg-transparent outline-none tracking-tight"
            />
          </div>

          {/* Date and Guests Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Stay Dates */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleDatesClick}
                  className={`flex items-center gap-1 text-xs tracking-tight transition-colors whitespace-nowrap px-3 py-1.5 -mx-3 -my-1.5 rounded-md hover:bg-[hsl(var(--snug-light-gray))] ${
                    dateRangeText
                      ? 'text-[hsl(var(--snug-text-primary))]'
                      : 'text-[hsl(var(--snug-placeholder))]'
                  } ${focusState === 'dates' ? 'text-[hsl(var(--snug-orange))]' : ''}`}
                >
                  <CalendarIcon
                    className={`w-3 h-3 ${
                      focusState === 'dates'
                        ? 'text-[hsl(var(--snug-orange))]'
                        : 'text-[hsl(var(--snug-gray))]'
                    }`}
                  />
                  <span>{dateRangeText ?? t('dates')}</span>
                </button>
                {dateRangeText && (
                  <button
                    type="button"
                    onClick={handleResetDates}
                    className="p-0.5 hover:bg-[hsl(var(--snug-light-gray))] rounded-full transition-colors"
                  >
                    <X className="w-3 h-3 text-[hsl(var(--snug-gray))]" />
                  </button>
                )}
              </div>

              {/* Guests */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleGuestsClick}
                  className={`flex items-center gap-1 text-xs tracking-tight transition-colors whitespace-nowrap px-3 py-1.5 -mx-3 -my-1.5 rounded-md hover:bg-[hsl(var(--snug-light-gray))] ${
                    guestSummary
                      ? 'text-[hsl(var(--snug-text-primary))]'
                      : 'text-[hsl(var(--snug-placeholder))]'
                  } ${focusState === 'guests' ? 'text-[hsl(var(--snug-orange))]' : ''}`}
                >
                  <UserIcon
                    className={`w-3 h-3 ${
                      focusState === 'guests'
                        ? 'text-[hsl(var(--snug-orange))]'
                        : 'text-[hsl(var(--snug-gray))]'
                    }`}
                  />
                  <span>{guestSummary ?? t('guests')}</span>
                </button>
                {guestSummary && (
                  <button
                    type="button"
                    onClick={handleResetGuests}
                    className="p-0.5 hover:bg-[hsl(var(--snug-light-gray))] rounded-full transition-colors"
                  >
                    <X className="w-3 h-3 text-[hsl(var(--snug-gray))]" />
                  </button>
                )}
              </div>
            </div>

            {/* Search Button */}
            <button
              type="button"
              onClick={handleSearch}
              className="w-8 h-8 rounded-full bg-[hsl(var(--snug-orange))] flex items-center justify-center hover:opacity-90 transition-opacity"
            >
              <SearchIcon className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>

        {/* Popular Searches Dropdown - Location Focus */}
        <div
          className={`transition-all duration-300 ease-out overflow-hidden ${
            focusState === 'location'
              ? 'max-h-[400px] opacity-100'
              : 'max-h-0 opacity-0 pointer-events-none'
          }`}
        >
          {/* Separator Line */}
          <div className="border-t border-[hsl(var(--snug-border))] mx-4" />

          <div className="p-4 pt-3">
            {/* Popular Searches Title */}
            <p className="text-xs font-semibold text-[hsl(var(--snug-text-primary))] mb-3 tracking-tight">
              {t('popularSearches')}
            </p>

            {/* Location List */}
            <div className="space-y-0.5">
              {popularLocations.map((location) => (
                <button
                  key={location.dong}
                  type="button"
                  onClick={() => handleLocationSelect(location.dong, location.gu)}
                  className="w-full flex items-center py-1.5 hover:bg-[hsl(var(--snug-light-gray))] rounded transition-colors text-left"
                >
                  <span className="text-sm text-[hsl(var(--snug-text-primary))] tracking-tight">
                    {location.dong}, {location.gu}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calendar Dropdown - Dates Focus */}
        <div
          className={`transition-all duration-300 ease-out overflow-hidden ${
            focusState === 'dates'
              ? 'max-h-[600px] opacity-100'
              : 'max-h-0 opacity-0 pointer-events-none'
          }`}
        >
          {/* Separator Line */}
          <div className="border-t border-[hsl(var(--snug-border))] mx-4" />

          <div className="p-4 pt-3">
            <DatePicker checkIn={checkIn} checkOut={checkOut} onDateSelect={handleDateSelect} />
          </div>
        </div>

        {/* Guest Picker Dropdown - Guests Focus */}
        <div
          className={`grid transition-[grid-template-rows] duration-300 ease-out ${
            focusState === 'guests' ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div
            className={`overflow-hidden ${focusState !== 'guests' ? 'pointer-events-none' : ''}`}
          >
            {/* Separator Line */}
            <div className="border-t border-[hsl(var(--snug-border))] mx-4" />

            <div className="p-4 pt-3">
              <GuestPicker guests={guests} onGuestChange={handleGuestChange} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
