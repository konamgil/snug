'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { MapIcon } from '@/shared/ui/icons';
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
import { getPublicAccommodations } from '@/shared/api/accommodation';
import type { AccommodationListItem, AccommodationSearchParams } from '@snug/types';

// 숙소 타입 → 태그 라벨 변환
const accommodationTypeLabels: Record<string, string> = {
  HOUSE: 'House',
  SHARE_ROOM: 'Shared Room',
  SHARE_HOUSE: 'Share House',
  APARTMENT: 'Apartment',
};

const buildingTypeLabels: Record<string, string> = {
  APARTMENT: 'Apartment',
  VILLA: 'Villa',
  HOUSE: 'House',
  OFFICETEL: 'Officetel',
};

// API 응답 → Room 타입 변환
function mapAccommodationToRoom(item: AccommodationListItem, nights: number = 1): Room {
  const tags: Room['tags'] = [];

  // 숙소 타입 태그
  if (item.accommodationType) {
    tags.push({
      label: accommodationTypeLabels[item.accommodationType] || item.accommodationType,
      color: 'orange',
    });
  }

  // 건물 타입 태그
  if (item.buildingType) {
    tags.push({
      label: buildingTypeLabels[item.buildingType] || item.buildingType,
      color: 'purple',
    });
  }

  return {
    id: item.id,
    title: item.roomName,
    // 영문 주소 표시: sigunguEn (구/군), sidoEn (시/도)
    location: item.sigunguEn || item.nearestStation || 'Seoul',
    district: item.sidoEn || 'Seoul',
    rooms: item.roomCount,
    bathrooms: item.bathroomCount,
    beds: 1, // 상세 정보는 상세 페이지에서
    guests: item.capacity,
    price: item.basePrice,
    nights,
    tags,
    imageUrl: item.thumbnailUrl || '/images/rooms/placeholder.jpg',
    lat: item.latitude || 37.5665,
    lng: item.longitude || 126.978,
  };
}

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

  // 실제 API 데이터 상태
  const [rooms, setRooms] = useState<Room[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // 날짜로 숙박일 계산
  const calculateNights = useCallback(() => {
    if (checkIn && checkOut) {
      const diffTime = checkOut.getTime() - checkIn.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 1;
    }
    return 1;
  }, [checkIn, checkOut]);

  // sortOption → API sortBy 변환
  const mapSortOption = useCallback((option: SortOption): AccommodationSearchParams['sortBy'] => {
    switch (option) {
      case 'priceLow':
        return 'price_asc';
      case 'priceHigh':
        return 'price_desc';
      case 'newest':
        return 'newest';
      default:
        return 'recommended';
    }
  }, []);

  // 숙소 목록 가져오기
  const fetchAccommodations = useCallback(async () => {
    setIsLoading(true);
    try {
      const totalGuests = guests.adults + guests.children;
      const params: AccommodationSearchParams = {
        location: locationValue || undefined,
        guests: totalGuests > 0 ? totalGuests : undefined,
        sortBy: mapSortOption(sortOption),
      };

      const result = await getPublicAccommodations(params);
      const nights = calculateNights();
      const mappedRooms = result.data.map((item: AccommodationListItem) =>
        mapAccommodationToRoom(item, nights),
      );

      setRooms(mappedRooms);
      setTotalCount(result.total);
    } catch (error) {
      console.error('Failed to fetch accommodations:', error);
      setRooms([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [locationValue, guests, sortOption, calculateNights, mapSortOption]);

  // 초기 로딩 및 검색 조건 변경 시 데이터 fetch
  useEffect(() => {
    fetchAccommodations();
  }, [fetchAccommodations]);

  const displayLocation = locationValue || 'Seoul';
  const searchLocation = locationValue ? locationValue.split(',')[0]?.trim() || 'Seoul' : 'Seoul';

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
                  ← {t('resultsCount', { count: totalCount, location: searchLocation })}
                </button>
              ) : (
                <p className="text-sm text-[hsl(var(--snug-gray))]">
                  {isLoading
                    ? 'Loading...'
                    : t('resultsCount', { count: totalCount, location: searchLocation })}
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
              {isLoading ? (
                <div className="col-span-2 py-12 text-center text-[hsl(var(--snug-gray))]">
                  Loading accommodations...
                </div>
              ) : rooms.length === 0 ? (
                <div className="col-span-2 py-12 text-center text-[hsl(var(--snug-gray))]">
                  No accommodations found
                </div>
              ) : selectedMapRoomId ? (
                // Show only selected room
                rooms
                  .filter((room) => room.id === selectedMapRoomId)
                  .map((room) => <RoomCard key={room.id} room={room} viewMode="list" />)
              ) : (
                // Show all rooms
                rooms.map((room) => <RoomCard key={room.id} room={room} viewMode={view} />)
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Map */}
        <div className="flex-1 sticky top-20 h-[calc(100vh-80px)] p-4">
          <div className="w-full h-full rounded-2xl overflow-hidden">
            <SearchMap rooms={rooms} onRoomSelect={setSelectedMapRoomId} />
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden pb-28">
        {/* Results Header */}
        <div className="flex items-center justify-between px-4 py-2.5">
          <p className="text-[13px] text-[hsl(var(--snug-gray))]">
            {isLoading
              ? 'Loading...'
              : t('resultsCount', { count: totalCount, location: searchLocation })}
          </p>
          <SortDropdown value={sortOption} onChange={setSortOption} />
        </div>

        {/* Room List - Mobile uses larger cards */}
        <div className="px-4 space-y-6">
          {isLoading ? (
            <div className="py-12 text-center text-[hsl(var(--snug-gray))]">
              Loading accommodations...
            </div>
          ) : rooms.length === 0 ? (
            <div className="py-12 text-center text-[hsl(var(--snug-gray))]">
              No accommodations found
            </div>
          ) : (
            rooms.map((room) => <RoomCard key={room.id} room={room} viewMode="mobile" />)
          )}
        </div>

        {/* View on Map Button - Floating */}
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40">
          <Link
            href="/map"
            className="flex items-center gap-2 px-5 py-2.5 bg-[hsl(var(--snug-orange))] text-white rounded-full shadow-lg hover:opacity-90 transition-opacity"
          >
            <MapIcon className="w-4 h-4" />
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
