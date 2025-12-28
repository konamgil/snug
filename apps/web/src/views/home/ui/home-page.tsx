'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Header } from '@/widgets/header';
import { HeroBanner } from '@/widgets/hero-banner';
import { MobileNav } from '@/widgets/mobile-nav';
import { SearchForm, SearchModal, SearchTrigger, type SearchParams } from '@/features/search';
import { SnugLogo, ViewOnMapButton } from '@/shared/ui';

export function HomePage() {
  const router = useRouter();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSearch = (params: SearchParams) => {
    // Build query string
    const searchParams = new URLSearchParams();
    if (params.location) searchParams.set('location', params.location);
    if (params.checkIn) searchParams.set('checkIn', params.checkIn.toISOString().substring(0, 10));
    if (params.checkOut)
      searchParams.set('checkOut', params.checkOut.toISOString().substring(0, 10));
    const totalGuests = params.guests.adults + params.guests.children;
    if (totalGuests > 0) searchParams.set('guests', totalGuests.toString());

    // Navigate to search page
    router.push(`/search?${searchParams.toString()}`);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 flex flex-col items-center px-5 md:px-4 pt-[15vh] md:pt-[18vh] pb-28 md:pb-24">
        {/* Logo */}
        <SnugLogo className="mb-6 md:mb-8" />

        {/* Mobile: Search Trigger */}
        <div className="md:hidden w-full flex justify-center mb-4">
          <SearchTrigger onClick={() => setIsModalOpen(true)} />
        </div>

        {/* Desktop: Search Form */}
        <div className="hidden md:flex md:justify-center w-full mb-6">
          <SearchForm onFocusChange={setIsSearchFocused} onSearch={handleSearch} />
        </div>

        {/* Hero Banner Carousel - hidden when search is focused (desktop only) */}
        {!isSearchFocused && <HeroBanner className="mb-6 md:mb-8" />}

        {/* View on Map Button - 빈 검색과 동일하게 동작 */}
        <ViewOnMapButton onClick={() => router.push('/search')} />
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
