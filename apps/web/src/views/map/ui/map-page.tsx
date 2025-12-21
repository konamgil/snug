'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { MobileNav } from '@/widgets/mobile-nav';
import { MobileSearchBar } from '@/views/search/ui/mobile-search-bar';
import { SearchMap } from '@/views/search/ui/search-map';
import { SearchModal, type SearchParams } from '@/features/search';
import { FilterModal, type FilterState } from '@/views/search/ui/filter-modal';
import type { Room } from '@/views/search/ui/room-card';

// Mock data with Gangnam area coordinates
const MOCK_ROOMS: Room[] = [
  {
    id: '1',
    title: 'Cozy Studio',
    location: 'Nonhyeon-dong',
    district: 'Gangnam-gu',
    rooms: 1,
    bathrooms: 1,
    beds: 2,
    guests: 2,
    originalPrice: 200,
    price: 150,
    nights: 2,
    tags: [
      { label: 'Shared Room', color: 'orange' },
      { label: 'Apartment', color: 'purple' },
    ],
    imageUrl: '/images/rooms/room-1.jpg',
    lat: 37.5145,
    lng: 127.0352,
  },
  {
    id: '2',
    title: 'Spacious Apartment',
    location: 'Cheongdam-dong',
    district: 'Gangnam-gu',
    rooms: 2,
    bathrooms: 1,
    beds: 3,
    guests: 4,
    price: 160,
    nights: 10,
    tags: [
      { label: 'House', color: 'orange' },
      { label: 'Apartment', color: 'purple' },
    ],
    imageUrl: '/images/rooms/room-2.jpg',
    lat: 37.5205,
    lng: 127.0535,
  },
  {
    id: '3',
    title: 'Modern Share House',
    location: 'Nonhyeon-dong',
    district: 'Gangnam-gu',
    rooms: 1,
    bathrooms: 1,
    beds: 2,
    guests: 2,
    price: 210,
    nights: 2,
    tags: [
      { label: 'Shared Room', color: 'orange' },
      { label: 'Apartment', color: 'purple' },
    ],
    imageUrl: '/images/rooms/room-3.jpg',
    lat: 37.5172,
    lng: 127.0405,
  },
  {
    id: '4',
    title: 'Luxury Suite',
    location: 'Cheongdam-dong',
    district: 'Gangnam-gu',
    rooms: 2,
    bathrooms: 1,
    beds: 3,
    guests: 4,
    price: 350,
    nights: 10,
    tags: [
      { label: 'Shared House', color: 'orange' },
      { label: 'Apartment', color: 'purple' },
    ],
    imageUrl: '/images/rooms/room-4.jpg',
    lat: 37.5158,
    lng: 127.0475,
  },
];

function MapPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState | null>(null);

  const hasActiveFilters =
    activeFilters !== null &&
    (activeFilters.roomTypes.length > 0 ||
      activeFilters.propertyTypes.length > 0 ||
      activeFilters.apartmentSize !== null ||
      activeFilters.houseRules.length > 0 ||
      activeFilters.facilities.length > 0 ||
      activeFilters.amenities.length > 0);

  const locationValue = searchParams.get('location') || '';
  const checkInParam = searchParams.get('checkIn');
  const checkOutParam = searchParams.get('checkOut');
  const guestsParam = searchParams.get('guests');

  const checkIn = checkInParam ? new Date(checkInParam) : null;
  const checkOut = checkOutParam ? new Date(checkOutParam) : null;
  const totalGuests = guestsParam ? parseInt(guestsParam, 10) : 0;

  const displayLocation = locationValue || 'Gangnam-gu, Seoul-si';

  const formatDateDisplay = () => {
    if (!checkIn && !checkOut) return '';
    const formatDate = (date: Date) => {
      const month = date.toLocaleString('en-US', { month: 'short' });
      const day = date.getDate();
      const year = date.getFullYear().toString().slice(-2);
      return `${month} ${day}, ${year}`;
    };
    if (checkIn && checkOut) {
      return `${formatDate(checkIn)} - ${formatDate(checkOut)}`;
    }
    if (checkIn) {
      return formatDate(checkIn);
    }
    return '';
  };

  const handleSearch = (params: SearchParams) => {
    const newSearchParams = new URLSearchParams();
    if (params.location) newSearchParams.set('location', params.location);
    if (params.checkIn)
      newSearchParams.set('checkIn', params.checkIn.toISOString().substring(0, 10));
    if (params.checkOut)
      newSearchParams.set('checkOut', params.checkOut.toISOString().substring(0, 10));
    const newTotalGuests = params.guests.adults + params.guests.children;
    if (newTotalGuests > 0) newSearchParams.set('guests', newTotalGuests.toString());

    router.push(`/map?${newSearchParams.toString()}`);
    setIsSearchModalOpen(false);
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Mobile Header */}
      <div className="flex-shrink-0 sticky top-0 z-50 bg-white">
        <MobileSearchBar
          location={displayLocation}
          dateRange={formatDateDisplay()}
          guests={totalGuests}
          hasActiveFilters={hasActiveFilters}
          onSearchClick={() => setIsSearchModalOpen(true)}
          onFilterClick={() => setIsFilterModalOpen(true)}
        />
      </div>

      {/* Map - Full Screen */}
      <div className="flex-1 relative pb-16">
        <SearchMap rooms={MOCK_ROOMS} />
      </div>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSearch={handleSearch}
      />

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={(filters) => {
          setActiveFilters(filters);
          setIsFilterModalOpen(false);
        }}
      />
    </div>
  );
}

export function MapPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-white" />}>
      <MapPageContent />
    </Suspense>
  );
}
