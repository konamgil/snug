'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { MobileNav } from '@/widgets/mobile-nav';
import { MobileSearchBar } from '@/views/search/ui/mobile-search-bar';
import { SearchMap } from '@/views/search/ui/search-map';
import { SearchModal, type SearchParams } from '@/features/search';
import { FilterModal, type FilterState } from '@/views/search/ui/filter-modal';
import type { Room } from '@/views/search/ui/room-card';
import { getPublicAccommodations } from '@/shared/api/accommodation';
import { getAccommodationTypeLabel, getBuildingTypeLabel } from '@/shared/lib';
import type { AccommodationListItem } from '@snug/types';

// API 응답 → Room 타입 변환
function mapAccommodationToRoom(
  item: AccommodationListItem,
  nights: number = 1,
  locale: string = 'en',
): Room {
  const tags: Room['tags'] = [];

  if (item.accommodationType) {
    tags.push({
      label: getAccommodationTypeLabel(item.accommodationType, locale),
      color: 'orange',
    });
  }

  if (item.buildingType) {
    tags.push({
      label: getBuildingTypeLabel(item.buildingType, locale),
      color: 'purple',
    });
  }

  return {
    id: item.id,
    title: item.roomName,
    location: item.sigunguEn || item.nearestStation || 'Seoul',
    district: item.sidoEn || 'Seoul',
    rooms: item.roomCount,
    bathrooms: item.bathroomCount,
    beds: 1,
    guests: item.capacity,
    price: item.basePrice,
    nights,
    tags,
    imageUrl: item.thumbnailUrl || '/images/rooms/placeholder.jpg',
    lat: item.latitude || 37.5665,
    lng: item.longitude || 126.978,
  };
}

function MapPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const locationValue = searchParams.get('location') || '';
  const guestsParam = searchParams.get('guests');
  const totalGuests = guestsParam ? parseInt(guestsParam, 10) : 0;

  // 초기 지도 중심점 (URL 파라미터에서 가져옴)
  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');
  const initialCenter =
    latParam && lngParam ? { lat: parseFloat(latParam), lng: parseFloat(lngParam) } : undefined;

  // 숙소 목록 가져오기
  const fetchAccommodations = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getPublicAccommodations({
        location: locationValue || undefined,
        guests: totalGuests > 0 ? totalGuests : undefined,
      });
      const mappedRooms = result.data.map((item: AccommodationListItem) =>
        mapAccommodationToRoom(item, 1, locale),
      );
      setRooms(mappedRooms);
    } catch (error) {
      console.error('Failed to fetch accommodations:', error);
      setRooms([]);
    } finally {
      setIsLoading(false);
    }
  }, [locationValue, totalGuests, locale]);

  useEffect(() => {
    fetchAccommodations();
  }, [fetchAccommodations]);

  const hasActiveFilters =
    activeFilters !== null &&
    (activeFilters.roomTypes.length > 0 ||
      activeFilters.propertyTypes.length > 0 ||
      activeFilters.apartmentSize !== null ||
      activeFilters.houseRules.length > 0 ||
      activeFilters.facilities.length > 0 ||
      activeFilters.amenities.length > 0);

  const checkInParam = searchParams.get('checkIn');
  const checkOutParam = searchParams.get('checkOut');

  const checkIn = checkInParam ? new Date(checkInParam) : null;
  const checkOut = checkOutParam ? new Date(checkOutParam) : null;

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
    if (newTotalGuests > 0) {
      newSearchParams.set('guests', newTotalGuests.toString());
      newSearchParams.set('adults', params.guests.adults.toString());
      newSearchParams.set('children', params.guests.children.toString());
      newSearchParams.set('infants', params.guests.infants.toString());
    }

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
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-[hsl(var(--snug-light-gray))]">
            <p className="text-[hsl(var(--snug-gray))]">Loading...</p>
          </div>
        ) : (
          <SearchMap rooms={rooms} initialCenter={initialCenter} />
        )}
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
