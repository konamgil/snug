'use client';

import { MapIcon } from 'lucide-react';

export function SearchMapSkeleton() {
  return (
    <div className="w-full h-full bg-[hsl(var(--snug-light-gray))] rounded-2xl flex items-center justify-center animate-pulse">
      <div className="flex flex-col items-center gap-2 text-[hsl(var(--snug-gray))]">
        <MapIcon className="w-8 h-8" />
        <span className="text-sm">Loading map...</span>
      </div>
    </div>
  );
}
