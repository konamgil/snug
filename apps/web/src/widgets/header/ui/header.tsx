'use client';

import { ChevronLeft } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { SnugLogo } from '@/shared/ui';
import { HeaderActions } from './header-actions';
import { HeaderSearchBar, type SearchBarValues } from './header-search-bar';

export type HeaderVariant = 'default' | 'with-search' | 'with-back';

interface HeaderProps {
  /**
   * Header variant
   * - default: Logo + Right actions
   * - with-search: Logo + Center search bar + Right actions
   * - with-back: Mobile back button / Desktop: Logo + Right actions
   */
  variant?: HeaderVariant;
  /**
   * Show logo (only for default variant on mobile)
   */
  showLogo?: boolean;
  /**
   * Back button handler (for with-back and with-search variants on mobile)
   */
  onBack?: () => void;
  /**
   * Show search bar (for with-search variant, default: true)
   */
  showSearch?: boolean;
  /**
   * Search bar initial values (for with-search variant)
   */
  searchValues?: Partial<SearchBarValues>;
  /**
   * Search handler (for with-search variant)
   */
  onSearch?: (values: SearchBarValues) => void;
  /**
   * Custom height class (e.g., 'h-[92px]')
   */
  heightClass?: string;
  /**
   * Additional class names
   */
  className?: string;
}

export function Header({
  variant = 'default',
  showLogo = false,
  onBack,
  showSearch = true,
  searchValues,
  onSearch,
  heightClass,
  className,
}: HeaderProps) {
  // with-back variant: Mobile back button / Desktop full header
  if (variant === 'with-back') {
    return (
      <header className={`sticky top-0 z-50 bg-white ${className ?? ''}`}>
        {/* Mobile Header - Back button only */}
        <div className="lg:hidden px-4 h-14 flex items-center">
          <button
            type="button"
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-[hsl(var(--snug-light-gray))] rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
        {/* Desktop Header - Logo + Actions */}
        <div className="hidden lg:flex max-w-7xl mx-auto px-6 py-5 items-center justify-between">
          <Link href="/" className="flex-shrink-0">
            <SnugLogo className="h-8 w-auto" />
          </Link>
          <HeaderActions />
        </div>
      </header>
    );
  }

  // with-search variant: Logo + Center floating search + Actions (Tablet & Desktop)
  if (variant === 'with-search') {
    return (
      <header className={`sticky top-0 z-50 bg-white overflow-visible ${className ?? ''}`}>
        {/* Mobile Header - Back button (shown when onBack is provided) */}
        {onBack && (
          <div className="md:hidden px-4 h-14 flex items-center">
            <button
              type="button"
              onClick={onBack}
              className="p-2 -ml-2 hover:bg-[hsl(var(--snug-light-gray))] rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Tablet & Desktop Header */}
        <div className="hidden md:flex h-20 items-center justify-between px-6 overflow-visible">
          {/* Left: Logo */}
          <Link href="/" className="flex-shrink-0">
            <SnugLogo className="h-8 w-auto" />
          </Link>

          {/* Center: Placeholder to maintain layout (only when search is shown) */}
          {showSearch && (
            <div className="flex-1 flex justify-center px-8">
              <div className="relative max-w-[600px] md:max-w-[560px] w-full h-[44px]" />
            </div>
          )}

          {/* Spacer when search is hidden */}
          {!showSearch && <div className="flex-1" />}

          {/* Right: Actions */}
          <HeaderActions className="flex-shrink-0" />
        </div>

        {/* Floating Search Bar (only when showSearch is true) */}
        {showSearch && (
          <div className="hidden md:block fixed left-1/2 -translate-x-1/2 top-[18px] w-full max-w-[560px] z-[100] px-8">
            <HeaderSearchBar initialValues={searchValues} onSearch={onSearch} />
          </div>
        )}
      </header>
    );
  }

  // default variant: Simple header with optional logo
  return (
    <header className={`sticky top-0 z-50 w-full bg-white safe-top ${className ?? ''}`}>
      <div
        className={`flex items-center justify-between px-4 md:px-6 ${heightClass ?? 'h-14 md:h-16'}`}
      >
        {/* Left Side - Logo */}
        <div className="flex items-center">
          {showLogo && (
            <Link href="/">
              <SnugLogo />
            </Link>
          )}
        </div>
        {/* Right Side Actions - Hidden on mobile */}
        <HeaderActions className="hidden md:flex" />
      </div>
    </header>
  );
}
