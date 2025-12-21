'use client';

import { useState, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { X, MapPin, Calendar, Users, RotateCcw } from 'lucide-react';
import { DatePicker } from './date-picker';
import { GuestPicker, formatGuestSummary, type GuestCount } from './guest-picker';

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
  const [expandedSection, setExpandedSection] = useState<ExpandedSection>('location');
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState<GuestCount>(DEFAULT_GUESTS);

  const locationRef = useRef<HTMLDivElement>(null);
  const datesRef = useRef<HTMLDivElement>(null);
  const guestsRef = useRef<HTMLDivElement>(null);

  const handleContentClick = (e: React.MouseEvent) => {
    const target = e.target as Node;

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
  };

  const handleSearch = () => {
    onSearch({ location, checkIn, checkOut, guests });
    onClose();
  };

  const handleLocationSelect = (dong: string, gu: string) => {
    setLocation(`${dong}, ${gu}`);
    setExpandedSection('dates');
  };

  const handleClearLocation = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocation('');
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
        <div className="flex-1 overflow-y-auto px-4 pb-32" onClick={handleContentClick}>
          {/* Location Section */}
          <div
            ref={locationRef}
            className={`border rounded-2xl mb-3 transition-all duration-300 overflow-hidden ${
              expandedSection === 'location'
                ? 'border-[#ff7900] border-2'
                : 'border-[hsl(var(--snug-border))]'
            }`}
          >
            <div className="flex items-center justify-between p-4">
              <button
                type="button"
                onClick={() =>
                  setExpandedSection(expandedSection === 'location' ? 'none' : 'location')
                }
                className="flex items-center gap-2 flex-1"
              >
                <MapPin className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
                <span
                  className={`text-sm ${location ? 'text-[hsl(var(--snug-text-primary))]' : 'text-[hsl(var(--snug-placeholder))]'}`}
                >
                  {location || t('location')}
                </span>
              </button>
              {location && (
                <button
                  type="button"
                  onClick={handleClearLocation}
                  className="p-1 hover:bg-[hsl(var(--snug-light-gray))] rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
                </button>
              )}
            </div>

            {expandedSection === 'location' && (
              <div className="px-4 pb-4">
                <div className="border-t border-[hsl(var(--snug-border))] pt-3">
                  <p className="text-xs font-semibold text-[hsl(var(--snug-text-primary))] mb-3">
                    {t('popularSearches')}
                  </p>
                  <div className="space-y-1">
                    {popularLocations.map((loc) => (
                      <button
                        key={loc.dong}
                        type="button"
                        onClick={() => handleLocationSelect(loc.dong, loc.gu)}
                        className="w-full text-left py-2 text-sm text-[hsl(var(--snug-text-primary))] hover:bg-[hsl(var(--snug-light-gray))] rounded transition-colors"
                      >
                        {loc.dong}, {loc.gu}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dates Section */}
          <div
            ref={datesRef}
            className={`border rounded-2xl mb-3 transition-all duration-300 overflow-hidden ${
              expandedSection === 'dates'
                ? 'border-[#ff7900] border-2'
                : 'border-[hsl(var(--snug-border))]'
            }`}
          >
            <div className="flex items-center justify-between p-4">
              <button
                type="button"
                onClick={() => setExpandedSection(expandedSection === 'dates' ? 'none' : 'dates')}
                className="flex items-center gap-2 flex-1"
              >
                <Calendar className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
                <span
                  className={`text-sm ${dateRangeText ? 'text-[hsl(var(--snug-text-primary))]' : 'text-[hsl(var(--snug-placeholder))]'}`}
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

            {expandedSection === 'dates' && (
              <div className="px-4 pb-4">
                <div className="border-t border-[hsl(var(--snug-border))] pt-3">
                  <DatePicker
                    checkIn={checkIn}
                    checkOut={checkOut}
                    onDateSelect={handleDateSelect}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Guests Section */}
          <div
            ref={guestsRef}
            className={`border rounded-2xl transition-all duration-300 overflow-hidden ${
              expandedSection === 'guests'
                ? 'border-[#ff7900] border-2'
                : 'border-[hsl(var(--snug-border))]'
            }`}
          >
            <button
              type="button"
              onClick={() => setExpandedSection(expandedSection === 'guests' ? 'none' : 'guests')}
              className="w-full flex items-center gap-2 p-4"
            >
              <Users className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
              <span
                className={`text-sm ${guestSummary ? 'text-[hsl(var(--snug-text-primary))]' : 'text-[hsl(var(--snug-placeholder))]'}`}
              >
                {guestSummary || t('guests')}
              </span>
            </button>

            {expandedSection === 'guests' && (
              <div className="px-4 pb-4">
                <div className="border-t border-[hsl(var(--snug-border))] pt-3">
                  <GuestPicker guests={guests} onGuestChange={handleGuestChange} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[hsl(var(--snug-border))] px-4 py-4 flex items-center gap-4">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 text-sm text-[hsl(var(--snug-text-primary))]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          <button
            type="button"
            onClick={handleSearch}
            className="flex-1 bg-[hsl(var(--snug-orange))] text-white py-3 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Show Results
          </button>
        </div>
      </div>
    </>
  );
}
