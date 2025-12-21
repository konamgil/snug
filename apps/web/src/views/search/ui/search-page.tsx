'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Map } from 'lucide-react';
import { Link, useRouter } from '@/i18n/navigation';
import { Header, type SearchBarValues } from '@/widgets/header';
import { type GuestCount } from '@/features/search/ui/guest-picker';
import { SearchModal, type SearchParams } from '@/features/search';
import { MobileNav } from '@/widgets/mobile-nav';
import { FilterBar } from './filter-bar';
import { RoomCard, type Room } from './room-card';
import { SearchMap } from './search-map';
import { MobileSearchBar } from './mobile-search-bar';
import { SortDropdown, type SortOption } from './sort-dropdown';
import { FilterModal, type FilterState } from './filter-modal';

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
    price: 160,
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
    price: 240,
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
    originalPrice: 200,
    price: 160,
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
    price: 210,
    nights: 10,
    tags: [
      { label: 'Shared House', color: 'orange' },
      { label: 'Apartment', color: 'purple' },
    ],
    imageUrl: '/images/rooms/room-4.jpg',
    lat: 37.5158,
    lng: 127.0475,
  },
  {
    id: '5',
    title: 'Comfortable Room',
    location: 'Nonhyeon-dong',
    district: 'Gangnam-gu',
    rooms: 1,
    bathrooms: 1,
    beds: 2,
    guests: 2,
    originalPrice: 200,
    price: 350,
    nights: 2,
    tags: [
      { label: 'House', color: 'orange' },
      { label: 'Hotel', color: 'purple' },
    ],
    imageUrl: '/images/rooms/room-5.jpg',
    lat: 37.5195,
    lng: 127.0565,
  },
  {
    id: '6',
    title: 'Premium Studio',
    location: 'Cheongdam-dong',
    district: 'Gangnam-gu',
    rooms: 2,
    bathrooms: 1,
    beds: 3,
    guests: 4,
    price: 500,
    nights: 10,
    tags: [
      { label: 'Shared Room', color: 'orange' },
      { label: 'Apartment', color: 'purple' },
    ],
    imageUrl: '/images/rooms/room-6.jpg',
    lat: 37.5132,
    lng: 127.0425,
  },
];

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations('search');
  const tHome = useTranslations('home');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sortOption, setSortOption] = useState<SortOption>('recommended');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState | null>(null);
  // Track selected room from map marker click (PC only)
  const [selectedMapRoomId, setSelectedMapRoomId] = useState<string | null>(null);

  const hasActiveFilters =
    activeFilters !== null &&
    (activeFilters.roomTypes.length > 0 ||
      activeFilters.propertyTypes.length > 0 ||
      activeFilters.apartmentSize !== null ||
      activeFilters.houseRules.length > 0 ||
      activeFilters.facilities.length > 0 ||
      activeFilters.amenities.length > 0);

  // Search state - used for both header and mobile
  const [locationValue, setLocationValue] = useState(searchParams.get('location') || '');
  const [checkIn, setCheckIn] = useState<Date | null>(() => {
    const checkInParam = searchParams.get('checkIn');
    return checkInParam ? new Date(checkInParam) : null;
  });
  const [checkOut, setCheckOut] = useState<Date | null>(() => {
    const checkOutParam = searchParams.get('checkOut');
    return checkOutParam ? new Date(checkOutParam) : null;
  });
  const [guests, setGuests] = useState<GuestCount>(() => {
    const guestsParam = searchParams.get('guests');
    const guestCount = guestsParam ? parseInt(guestsParam, 10) : 0;
    return { adults: guestCount, children: 0, infants: 0 };
  });

  const roomCount = MOCK_ROOMS.length;
  const displayLocation = locationValue || 'Gangnam-gu, Seoul-si';
  const searchLocation = locationValue
    ? locationValue.split(',')[0]?.trim() || 'Gangnam'
    : 'Gangnam';

  // Handle search from Header's search bar
  const handleHeaderSearch = (values: SearchBarValues) => {
    const newSearchParams = new URLSearchParams();
    if (values.location) newSearchParams.set('location', values.location);
    if (values.checkIn)
      newSearchParams.set('checkIn', values.checkIn.toISOString().substring(0, 10));
    if (values.checkOut)
      newSearchParams.set('checkOut', values.checkOut.toISOString().substring(0, 10));
    const newTotalGuests = values.guests.adults + values.guests.children;
    if (newTotalGuests > 0) newSearchParams.set('guests', newTotalGuests.toString());

    // Update local state
    setLocationValue(values.location);
    setCheckIn(values.checkIn);
    setCheckOut(values.checkOut);
    setGuests(values.guests);

    // Update URL
    router.push(`/search?${newSearchParams.toString()}`);
  };

  // Handle search from mobile modal
  const handleMobileSearch = (params: SearchParams) => {
    const newSearchParams = new URLSearchParams();
    if (params.location) newSearchParams.set('location', params.location);
    if (params.checkIn)
      newSearchParams.set('checkIn', params.checkIn.toISOString().substring(0, 10));
    if (params.checkOut)
      newSearchParams.set('checkOut', params.checkOut.toISOString().substring(0, 10));
    const newTotalGuests = params.guests.adults + params.guests.children;
    if (newTotalGuests > 0) newSearchParams.set('guests', newTotalGuests.toString());

    // Update local state
    setLocationValue(params.location);
    setCheckIn(params.checkIn);
    setCheckOut(params.checkOut);
    setGuests(params.guests);

    // Update URL
    router.push(`/search?${newSearchParams.toString()}`);
    setIsSearchModalOpen(false);
  };

  const totalGuests = guests.adults + guests.children;

  const formatDateDisplay = () => {
    if (!checkIn && !checkOut) return null;
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
    return null;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Desktop Header */}
      <Header
        variant="with-search"
        searchValues={{
          location: locationValue,
          checkIn,
          checkOut,
          guests,
        }}
        onSearch={handleHeaderSearch}
      />

      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-50 bg-white">
        <MobileSearchBar
          location={displayLocation}
          dateRange={formatDateDisplay() || ''}
          guests={totalGuests}
          hasActiveFilters={hasActiveFilters}
          onSearchClick={() => setIsSearchModalOpen(true)}
          onFilterClick={() => setIsFilterModalOpen(true)}
        />
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex">
        {/* Left Side - Room List */}
        <div className="w-[480px] flex-shrink-0 h-[calc(100vh-80px)] overflow-y-auto no-scrollbar">
          <div className="px-4">
            {/* Filter Bar - hide when room is selected from map */}
            {!selectedMapRoomId && <FilterBar currentView={view} onViewChange={setView} />}

            {/* Results Header */}
            <div className="flex items-center justify-between py-3">
              {selectedMapRoomId ? (
                <button
                  type="button"
                  onClick={() => setSelectedMapRoomId(null)}
                  className="text-sm text-[hsl(var(--snug-orange))] hover:underline"
                >
                  ← {t('resultsCount', { count: roomCount, location: searchLocation })}
                </button>
              ) : (
                <p className="text-sm text-[hsl(var(--snug-gray))]">
                  {t('resultsCount', { count: roomCount, location: searchLocation })}
                </p>
              )}
              {!selectedMapRoomId && <SortDropdown value={sortOption} onChange={setSortOption} />}
            </div>

            {/* Room List / Grid */}
            <div
              className={
                view === 'grid' && !selectedMapRoomId
                  ? 'grid grid-cols-2 gap-4 pb-6'
                  : 'space-y-0 pb-6'
              }
            >
              {selectedMapRoomId
                ? // Show only selected room
                  MOCK_ROOMS.filter((room) => room.id === selectedMapRoomId).map((room) => (
                    <RoomCard key={room.id} room={room} viewMode="list" />
                  ))
                : // Show all rooms
                  MOCK_ROOMS.map((room) => <RoomCard key={room.id} room={room} viewMode={view} />)}
            </div>
          </div>
        </div>

        {/* Right Side - Map */}
        <div className="flex-1 sticky top-20 h-[calc(100vh-80px)] p-4">
          <div className="w-full h-full rounded-2xl overflow-hidden">
            <SearchMap rooms={MOCK_ROOMS} onRoomSelect={setSelectedMapRoomId} />
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden pb-28">
        {/* Results Header */}
        <div className="flex items-center justify-between px-4 py-2.5">
          <p className="text-[13px] text-[hsl(var(--snug-gray))]">
            {t('resultsCount', { count: roomCount, location: searchLocation })}
          </p>
          <SortDropdown value={sortOption} onChange={setSortOption} />
        </div>

        {/* Room List - Mobile uses larger cards */}
        <div className="px-4 space-y-6">
          {MOCK_ROOMS.map((room) => (
            <RoomCard key={room.id} room={room} viewMode="mobile" />
          ))}
        </div>

        {/* View on Map Button - Floating */}
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40">
          <Link
            href="/map"
            className="flex items-center gap-2 px-5 py-2.5 bg-[hsl(var(--snug-orange))] text-white rounded-full shadow-lg hover:opacity-90 transition-opacity"
          >
            <Map className="w-4 h-4" />
            <span className="text-sm font-medium">{tHome('viewOnMap')}</span>
          </Link>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Filter Modal for Mobile */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={(filters) => {
          setActiveFilters(filters);
          setIsFilterModalOpen(false);
        }}
      />

      {/* Search Modal for Mobile */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSearch={handleMobileSearch}
      />
    </div>
  );
}

export function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <SearchPageContent />
    </Suspense>
  );
}
