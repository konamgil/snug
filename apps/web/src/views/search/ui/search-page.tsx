'use client';

import { useState, useCallback, Suspense, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { MapIcon } from '@/shared/ui/icons';
import { useRouter } from '@/i18n/navigation';
import { Header, type SearchBarValues } from '@/widgets/header';
import { type GuestCount } from '@/features/search/ui/guest-picker';
import { SearchModal, type SearchParams } from '@/features/search';
import { MobileNav } from '@/widgets/mobile-nav';
import { FilterBar } from './filter-bar';
import { RoomCard, type Room } from './room-card';
import { RoomCardSkeletonList } from './room-card-skeleton';
import { SearchMap } from './search-map';
import { MobileSearchBar } from './mobile-search-bar';
import { SortDropdown, type SortOption } from './sort-dropdown';
import { FilterModal, type FilterState } from './filter-modal';
import type { RoomTypeOption } from './room-type-dropdown';
import { usePublicAccommodations } from '@/shared/api/accommodation';
import { getAccommodationTypeLabel, getBuildingTypeLabel, useDebouncedValue } from '@/shared/lib';
import type {
  AccommodationListItem,
  AccommodationSearchParams,
  AccommodationType,
  BuildingType,
  GenderRule,
} from '@snug/types';
import { logSearch } from '@/shared/lib/firebase';

// UI 필터 값 → API 파라미터 매핑 (FilterModal의 key 값 사용)
const roomTypeToAccommodationType: Record<string, AccommodationType> = {
  house: 'HOUSE',
  sharedHouse: 'SHARE_HOUSE',
  sharedRoom: 'SHARE_ROOM',
};

const propertyTypeToBuildingType: Record<string, BuildingType> = {
  apartment: 'APARTMENT',
  villa: 'VILLA',
  house: 'HOUSE',
  officetel: 'OFFICETEL',
};

const houseRuleToGenderRule: Record<string, GenderRule> = {
  womenOnly: 'FEMALE_ONLY',
  menOnly: 'MALE_ONLY',
  petsAllowed: 'PET_ALLOWED',
};

// Quick filter ID → houseRules key mapping (FilterModal의 key 값과 동일)
const quickFilterToHouseRule: Record<string, string> = {
  womenOnly: 'womenOnly',
  menOnly: 'menOnly',
  parking: 'parking', // parking은 별도 필터로 처리 필요
};

// RoomTypeOption → AccommodationType 매핑
const roomTypeOptionToAccommodationType: Record<string, AccommodationType | null> = {
  all: null,
  house: 'HOUSE',
  sharedHouse: 'SHARE_HOUSE',
  sharedRoom: 'SHARE_ROOM',
};

// API 응답 → Room 타입 변환
function mapAccommodationToRoom(
  item: AccommodationListItem,
  nights: number = 1,
  locale: string = 'en',
): Room {
  const tags: Room['tags'] = [];

  // 숙소 타입 태그 (다국어 지원)
  if (item.accommodationType) {
    tags.push({
      label: getAccommodationTypeLabel(item.accommodationType, locale),
      color: 'orange',
    });
  }

  // 건물 타입 태그 (다국어 지원)
  if (item.buildingType) {
    tags.push({
      label: getBuildingTypeLabel(item.buildingType, locale),
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
    imageCount: item.imageCount,
    lat: item.latitude || 37.5665,
    lng: item.longitude || 126.978,
  };
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('search');
  const tHome = useTranslations('home');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  // Mobile view: 'list' or 'map' (read from URL, default: 'list')
  const mobileView = (searchParams.get('view') as 'list' | 'map') || 'list';
  const [sortOption, setSortOption] = useState<SortOption>('recommended');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState | null>(null);
  const [activeQuickFilters, setActiveQuickFilters] = useState<string[]>([]);
  const [roomType, setRoomType] = useState<RoomTypeOption>('all');
  // Track selected rooms from map marker click (PC only) - now supports groups
  const [selectedGroupRoomIds, setSelectedGroupRoomIds] = useState<string[]>([]);

  // Scroll restoration - refs and storage key
  const desktopListRef = useRef<HTMLDivElement>(null);
  const SCROLL_STORAGE_KEY = 'search-scroll-position';
  const scrollRestoredRef = useRef(false);

  const hasActiveFilters =
    activeQuickFilters.length > 0 ||
    roomType !== 'all' ||
    (activeFilters !== null &&
      (activeFilters.roomTypes.length > 0 ||
        activeFilters.propertyTypes.length > 0 ||
        activeFilters.apartmentSize !== null ||
        activeFilters.houseRules.length > 0 ||
        activeFilters.facilities.length > 0 ||
        activeFilters.amenities.length > 0));

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
    const adultsParam = searchParams.get('adults');
    const childrenParam = searchParams.get('children');
    const infantsParam = searchParams.get('infants');

    // 개별 파라미터가 있으면 사용, 없으면 기존 guests 파라미터로 fallback (하위 호환성)
    if (adultsParam !== null || childrenParam !== null || infantsParam !== null) {
      return {
        adults: adultsParam ? parseInt(adultsParam, 10) : 0,
        children: childrenParam ? parseInt(childrenParam, 10) : 0,
        infants: infantsParam ? parseInt(infantsParam, 10) : 0,
      };
    }

    // 하위 호환성: 기존 guests 파라미터만 있는 경우
    const guestsParam = searchParams.get('guests');
    const guestCount = guestsParam ? parseInt(guestsParam, 10) : 0;
    return { adults: guestCount, children: 0, infants: 0 };
  });

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

  // 디바운싱된 검색 파라미터 (300ms 지연으로 불필요한 API 호출 방지)
  const debouncedLocation = useDebouncedValue(locationValue, 300);
  const debouncedGuests = useDebouncedValue(guests, 300);
  const debouncedSortOption = useDebouncedValue(sortOption, 300);
  const debouncedRoomType = useDebouncedValue(roomType, 300);
  const debouncedActiveFilters = useDebouncedValue(activeFilters, 300);
  const debouncedQuickFilters = useDebouncedValue(activeQuickFilters, 300);

  // Quick filter toggle handler
  const handleQuickFilterToggle = useCallback((filterId: string) => {
    setActiveQuickFilters((prev) =>
      prev.includes(filterId) ? prev.filter((f) => f !== filterId) : [...prev, filterId],
    );
  }, []);

  // Build search params for React Query (memoized for cache key stability)
  const apiSearchParams = useMemo((): AccommodationSearchParams => {
    const totalGuests = debouncedGuests.adults + debouncedGuests.children;
    const params: AccommodationSearchParams = {
      location: debouncedLocation || undefined,
      guests: totalGuests > 0 ? totalGuests : undefined,
      sortBy: mapSortOption(debouncedSortOption),
    };

    // Room Type Dropdown 필터
    if (debouncedRoomType !== 'all') {
      const accommodationType = roomTypeOptionToAccommodationType[debouncedRoomType];
      if (accommodationType) {
        params.accommodationType = [accommodationType];
      }
    }

    // 필터 적용
    if (debouncedActiveFilters) {
      // 숙소 타입 필터 (modal filter) - dropdown과 병합
      if (debouncedActiveFilters.roomTypes.length > 0) {
        const modalTypes = debouncedActiveFilters.roomTypes
          .map((type) => roomTypeToAccommodationType[type])
          .filter(Boolean) as AccommodationType[];
        const existingTypes = params.accommodationType || [];
        params.accommodationType = [...new Set([...existingTypes, ...modalTypes])];
      }

      // 건물 타입 필터
      if (debouncedActiveFilters.propertyTypes.length > 0) {
        params.buildingType = debouncedActiveFilters.propertyTypes
          .map((type) => propertyTypeToBuildingType[type])
          .filter(Boolean) as BuildingType[];
      }

      // 가격 필터
      if (debouncedActiveFilters.budgetMin > 0) {
        params.minPrice = debouncedActiveFilters.budgetMin;
      }
      if (debouncedActiveFilters.budgetMax < 10000) {
        params.maxPrice = debouncedActiveFilters.budgetMax;
      }

      // 성별/반려동물 규칙 필터
      if (debouncedActiveFilters.houseRules.length > 0) {
        params.genderRules = debouncedActiveFilters.houseRules
          .map((rule) => houseRuleToGenderRule[rule])
          .filter(Boolean) as GenderRule[];
      }

      // 최소 면적 필터 (apartmentSize는 "≥58㎡" 형태의 문자열)
      if (debouncedActiveFilters.apartmentSize !== null) {
        // "≥58㎡" 에서 숫자만 추출
        const areaMatch = debouncedActiveFilters.apartmentSize.match(/(\d+)/);
        if (areaMatch && areaMatch[1]) {
          params.minArea = parseInt(areaMatch[1], 10);
        }
      }

      // 시설 필터 ('all' 옵션 제외)
      const filteredFacilities = debouncedActiveFilters.facilities.filter((f) => f !== 'all');
      if (filteredFacilities.length > 0) {
        params.facilities = filteredFacilities;
      }

      // 편의시설 필터 ('all' 옵션 제외)
      const filteredAmenities = debouncedActiveFilters.amenities.filter((a) => a !== 'all');
      if (filteredAmenities.length > 0) {
        params.amenities = filteredAmenities;
      }
    }

    // Quick filters (FilterBar chips) - merge with activeFilters
    if (debouncedQuickFilters.length > 0) {
      const quickFilterRules = debouncedQuickFilters
        .map((filterId) => quickFilterToHouseRule[filterId])
        .filter((rule): rule is string => !!rule && rule !== 'parking')
        .map((rule) => houseRuleToGenderRule[rule])
        .filter((genderRule): genderRule is GenderRule => !!genderRule);

      if (quickFilterRules.length > 0) {
        const existingRules = params.genderRules || [];
        const mergedRules = [...new Set([...existingRules, ...quickFilterRules])];
        params.genderRules = mergedRules;
      }
    }

    return params;
  }, [
    debouncedLocation,
    debouncedGuests,
    debouncedSortOption,
    debouncedRoomType,
    debouncedActiveFilters,
    debouncedQuickFilters,
    mapSortOption,
  ]);

  // Fetch accommodations with React Query caching
  const { data: accommodationsData, isLoading } = usePublicAccommodations(apiSearchParams);

  // Track search events
  useEffect(() => {
    const totalGuests = debouncedGuests.adults + debouncedGuests.children;
    if (debouncedLocation || totalGuests > 0) {
      logSearch({
        location: debouncedLocation || undefined,
        checkIn: checkIn?.toISOString().split('T')[0],
        checkOut: checkOut?.toISOString().split('T')[0],
        guests: totalGuests,
      });
    }
  }, [debouncedLocation, debouncedGuests, checkIn, checkOut]);

  // Map API response to Room[] format
  const rooms = useMemo((): Room[] => {
    if (!accommodationsData?.data) return [];
    const nights = calculateNights();
    return accommodationsData.data.map((item: AccommodationListItem) =>
      mapAccommodationToRoom(item, nights, locale),
    );
  }, [accommodationsData, calculateNights, locale]);

  const totalCount = accommodationsData?.total ?? 0;

  // Track current scroll position in ref (to avoid state updates on every scroll)
  const scrollPositionRef = useRef({ desktop: 0, mobile: 0 });

  // Update scroll position ref on scroll
  useEffect(() => {
    const updateScrollRef = () => {
      scrollPositionRef.current = {
        desktop: desktopListRef.current?.scrollTop ?? 0,
        mobile: window.scrollY,
      };
    };

    const desktopEl = desktopListRef.current;
    desktopEl?.addEventListener('scroll', updateScrollRef, { passive: true });
    window.addEventListener('scroll', updateScrollRef, { passive: true });

    return () => {
      desktopEl?.removeEventListener('scroll', updateScrollRef);
      window.removeEventListener('scroll', updateScrollRef);
    };
  }, []);

  // Save scroll position only when page is being hidden (navigation away)
  useEffect(() => {
    const saveScroll = () => {
      // Only save if we have meaningful scroll position
      if (scrollPositionRef.current.desktop > 0 || scrollPositionRef.current.mobile > 0) {
        sessionStorage.setItem(SCROLL_STORAGE_KEY, JSON.stringify(scrollPositionRef.current));
      }
    };

    // Save on visibility change (when navigating away)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveScroll();
      } else if (document.visibilityState === 'visible') {
        // Reset scroll restored flag when page becomes visible again
        // This allows scroll to be restored on back navigation
        scrollRestoredRef.current = false;
      }
    };

    // Save before unload (for hard navigations)
    const handleBeforeUnload = () => {
      saveScroll();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Restore scroll position when data loads
  useEffect(() => {
    if (isLoading || scrollRestoredRef.current || rooms.length === 0) return;

    const saved = sessionStorage.getItem(SCROLL_STORAGE_KEY);
    if (saved) {
      try {
        const { desktop, mobile } = JSON.parse(saved);
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          if (desktopListRef.current && desktop > 0) {
            desktopListRef.current.scrollTop = desktop;
          }
          if (mobile > 0) {
            window.scrollTo(0, mobile);
          }
        });
      } catch {
        // Ignore parse errors
      }
    }
    scrollRestoredRef.current = true;
  }, [isLoading, rooms.length]);

  const displayLocation = locationValue || t('anywhere');
  const searchLocation = locationValue
    ? locationValue.split(',')[0]?.trim() || t('anywhere')
    : t('anywhere');

  // Handle search from Header's search bar
  const handleHeaderSearch = (values: SearchBarValues) => {
    const newSearchParams = new URLSearchParams();
    if (values.location) newSearchParams.set('location', values.location);
    if (values.checkIn)
      newSearchParams.set('checkIn', values.checkIn.toISOString().substring(0, 10));
    if (values.checkOut)
      newSearchParams.set('checkOut', values.checkOut.toISOString().substring(0, 10));
    const newTotalGuests = values.guests.adults + values.guests.children;
    if (newTotalGuests > 0) {
      newSearchParams.set('guests', newTotalGuests.toString());
      newSearchParams.set('adults', values.guests.adults.toString());
      newSearchParams.set('children', values.guests.children.toString());
      newSearchParams.set('infants', values.guests.infants.toString());
    }

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
    if (newTotalGuests > 0) {
      newSearchParams.set('guests', newTotalGuests.toString());
      newSearchParams.set('adults', params.guests.adults.toString());
      newSearchParams.set('children', params.guests.children.toString());
      newSearchParams.set('infants', params.guests.infants.toString());
    }

    // Update local state
    setLocationValue(params.location);
    setCheckIn(params.checkIn);
    setCheckOut(params.checkOut);
    setGuests(params.guests);

    // Update URL
    router.push(`/search?${newSearchParams.toString()}`);
    setIsSearchModalOpen(false);
  };

  // Toggle mobile view between list and map
  const toggleMobileView = useCallback(() => {
    const newView = mobileView === 'list' ? 'map' : 'list';
    const params = new URLSearchParams(searchParams.toString());
    if (newView === 'list') {
      params.delete('view');
    } else {
      params.set('view', newView);
    }
    router.push(`/search?${params.toString()}`);
  }, [mobileView, searchParams, router]);

  const _totalGuests = guests.adults + guests.children;

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
          guests={guests}
          hasActiveFilters={hasActiveFilters}
          onSearchClick={() => setIsSearchModalOpen(true)}
          onFilterClick={() => setIsFilterModalOpen(true)}
        />
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex">
        {/* Left Side - Room List */}
        <div
          id="search-desktop-list"
          ref={desktopListRef}
          className="w-[480px] flex-shrink-0 h-[calc(100vh-80px)] overflow-y-auto no-scrollbar"
        >
          <div className="px-4">
            {/* Filter Bar - hide when rooms are selected from map */}
            {selectedGroupRoomIds.length === 0 && (
              <FilterBar
                currentView={view}
                onViewChange={setView}
                onFilterClick={() => setIsFilterModalOpen(true)}
                hasActiveFilters={hasActiveFilters}
                activeQuickFilters={activeQuickFilters}
                onQuickFilterToggle={handleQuickFilterToggle}
                roomType={roomType}
                onRoomTypeChange={setRoomType}
              />
            )}

            {/* Results Header */}
            <div className="flex items-center justify-between py-3">
              {selectedGroupRoomIds.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setSelectedGroupRoomIds([])}
                  className="text-sm text-[hsl(var(--snug-orange))] hover:underline"
                >
                  ← {t('resultsCount', { count: totalCount, location: searchLocation })}
                </button>
              ) : isLoading ? (
                <div className="h-4 w-32 bg-[hsl(var(--snug-light-gray))] rounded animate-pulse" />
              ) : (
                <p className="text-sm text-[hsl(var(--snug-gray))]">
                  {t('resultsCount', { count: totalCount, location: searchLocation })}
                </p>
              )}
              {selectedGroupRoomIds.length === 0 && (
                <SortDropdown value={sortOption} onChange={setSortOption} />
              )}
            </div>

            {/* Room List / Grid */}
            <div
              className={
                view === 'grid' && selectedGroupRoomIds.length === 0
                  ? 'grid grid-cols-2 gap-4 pb-6'
                  : 'space-y-0 pb-6'
              }
            >
              {isLoading ? (
                <RoomCardSkeletonList count={6} viewMode={view} />
              ) : rooms.length === 0 ? (
                <div className="col-span-2 py-12 text-center text-[hsl(var(--snug-gray))]">
                  {t('noResults')}
                </div>
              ) : selectedGroupRoomIds.length > 0 ? (
                // Show selected group rooms
                rooms
                  .filter((room) => selectedGroupRoomIds.includes(room.id))
                  .map((room, index) => (
                    <RoomCard key={room.id} room={room} viewMode="list" index={index} />
                  ))
              ) : (
                // Show all rooms
                rooms.map((room, index) => (
                  <RoomCard key={room.id} room={room} viewMode={view} index={index} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Map */}
        <div className="flex-1 sticky top-20 h-[calc(100vh-80px)] p-4">
          <div className="w-full h-full rounded-2xl overflow-hidden">
            <SearchMap rooms={rooms} onGroupSelect={setSelectedGroupRoomIds} />
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        {mobileView === 'list' ? (
          <>
            {/* Results Header */}
            <div className="flex items-center justify-between px-4 py-2.5">
              {isLoading ? (
                <div className="h-4 w-28 bg-[hsl(var(--snug-light-gray))] rounded animate-pulse" />
              ) : (
                <p className="text-[13px] text-[hsl(var(--snug-gray))]">
                  {t('resultsCount', { count: totalCount, location: searchLocation })}
                </p>
              )}
              <SortDropdown value={sortOption} onChange={setSortOption} />
            </div>

            {/* Room List - Mobile uses larger cards */}
            <div className="px-4 space-y-6 pb-28">
              {isLoading ? (
                <RoomCardSkeletonList count={4} viewMode="mobile" />
              ) : rooms.length === 0 ? (
                <div className="py-12 text-center text-[hsl(var(--snug-gray))]">
                  {t('noResults')}
                </div>
              ) : (
                rooms.map((room, index) => (
                  <RoomCard key={room.id} room={room} viewMode="mobile" index={index} />
                ))
              )}
            </div>
          </>
        ) : (
          /* Map View - Full screen map */
          <div className="h-[calc(100vh-120px)]">
            <SearchMap rooms={rooms} />
          </div>
        )}

        {/* View Toggle Button - Floating (리스트 뷰에서만 표시) */}
        {mobileView === 'list' && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40">
            <button
              type="button"
              onClick={toggleMobileView}
              className="flex items-center gap-2 px-5 py-2.5 bg-[hsl(var(--snug-orange))] text-white rounded-full shadow-lg hover:opacity-90 transition-opacity"
            >
              <MapIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{tHome('viewOnMap')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Filter Modal - Shared by PC & Mobile */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        initialFilters={activeFilters || undefined}
        onApply={(filters) => {
          setActiveFilters(filters);
          // Sync quick filters with modal's houseRules (key 값 사용)
          const newQuickFilters: string[] = [];
          if (filters.houseRules.includes('womenOnly')) {
            newQuickFilters.push('womenOnly');
          }
          if (filters.houseRules.includes('menOnly')) {
            newQuickFilters.push('menOnly');
          }
          setActiveQuickFilters(newQuickFilters);
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
