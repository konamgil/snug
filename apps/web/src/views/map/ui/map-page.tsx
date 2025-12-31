'use client';

import { useState, useEffect, useCallback, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { MobileNav } from '@/widgets/mobile-nav';
import { MobileSearchBar } from '@/views/search/ui/mobile-search-bar';
import { SearchMap } from '@/views/search/ui/search-map';
import { SearchModal, type SearchParams } from '@/features/search';
import { FilterModal, type FilterState } from '@/views/search/ui/filter-modal';
import type { Room } from '@/views/search/ui/room-card';
import { getPublicAccommodations } from '@/shared/api/accommodation';
import { getAccommodationTypeLabel, getBuildingTypeLabel } from '@/shared/lib';
import type {
  AccommodationListItem,
  AccommodationSearchParams,
  AccommodationType,
  BuildingType,
  GenderRule,
} from '@snug/types';

// API 타입 → UI 필터 역매핑
const accommodationTypeToRoomType: Record<AccommodationType, string> = {
  HOUSE: 'House',
  SHARE_HOUSE: 'Shared House',
  SHARE_ROOM: 'Shared Room',
  APARTMENT: 'House', // fallback
};

const buildingTypeToPropertyType: Record<BuildingType, string> = {
  APARTMENT: 'Apartment',
  VILLA: 'Villa',
  HOUSE: 'House',
  OFFICETEL: 'Officetel',
};

const genderRuleToHouseRule: Record<GenderRule, string> = {
  FEMALE_ONLY: 'Women Only',
  MALE_ONLY: 'Men Only',
  PET_ALLOWED: 'Pets allowed',
};

// UI 필터 → API 타입 매핑
const roomTypeToAccommodationType: Record<string, AccommodationType> = {
  House: 'HOUSE',
  'Shared House': 'SHARE_HOUSE',
  'Shared Room': 'SHARE_ROOM',
};

const propertyTypeToBuildingType: Record<string, BuildingType> = {
  Apartment: 'APARTMENT',
  Villa: 'VILLA',
  House: 'HOUSE',
  Officetel: 'OFFICETEL',
};

const houseRuleToGenderRule: Record<string, GenderRule> = {
  'Women Only': 'FEMALE_ONLY',
  'Men Only': 'MALE_ONLY',
  'Pets allowed': 'PET_ALLOWED',
};

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
  const t = useTranslations('search');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // URL에서 검색 파라미터 읽기
  const locationValue = searchParams.get('location') || '';
  const guestsParam = searchParams.get('guests');
  const totalGuests = guestsParam ? parseInt(guestsParam, 10) : 0;
  const checkInParam = searchParams.get('checkIn');
  const checkOutParam = searchParams.get('checkOut');
  const checkIn = checkInParam ? new Date(checkInParam) : null;
  const checkOut = checkOutParam ? new Date(checkOutParam) : null;

  // URL에서 필터 파라미터 읽기 (useMemo로 안정화)
  const minPriceParam = searchParams.get('minPrice');
  const maxPriceParam = searchParams.get('maxPrice');
  const sortByParam = searchParams.get('sortBy') as AccommodationSearchParams['sortBy'] | null;

  // 배열 파라미터는 문자열로 비교하여 안정화
  const accommodationTypesStr = searchParams.getAll('accommodationType').join(',');
  const buildingTypesStr = searchParams.getAll('buildingType').join(',');
  const genderRulesStr = searchParams.getAll('genderRules').join(',');

  const accommodationTypes = useMemo(
    () => (accommodationTypesStr ? accommodationTypesStr.split(',') : []) as AccommodationType[],
    [accommodationTypesStr],
  );
  const buildingTypes = useMemo(
    () => (buildingTypesStr ? buildingTypesStr.split(',') : []) as BuildingType[],
    [buildingTypesStr],
  );
  const genderRules = useMemo(
    () => (genderRulesStr ? genderRulesStr.split(',') : []) as GenderRule[],
    [genderRulesStr],
  );

  // URL 파라미터에서 FilterState 복원
  const activeFilters = useMemo((): FilterState | null => {
    const hasFilters =
      minPriceParam ||
      maxPriceParam ||
      accommodationTypes.length > 0 ||
      buildingTypes.length > 0 ||
      genderRules.length > 0;

    if (!hasFilters) return null;

    return {
      budgetMin: minPriceParam ? parseInt(minPriceParam, 10) : 0,
      budgetMax: maxPriceParam ? parseInt(maxPriceParam, 10) : 10000,
      roomTypes: accommodationTypes
        .map((type) => accommodationTypeToRoomType[type])
        .filter(Boolean),
      propertyTypes: buildingTypes.map((type) => buildingTypeToPropertyType[type]).filter(Boolean),
      apartmentSize: null,
      houseRules: genderRules.map((rule) => genderRuleToHouseRule[rule]).filter(Boolean),
      facilities: [],
      amenities: [],
    };
  }, [minPriceParam, maxPriceParam, accommodationTypes, buildingTypes, genderRules]);

  // 초기 지도 중심점 계산
  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');
  const initialCenter = useMemo(() => {
    // 1. URL에 lat/lng가 있으면 사용
    if (latParam && lngParam) {
      return { lat: parseFloat(latParam), lng: parseFloat(lngParam) };
    }
    // 2. 로드된 숙소가 있으면 첫 번째 숙소 좌표 사용
    if (rooms.length > 0 && rooms[0]) {
      return { lat: rooms[0].lat, lng: rooms[0].lng };
    }
    // 3. 없으면 undefined (SearchMap의 기본값 사용)
    return undefined;
  }, [latParam, lngParam, rooms]);

  // 숙소 목록 가져오기 (모든 필터 적용)
  const fetchAccommodations = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: AccommodationSearchParams = {
        location: locationValue || undefined,
        guests: totalGuests > 0 ? totalGuests : undefined,
        sortBy: sortByParam || 'recommended',
      };

      // 필터 파라미터 적용
      if (accommodationTypes.length > 0) {
        params.accommodationType = accommodationTypes;
      }
      if (buildingTypes.length > 0) {
        params.buildingType = buildingTypes;
      }
      if (genderRules.length > 0) {
        params.genderRules = genderRules;
      }
      if (minPriceParam) {
        params.minPrice = parseInt(minPriceParam, 10);
      }
      if (maxPriceParam) {
        params.maxPrice = parseInt(maxPriceParam, 10);
      }

      const result = await getPublicAccommodations(params);
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
  }, [
    locationValue,
    totalGuests,
    locale,
    accommodationTypes,
    buildingTypes,
    genderRules,
    minPriceParam,
    maxPriceParam,
    sortByParam,
  ]);

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
      activeFilters.amenities.length > 0 ||
      activeFilters.budgetMin > 0 ||
      activeFilters.budgetMax < 10000);

  const displayLocation = locationValue || t('anywhere');

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

    // 기존 필터 파라미터 유지
    accommodationTypes.forEach((type) => newSearchParams.append('accommodationType', type));
    buildingTypes.forEach((type) => newSearchParams.append('buildingType', type));
    genderRules.forEach((rule) => newSearchParams.append('genderRules', rule));
    if (minPriceParam) newSearchParams.set('minPrice', minPriceParam);
    if (maxPriceParam) newSearchParams.set('maxPrice', maxPriceParam);
    if (sortByParam) newSearchParams.set('sortBy', sortByParam);

    router.push(`/map?${newSearchParams.toString()}`);
    setIsSearchModalOpen(false);
  };

  // FilterModal에서 필터 적용 시 URL 업데이트
  const handleFilterApply = (filters: FilterState) => {
    const newSearchParams = new URLSearchParams();

    // 기존 검색 파라미터 유지
    if (locationValue) newSearchParams.set('location', locationValue);
    if (checkIn) newSearchParams.set('checkIn', checkIn.toISOString().substring(0, 10));
    if (checkOut) newSearchParams.set('checkOut', checkOut.toISOString().substring(0, 10));
    if (totalGuests > 0) {
      newSearchParams.set('guests', totalGuests.toString());
      const adults = searchParams.get('adults');
      const children = searchParams.get('children');
      const infants = searchParams.get('infants');
      if (adults) newSearchParams.set('adults', adults);
      if (children) newSearchParams.set('children', children);
      if (infants) newSearchParams.set('infants', infants);
    }
    if (sortByParam) newSearchParams.set('sortBy', sortByParam);

    // 새 필터 파라미터 설정
    if (filters.budgetMin > 0) {
      newSearchParams.set('minPrice', filters.budgetMin.toString());
    }
    if (filters.budgetMax < 10000) {
      newSearchParams.set('maxPrice', filters.budgetMax.toString());
    }
    if (filters.roomTypes.length > 0) {
      filters.roomTypes.forEach((type) => {
        const apiType = roomTypeToAccommodationType[type];
        if (apiType) newSearchParams.append('accommodationType', apiType);
      });
    }
    if (filters.propertyTypes.length > 0) {
      filters.propertyTypes.forEach((type) => {
        const apiType = propertyTypeToBuildingType[type];
        if (apiType) newSearchParams.append('buildingType', apiType);
      });
    }
    if (filters.houseRules.length > 0) {
      filters.houseRules.forEach((rule) => {
        const apiRule = houseRuleToGenderRule[rule];
        if (apiRule) newSearchParams.append('genderRules', apiRule);
      });
    }

    router.push(`/map?${newSearchParams.toString()}`);
    setIsFilterModalOpen(false);
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
        initialFilters={activeFilters || undefined}
        onApply={handleFilterApply}
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
