'use client';

import Image from 'next/image';
import { Bell, User, ChevronLeft, Menu } from 'lucide-react';

interface HostHeaderProps {
  onToggleSidebar?: () => void;
  onOpenDrawer?: () => void;
}

export function HostHeader({ onToggleSidebar, onOpenDrawer }: HostHeaderProps) {
  return (
    <header className="h-14 bg-[#f5f5f5] md:bg-white md:border-b md:border-[hsl(var(--snug-border))] flex items-center justify-between px-4">
      {/* Mobile: Hamburger + Logo */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          type="button"
          onClick={onOpenDrawer}
          className="p-2 hover:bg-[hsl(var(--snug-light-gray))] active:bg-[hsl(var(--snug-light-gray))] rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-[hsl(var(--snug-text-primary))]" />
        </button>
        <Image
          src="/images/logo/logo_hellosnug.svg"
          alt="hello, snug."
          width={120}
          height={28}
          className="h-7 w-auto"
        />
      </div>

      {/* Desktop: Collapse Button */}
      <button
        type="button"
        onClick={onToggleSidebar}
        className="hidden md:flex p-2 hover:bg-[hsl(var(--snug-light-gray))] rounded-lg transition-colors"
        aria-label="Toggle sidebar"
      >
        <ChevronLeft className="w-5 h-5 text-[hsl(var(--snug-text-primary))]" />
      </button>

      {/* Right - Actions */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button
          type="button"
          className="relative p-2 hover:bg-[hsl(var(--snug-light-gray))] active:bg-[hsl(var(--snug-light-gray))] rounded-lg transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-[hsl(var(--snug-text-primary))]" />
          {/* Notification dot */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[hsl(var(--snug-orange))] rounded-full" />
        </button>

        {/* User - Desktop only */}
        <div className="hidden md:flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[hsl(var(--snug-light-gray))] flex items-center justify-center">
            <User className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
          </div>
          <span className="text-sm font-medium text-[hsl(var(--snug-text-primary))]">SNUG님</span>
        </div>
      </div>
    </header>
  );
}
