'use client';

import { useState, useRef, useEffect } from 'react';
import { MapPin, Calendar, Users, Search, X } from 'lucide-react';
import { DatePicker } from '@/features/search/ui/date-picker';
import {
  GuestPicker,
  formatGuestSummary,
  type GuestCount,
} from '@/features/search/ui/guest-picker';

// Popular search locations
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

export interface SearchBarValues {
  location: string;
  checkIn: Date | null;
  checkOut: Date | null;
  guests: GuestCount;
}

interface HeaderSearchBarProps {
  initialValues?: Partial<SearchBarValues>;
  onSearch?: (values: SearchBarValues) => void;
  className?: string;
}

export function HeaderSearchBar({ initialValues, onSearch, className }: HeaderSearchBarProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isDateFocused, setIsDateFocused] = useState(false);
  const [isGuestFocused, setIsGuestFocused] = useState(false);
  // Track last dropdown for close animation (null means fully closed)
  const [lastDropdown, setLastDropdown] = useState<'location' | 'dates' | 'guests' | null>(null);

  const [locationValue, setLocationValue] = useState(initialValues?.location || '');
  const [checkIn, setCheckIn] = useState<Date | null>(initialValues?.checkIn || null);
  const [checkOut, setCheckOut] = useState<Date | null>(initialValues?.checkOut || null);
  const [guests, setGuests] = useState<GuestCount>(
    initialValues?.guests || { adults: 0, children: 0, infants: 0 },
  );

  const searchBarRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const guestPickerRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDateFocused(false);
      }
      if (guestPickerRef.current && !guestPickerRef.current.contains(event.target as Node)) {
        setIsGuestFocused(false);
      }
    }

    if (isSearchFocused || isDateFocused || isGuestFocused) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchFocused, isDateFocused, isGuestFocused]);

  // Derive active dropdown from focus states
  const activeDropdown = isSearchFocused
    ? 'location'
    : isDateFocused
      ? 'dates'
      : isGuestFocused
        ? 'guests'
        : null;

  // Update last dropdown when active changes, with delayed clear for animation
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (activeDropdown) {
      // Use microtask to avoid synchronous setState warning
      timer = setTimeout(() => {
        setLastDropdown(activeDropdown);
      }, 0);
    } else {
      // Delay clearing to allow close animation
      timer = setTimeout(() => {
        setLastDropdown(null);
      }, 300);
    }
    return () => clearTimeout(timer);
  }, [activeDropdown]);

  // Use active dropdown when focused, otherwise use last dropdown for animation
  const visibleDropdown = activeDropdown || lastDropdown;

  const handleLocationSelect = (dong: string, gu: string) => {
    setLocationValue(`${dong}, ${gu}`);
    setIsSearchFocused(false);
  };

  const handleDateSelect = (newCheckIn: Date | null, newCheckOut: Date | null) => {
    setCheckIn(newCheckIn);
    setCheckOut(newCheckOut);
  };

  const handleGuestChange = (newGuests: GuestCount) => {
    setGuests(newGuests);
  };

  const handleSearch = () => {
    onSearch?.({
      location: locationValue,
      checkIn,
      checkOut,
      guests,
    });
  };

  const handleClear = () => {
    setLocationValue('');
    setCheckIn(null);
    setCheckOut(null);
    setGuests({ adults: 0, children: 0, infants: 0 });
  };

  const guestSummary = formatGuestSummary(guests);

  const formatDateDisplay = () => {
    if (!checkIn && !checkOut) return null;
    const formatDate = (date: Date) => {
      const month = date.toLocaleString('en-US', { month: 'short' });
      const day = date.getDate();
      const year = date.getFullYear().toString().slice(-2);
      return `${month} ${day}, ${year}`;
    };
    if (checkIn && checkOut) {
      return `${formatDate(checkIn)} - ${formatDate(checkOut)}`;
    }
    if (checkIn) {
      return formatDate(checkIn);
    }
    return null;
  };

  const hasValues = locationValue || checkIn || guestSummary;
  const isExpanded = isSearchFocused || isDateFocused || isGuestFocused;

  return (
    <div ref={searchBarRef} className={`w-full max-w-[720px] ${className ?? ''}`}>
      <div
        className={`bg-white border rounded-3xl w-full transition-all duration-300 ease-out ${
          isExpanded ? 'border-[hsl(var(--snug-orange))]' : 'border-[hsl(var(--snug-border))]'
        }`}
      >
        {/* Search Input Row */}
        <div className="flex items-center gap-3 px-4 py-1.5">
          {/* Location */}
          <div
            className="flex items-center gap-2 min-w-[160px] flex-[2] cursor-pointer"
            onClick={() => {
              setIsSearchFocused(true);
              setIsDateFocused(false);
              setIsGuestFocused(false);
            }}
          >
            <MapPin
              className={`w-3.5 h-3.5 flex-shrink-0 ${isSearchFocused ? 'text-[hsl(var(--snug-orange))]' : 'text-[hsl(var(--snug-gray))]'}`}
            />
            <input
              type="text"
              value={locationValue}
              onChange={(e) => setLocationValue(e.target.value)}
              onFocus={() => {
                setIsSearchFocused(true);
                setIsDateFocused(false);
                setIsGuestFocused(false);
              }}
              placeholder="Gangnam-gu, Seoul-si"
              className="text-xs text-[hsl(var(--snug-text-primary))] placeholder:text-[hsl(var(--snug-placeholder))] bg-transparent outline-none w-full tracking-tight"
            />
          </div>

          {/* Stay Dates */}
          <button
            type="button"
            onClick={() => {
              setIsDateFocused(!isDateFocused);
              setIsSearchFocused(false);
              setIsGuestFocused(false);
            }}
            className="flex items-center gap-1.5 flex-1"
          >
            <Calendar
              className={`w-3.5 h-3.5 flex-shrink-0 ${isDateFocused ? 'text-[hsl(var(--snug-orange))]' : 'text-[hsl(var(--snug-gray))]'}`}
            />
            <span
              className={`text-xs whitespace-nowrap tracking-tight ${
                formatDateDisplay()
                  ? 'text-[hsl(var(--snug-text-primary))]'
                  : 'text-[hsl(var(--snug-placeholder))]'
              } ${isDateFocused ? 'text-[hsl(var(--snug-orange))]' : ''}`}
            >
              {formatDateDisplay() || 'Stay Dates'}
            </span>
          </button>

          {/* Guests */}
          <button
            type="button"
            onClick={() => {
              setIsGuestFocused(!isGuestFocused);
              setIsSearchFocused(false);
              setIsDateFocused(false);
            }}
            className="flex items-center gap-1.5 flex-1"
          >
            <Users
              className={`w-3.5 h-3.5 flex-shrink-0 ${isGuestFocused ? 'text-[hsl(var(--snug-orange))]' : 'text-[hsl(var(--snug-gray))]'}`}
            />
            <span
              className={`text-xs whitespace-nowrap tracking-tight ${
                guestSummary
                  ? 'text-[hsl(var(--snug-text-primary))]'
                  : 'text-[hsl(var(--snug-placeholder))]'
              } ${isGuestFocused ? 'text-[hsl(var(--snug-orange))]' : ''}`}
            >
              {guestSummary || 'Guests'}
            </span>
          </button>

          {/* Clear Button */}
          {hasValues && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-[hsl(var(--snug-light-gray))] rounded-full transition-colors"
            >
              <X className="w-3.5 h-3.5 text-[hsl(var(--snug-gray))]" />
            </button>
          )}

          {/* Search Button */}
          <button
            type="button"
            onClick={handleSearch}
            className="w-8 h-8 rounded-full bg-[hsl(var(--snug-orange))] flex items-center justify-center hover:opacity-90 transition-opacity flex-shrink-0"
          >
            <Search className="w-3.5 h-3.5 text-white" />
          </button>
        </div>

        {/* Dropdown Content */}
        <div
          className={`grid transition-[grid-template-rows] duration-300 ease-out ${
            isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div className="overflow-hidden">
            {visibleDropdown && <div className="border-t border-[hsl(var(--snug-border))]" />}

            {/* Popular Searches */}
            {visibleDropdown === 'location' && (
              <div className="p-4">
                <p className="text-xs font-semibold text-[hsl(var(--snug-text-primary))] mb-3 tracking-tight">
                  Popular Searches
                </p>
                <div className="space-y-0.5">
                  {popularLocations.map((location) => (
                    <button
                      key={location.dong}
                      type="button"
                      onClick={() => handleLocationSelect(location.dong, location.gu)}
                      className="w-full text-left py-1.5 hover:bg-[hsl(var(--snug-light-gray))] rounded transition-colors"
                    >
                      <span className="text-sm text-[hsl(var(--snug-text-primary))] tracking-tight">
                        {location.dong}, {location.gu}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Date Picker */}
            {visibleDropdown === 'dates' && (
              <div className="p-4" ref={datePickerRef}>
                <DatePicker checkIn={checkIn} checkOut={checkOut} onDateSelect={handleDateSelect} />
              </div>
            )}

            {/* Guest Picker */}
            {visibleDropdown === 'guests' && (
              <div className="p-4" ref={guestPickerRef}>
                <GuestPicker guests={guests} onGuestChange={handleGuestChange} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
