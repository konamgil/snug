'use client';

import { MapPin, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface SearchTriggerProps {
  onClick: () => void;
  className?: string;
}

export function SearchTrigger({ onClick, className }: SearchTriggerProps) {
  const t = useTranslations('home.search');

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full max-w-[400px] bg-white border border-[hsl(var(--snug-border))] rounded-full px-4 py-3 flex items-center justify-between hover:border-[hsl(var(--snug-gray))] transition-colors ${className ?? ''}`}
    >
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
        <span className="text-sm text-[hsl(var(--snug-placeholder))]">{t('location')}</span>
      </div>
      <div className="w-8 h-8 rounded-full bg-[hsl(var(--snug-orange))] flex items-center justify-center">
        <Search className="w-4 h-4 text-white" />
      </div>
    </button>
  );
}
