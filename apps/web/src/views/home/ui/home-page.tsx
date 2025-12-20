'use client';

import { useState } from 'react';
import { Header } from '@/widgets/header';
import { HeroBanner } from '@/widgets/hero-banner';
import { MobileNav } from '@/widgets/mobile-nav';
import { SearchForm, SearchModal, SearchTrigger } from '@/features/search';
import { SnugLogo, ViewOnMapButton } from '@/shared/ui';

export function HomePage() {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSearch = () => {
    // TODO: Implement search with params
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 flex flex-col items-center px-5 md:px-4 pt-8 md:pt-12 pb-28 md:pb-24">
        {/* Logo */}
        <SnugLogo className="mb-6 md:mb-8" />

        {/* Mobile: Search Trigger */}
        <div className="md:hidden w-full flex justify-center mb-4">
          <SearchTrigger onClick={() => setIsModalOpen(true)} />
        </div>

        {/* Desktop: Search Form */}
        <div className="hidden md:flex md:justify-center w-full mb-6">
          <SearchForm onFocusChange={setIsSearchFocused} />
        </div>

        {/* Hero Banner Carousel - hidden when search is focused (desktop only) */}
        {!isSearchFocused && <HeroBanner className="mb-6 md:mb-8" />}

        {/* View on Map Button */}
        <ViewOnMapButton />
      </main>

      {/* Mobile Navigation - visible on mobile only */}
      <MobileNav />

      {/* Mobile Search Modal */}
      <SearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSearch={handleSearch}
      />
    </div>
  );
}
