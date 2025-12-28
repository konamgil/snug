'use client';

import Image from 'next/image';
import { Bell, User, Menu, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { CollapseIcon } from '@/shared/ui/icons';
import { useBreadcrumb } from './host-breadcrumb-context';
import { useAuthStore } from '@/shared/stores';

interface HostHeaderProps {
  onToggleSidebar?: () => void;
  onOpenDrawer?: () => void;
  isSidebarCollapsed?: boolean;
}

export function HostHeader({ onToggleSidebar, onOpenDrawer, isSidebarCollapsed }: HostHeaderProps) {
  const { breadcrumb, headerActions } = useBreadcrumb();
  const t = useTranslations('host.accommodation.list');
  const user = useAuthStore((state) => state.user);

  const displayName = user?.firstName
    ? user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName
    : (user?.email?.split('@')[0] ?? 'Guest');

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

      {/* Desktop: Collapse Button + Breadcrumb */}
      <div className="hidden md:flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 hover:bg-[hsl(var(--snug-light-gray))] rounded-lg transition-colors"
          aria-label="Toggle sidebar"
        >
          <CollapseIcon
            className={`w-4 h-4 text-[hsl(var(--snug-text-primary))] transition-transform ${isSidebarCollapsed ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Breadcrumb */}
        {breadcrumb.length > 0 && (
          <nav className="flex items-center gap-2 text-sm">
            {breadcrumb.map((item, index) => (
              <span key={item} className="flex items-center gap-2">
                {index > 0 && <ChevronRight className="w-4 h-4 text-[hsl(var(--snug-gray))]" />}
                {index === breadcrumb.length - 1 ? (
                  <span className="font-bold text-[hsl(var(--snug-text-primary))]">{item}</span>
                ) : (
                  <Link
                    href="/host/properties"
                    className="text-[hsl(var(--snug-gray))] hover:text-[hsl(var(--snug-text-primary))] transition-colors"
                  >
                    {item}
                  </Link>
                )}
              </span>
            ))}
          </nav>
        )}
      </div>

      {/* Center - Header Actions (Date + Toggle) */}
      {headerActions.onToggleOperating && (
        <div className="hidden md:flex items-center gap-4 text-sm">
          {headerActions.lastModifiedBy && (
            <>
              <span className="text-[hsl(var(--snug-gray))]">{headerActions.lastModifiedBy}</span>
              <span className="text-[hsl(var(--snug-border))]">|</span>
            </>
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => headerActions.onToggleOperating?.(!headerActions.isOperating)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                headerActions.isOperating
                  ? 'bg-[hsl(var(--snug-orange))]'
                  : 'bg-[hsl(var(--snug-gray))]'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  headerActions.isOperating ? 'left-7' : 'left-1'
                }`}
              />
            </button>
            <span className="text-[hsl(var(--snug-text-primary))]">
              {headerActions.isOperating ? t('operating') : t('notOperating')}
            </span>
          </div>
        </div>
      )}

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
          <span className="text-sm font-medium text-[hsl(var(--snug-text-primary))]">
            {displayName}님
          </span>
        </div>
      </div>
    </header>
  );
}
