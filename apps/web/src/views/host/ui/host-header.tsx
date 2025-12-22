'use client';

import { Bell, User, ChevronLeft } from 'lucide-react';

interface HostHeaderProps {
  onToggleSidebar?: () => void;
}

export function HostHeader({ onToggleSidebar }: HostHeaderProps) {
  return (
    <header className="h-14 bg-white border-b border-[hsl(var(--snug-border))] flex items-center justify-between px-4">
      {/* Left - Collapse Button */}
      <button
        type="button"
        onClick={onToggleSidebar}
        className="p-2 hover:bg-[hsl(var(--snug-light-gray))] rounded-lg transition-colors"
        aria-label="Toggle sidebar"
      >
        <ChevronLeft className="w-5 h-5 text-[hsl(var(--snug-text-primary))]" />
      </button>

      {/* Right - Actions */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button
          type="button"
          className="p-2 hover:bg-[hsl(var(--snug-light-gray))] rounded-lg transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-[hsl(var(--snug-text-primary))]" />
        </button>

        {/* User */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[hsl(var(--snug-light-gray))] flex items-center justify-center">
            <User className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
          </div>
          <span className="text-sm font-medium text-[hsl(var(--snug-text-primary))]">SNUG님</span>
        </div>
      </div>
    </header>
  );
}
