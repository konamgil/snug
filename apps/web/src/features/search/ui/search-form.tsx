'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { MapPin, Calendar, Users, Search } from 'lucide-react';

interface SearchFormProps {
  className?: string;
  onFocusChange?: (focused: boolean) => void;
}

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

export function SearchForm({ className, onFocusChange }: SearchFormProps) {
  const t = useTranslations('home.search');
  const [isFocused, setIsFocused] = useState(false);
  const [locationValue, setLocationValue] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Notify parent when focus changes
  useEffect(() => {
    onFocusChange?.(isFocused);
  }, [isFocused, onFocusChange]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
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
    setIsFocused(false);
  };

  return (
    <div ref={containerRef} className={`relative w-full max-w-[350px] ${className ?? ''}`}>
      {/* Unified Container with Orange Border on Focus */}
      <div
        className={`bg-white border-2 rounded-[20px] w-full transition-all duration-300 ease-out overflow-hidden ${
          isFocused ? 'border-[#ff7900] shadow-lg' : 'border-[#d8d8d8]'
        }`}
      >
        {/* Main Search Form */}
        <div className="p-4">
          {/* Location Input */}
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-3 h-3 text-[hsl(var(--snug-gray))] flex-shrink-0" />
            <input
              type="text"
              placeholder={t('location')}
              value={locationValue}
              onChange={(e) => setLocationValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              className="flex-1 text-xs text-[hsl(var(--snug-text-primary))] placeholder:text-[hsl(var(--snug-placeholder))] bg-transparent outline-none tracking-tight"
            />
          </div>

          {/* Date and Guests Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Stay Dates */}
              <button
                type="button"
                className="flex items-center gap-1 text-xs text-[hsl(var(--snug-placeholder))] tracking-tight"
              >
                <Calendar className="w-3 h-3 text-[hsl(var(--snug-gray))]" />
                <span>{t('dates')}</span>
              </button>

              {/* Guests */}
              <button
                type="button"
                className="flex items-center gap-1 text-xs text-[hsl(var(--snug-placeholder))] tracking-tight"
              >
                <Users className="w-3 h-3 text-[hsl(var(--snug-gray))]" />
                <span>{t('guests')}</span>
              </button>
            </div>

            {/* Search Button */}
            <button
              type="button"
              className="w-8 h-8 rounded-full bg-[hsl(var(--snug-orange))] flex items-center justify-center hover:opacity-90 transition-opacity"
            >
              <Search className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>

        {/* Popular Searches Dropdown */}
        <div
          className={`transition-all duration-300 ease-out ${
            isFocused ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
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
      </div>
    </div>
  );
}
