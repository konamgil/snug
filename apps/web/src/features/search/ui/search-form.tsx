'use client';

import { useTranslations } from 'next-intl';
import { MapPin, Calendar, Users, Search } from 'lucide-react';

interface SearchFormProps {
  className?: string;
}

export function SearchForm({ className }: SearchFormProps) {
  const t = useTranslations('home.search');

  return (
    <div
      className={`bg-white border border-[hsl(var(--snug-border))] rounded-[20px] p-4 w-full max-w-[350px] ${className ?? ''}`}
    >
      {/* Location Input */}
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-3 h-3 text-[hsl(var(--snug-gray))]" />
        <input
          type="text"
          placeholder={t('location')}
          className="flex-1 text-xs text-[hsl(var(--snug-placeholder))] placeholder:text-[hsl(var(--snug-placeholder))] bg-transparent outline-none tracking-tight"
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
  );
}
