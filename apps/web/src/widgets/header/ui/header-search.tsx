'use client';

import { MapPin, Calendar, User, Search } from 'lucide-react';

interface HeaderSearchProps {
  className?: string;
}

export function HeaderSearch({ className }: HeaderSearchProps) {
  return (
    <div
      className={`flex items-center border border-[hsl(var(--snug-border))] rounded-full pl-5 pr-1.5 py-1.5 ${className ?? ''}`}
    >
      <button className="flex items-center gap-2 pr-8">
        <MapPin className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
        <span className="text-sm text-[hsl(var(--snug-gray))]">Find your snug stay</span>
      </button>
      <button className="flex items-center gap-2 px-8">
        <Calendar className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
        <span className="text-sm text-[hsl(var(--snug-gray))]">Stay Dates</span>
      </button>
      <button className="flex items-center gap-2 pl-8 pr-4">
        <User className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
        <span className="text-sm text-[hsl(var(--snug-gray))]">Guests</span>
      </button>
      <button className="w-8 h-8 bg-[hsl(var(--snug-orange))] rounded-full flex items-center justify-center hover:opacity-90 transition-opacity">
        <Search className="w-4 h-4 text-white" />
      </button>
    </div>
  );
}
