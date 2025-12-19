'use client';

import { useState } from 'react';
import { Header } from '@/widgets/header';
import { HeroBanner } from '@/widgets/hero-banner';
import { MobileNav } from '@/widgets/mobile-nav';
import { SearchForm } from '@/features/search';
import { SnugLogo, ViewOnMapButton } from '@/shared/ui';

export function HomePage() {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 flex flex-col items-center px-5 md:px-4 pt-8 md:pt-12 pb-28 md:pb-24">
        {/* Logo */}
        <SnugLogo className="mb-6 md:mb-8" />

        {/* Search Form */}
        <SearchForm className="mb-4 md:mb-6" onFocusChange={setIsSearchFocused} />

        {/* Hero Banner Carousel - hidden when search is focused */}
        {!isSearchFocused && <HeroBanner className="mb-6 md:mb-8" />}

        {/* View on Map Button */}
        <ViewOnMapButton />
      </main>

      {/* Mobile Navigation - visible on mobile only */}
      <MobileNav />
    </div>
  );
}
