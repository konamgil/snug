'use client';

import { useTranslations } from 'next-intl';
import { MapIcon } from '@/shared/ui/icons';

interface ViewOnMapButtonProps {
  className?: string;
  onClick?: () => void;
}

export function ViewOnMapButton({ className, onClick }: ViewOnMapButtonProps) {
  const t = useTranslations('home');

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-4 py-2 bg-[hsl(var(--snug-orange))] text-white rounded-full text-xs font-bold tracking-tight hover:opacity-90 transition-opacity ${className ?? ''}`}
    >
      <MapIcon className="w-[18px] h-[18px]" />
      <span>{t('viewOnMap')}</span>
    </button>
  );
}
