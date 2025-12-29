'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { motion, type PanInfo } from 'framer-motion';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, ImageIcon, ChevronDown, X, Loader2 } from 'lucide-react';
import {
  LocationIcon,
  UserIcon,
  HeartIcon,
  ChatIcon,
  HotelIcon,
  AreaIcon,
  ElevatorIcon,
  ParkingIcon,
  RoomIcon,
  LivingRoomIcon,
  BathroomIcon,
  KitchenIcon,
  FloorIcon,
  BalconyIcon,
  PlusIcon,
  MinusIcon,
  SnugMarkerIcon,
} from '@/shared/ui/icons';
import { useRouter as useI18nRouter } from '@/i18n/navigation';
import { Header, type SearchBarValues } from '@/widgets/header';
import { GoogleMap, useJsApiLoader, OverlayView } from '@react-google-maps/api';
import { type GuestCount } from '@/features/search/ui/guest-picker';
import { BookingSidePanel } from './booking-side-panel';
import { useCurrencySafe } from '@/shared/providers';
import { useAuthStore } from '@/shared/stores';
import { getAccommodationPublic, getSimilarAccommodations } from '@/shared/api/accommodation';
import { recordView } from '@/shared/api/favorites';
import {
  getFacilityI18nKey,
  getAmenityI18nKey,
  getAccommodationTypeLabel,
  getBuildingTypeLabel,
} from '@/shared/lib';
import type { AccommodationPublic, AccommodationListItem } from '@snug/types';

// Mock room data
const roomData = {
  id: '1',
  title: 'Comfort & Convenience in Gangnam - Snug Stay',
  location: 'Cheongdam-dong',
  district: 'Gangnam-gu',
  address: '123, Cheongdam-ro, Gangnam-gu, Seoul-si',
  lat: 37.4979,
  lng: 127.0276,
  rooms: 1,
  bathrooms: 1,
  beds: 2,
  guests: 2,
  size: '30㎡',
  floor: '2nd Floor',
  originalPrice: null,
  price: 40,
  pricePerNight: 40,
  cleaningFee: 20,
  deposit: 100,
  longStayDiscount: 10,
  longStayThreshold: 12,
  serviceFeePercent: 10,
  nights: 8,
  tags: [
    { label: 'Shared Room', color: 'orange' as const },
    { label: 'Apartment', color: 'purple' as const },
  ],
  description:
    "Enjoy a peaceful stay in a cozy, sunlit room made for your comfort. Soft bedding and warm, thoughtful decor help you relax and recharge. Located in Seoul's Gangnam district, the stay offers easy transit access and nearby amenities. Perfect for solo travelers or couples looking for a quiet, comfortable retreat.",
  guidelines: [
    { labelKey: 'checkIn', valueKey: 'selfCheckIn' },
    { labelKey: 'checkOut', valueKey: 'checkOutTime' },
    { labelKey: 'cooking', valueKey: 'cookingAllowed' },
    { labelKey: 'laundry', valueKey: 'laundryAllowed' },
  ],
  details: [
    { icon: 'area', labelKey: 'area', value: '30㎡' },
    { icon: 'elevator', labelKey: 'elevator', valueKey: 'available' },
    { icon: 'parking', labelKey: 'parking', valueKey: 'available' },
    { icon: 'room', labelKey: 'room', value: '1' },
    { icon: 'living', labelKey: 'livingRoom', value: '1' },
    { icon: 'bathroom', labelKey: 'bathroom', value: '1' },
    { icon: 'kitchen', labelKey: 'kitchen', value: '1' },
    { icon: 'floor', labelKey: 'floor', value: '2' },
    { icon: 'balcony', labelKey: 'balcony', value: '1' },
  ],
  facilities: [
    'Digital door lock',
    'Refrigerator',
    'Conditioner',
    'Coffee maker',
    'Washer',
    'Hangers',
  ],
  houseAmenities: ['Hair dryer', 'Shampoo', 'Conditioner', 'Body soap', 'Hot water'],
  houseRules: [
    { icon: 'pet', text: 'No pets allowed', allowed: false },
    { icon: 'party', text: 'No parties or events', allowed: false },
    { icon: 'baby', text: 'Not suitable for infants', allowed: false },
    { icon: 'music', text: 'Quiet hours: 10PM - 8AM', allowed: true },
  ],
  information: {
    titleKey: 'title',
    subtitleKey: 'subtitle',
    contentKey: 'content',
  },
  refundPolicy: ['moreThan15Days', 'days14to8', 'days7to1', 'checkInDay'],
  notes: ['sameDayCancellation', 'refundableFees', 'hostTerms'],
  longTermDiscount: ['weeks2', 'weeks4', 'weeks12'],
  host: {
    name: 'Kim',
    responseRate: 98,
    responseTime: 'within an hour',
  },
  roomType: 'Shared Room',
  roomTypeDescription: 'A shared house for living together and connecting with others.',
  buildingType: 'Apartment',
  nearbyTags: ['Subway Station', 'Bus Stop', 'Convenience store'],
  total: 430,
};

const detailIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  area: AreaIcon,
  elevator: ElevatorIcon,
  parking: ParkingIcon,
  room: RoomIcon,
  living: LivingRoomIcon,
  bathroom: BathroomIcon,
  kitchen: KitchenIcon,
  floor: FloorIcon,
  balcony: BalconyIcon,
};

// Badge styles matching room-card.tsx
const tagFirstColors = {
  orange: 'bg-[#FFF5E6] text-[hsl(var(--snug-orange))] font-bold',
  purple: 'bg-[#F9A8D4] text-white font-bold',
  blue: 'bg-blue-100 text-blue-500 font-bold',
  green: 'bg-green-100 text-green-500 font-bold',
};

const tagSecondColors = {
  orange: 'bg-[#FFF5E6] text-[hsl(var(--snug-orange))] font-bold',
  purple: 'bg-[#F9A8D4] text-white font-bold',
  blue: 'bg-blue-400 text-white font-bold',
  green: 'bg-green-400 text-white font-bold',
};

// Calculate nights between two dates
function calculateNights(checkIn: Date | null, checkOut: Date | null): number {
  if (!checkIn || !checkOut) return 0;
  const diffTime = checkOut.getTime() - checkIn.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function RoomDetailPage() {
  const locale = useLocale();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const i18nRouter = useI18nRouter();
  const { format } = useCurrencySafe();
  const t = useTranslations();
  const roomId = (params.id as string) || '1';
  const user = useAuthStore((state) => state.user);

  // Parse dates from URL search params
  const parseDate = (dateStr: string | null): Date | null => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  };

  const initialCheckIn = parseDate(searchParams.get('checkIn'));
  const initialCheckOut = parseDate(searchParams.get('checkOut'));
  // 개별 게스트 수 파라미터 읽기 (하위 호환성 유지)
  const initialGuests = (() => {
    const adultsParam = searchParams.get('adults');
    const childrenParam = searchParams.get('children');
    const infantsParam = searchParams.get('infants');

    if (adultsParam !== null || childrenParam !== null || infantsParam !== null) {
      return {
        adults: adultsParam ? parseInt(adultsParam, 10) : 1,
        children: childrenParam ? parseInt(childrenParam, 10) : 0,
        infants: infantsParam ? parseInt(infantsParam, 10) : 0,
      };
    }

    // 하위 호환성: 기존 guests 파라미터만 있는 경우
    const guestsParam = searchParams.get('guests');
    const guestCount = guestsParam ? parseInt(guestsParam, 10) : 1;
    return { adults: guestCount, children: 0, infants: 0 };
  })();

  // API data state
  const [accommodation, setAccommodation] = useState<AccommodationPublic | null>(null);
  const [similarRooms, setSimilarRooms] = useState<AccommodationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [checkIn] = useState<Date | null>(initialCheckIn);
  const [checkOut] = useState<Date | null>(initialCheckOut);
  const [guests] = useState<GuestCount>(initialGuests);
  const [, setIsDateOpen] = useState(false);
  const [, setIsGuestOpen] = useState(false);
  const [isFacilitiesModalOpen, setIsFacilitiesModalOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    description: true,
    guidelines: true,
    details: true,
    facilities: true,
    amenities: true,
    houseRules: true,
    refundPolicy: false,
    longTermDiscount: false,
  });

  // Fetch accommodation data
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const [data, similar] = await Promise.all([
          getAccommodationPublic(roomId),
          getSimilarAccommodations(roomId, 6),
        ]);
        if (!data) {
          setError('Accommodation not found');
        } else {
          setAccommodation(data);
          setSimilarRooms(similar);
        }
      } catch (err) {
        console.error('Failed to fetch accommodation:', err);
        setError('Failed to load accommodation');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [roomId]);

  // Record recently viewed (only for logged-in users)
  useEffect(() => {
    if (user && roomId && accommodation) {
      recordView(roomId);
    }
  }, [user, roomId, accommodation]);

  const datePickerRef = useRef<HTMLDivElement>(null);
  const guestPickerRef = useRef<HTMLDivElement>(null);

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDateOpen(false);
      }
      if (guestPickerRef.current && !guestPickerRef.current.contains(event.target as Node)) {
        setIsGuestOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  // Always try to load Google Maps (will show error overlay if no key)
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: googleMapsApiKey,
    id: 'google-map-script',
  });

  // Show map when loaded (even if there's an API key error, Google Maps will show)
  const shouldShowMap = isLoaded;

  // Mobile carousel state
  const [isSwiping, setIsSwiping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Measure container width for carousel calculations
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Calculate derived values from accommodation data
  const pricePerNight = accommodation?.basePrice ?? roomData.pricePerNight;
  const cleaningFee = accommodation?.cleaningFee ?? roomData.cleaningFee;
  const nights = calculateNights(checkIn, checkOut) || roomData.nights;
  const subtotal = pricePerNight * nights;
  const serviceFeePercent = roomData.serviceFeePercent; // Keep from mock for now
  const serviceFee = Math.round(subtotal * (serviceFeePercent / 100));
  const longStayThreshold = roomData.longStayThreshold;
  const longStayDiscount = roomData.longStayDiscount;
  const discount = nights >= longStayThreshold ? longStayDiscount : 0;
  const deposit = roomData.deposit;
  const total = subtotal + cleaningFee + deposit - discount - serviceFee;

  // Get display values from accommodation or fallback to mock
  const displayLocation = accommodation?.sigunguEn ?? roomData.location;
  const displayDistrict = accommodation?.sidoEn ?? roomData.district;
  const displayRoomType = accommodation
    ? getAccommodationTypeLabel(accommodation.accommodationType, locale)
    : roomData.roomType;
  const displayBuildingType = accommodation?.buildingType
    ? getBuildingTypeLabel(accommodation.buildingType, locale)
    : roomData.buildingType;
  const displayRoomCount = accommodation?.roomCount ?? roomData.rooms;
  const displayBathroomCount = accommodation?.bathroomCount ?? roomData.bathrooms;
  const displayCapacity = accommodation?.capacity ?? roomData.guests;
  const displayIntroduction = accommodation?.introduction ?? roomData.description;
  const displayHouseRules = accommodation?.houseRules ?? null;
  const displayLat = accommodation?.latitude ?? roomData.lat;
  const displayLng = accommodation?.longitude ?? roomData.lng;
  const photos = accommodation?.photos ?? [];
  const totalImages = photos.length;

  // Image navigation handlers
  const handlePrevImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : totalImages - 1));
  }, [totalImages]);

  const handleNextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev < totalImages - 1 ? prev + 1 : 0));
  }, [totalImages]);

  // Carousel drag handlers
  const handleDragStart = useCallback(() => {
    setIsSwiping(true);
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setIsDragging(false);

      const threshold = containerWidth / 4; // 25% of width to trigger slide
      const velocity = info.velocity.x;
      const offset = info.offset.x;

      let newIndex = currentImageIndex;

      // Determine new index based on drag distance or velocity
      if (offset < -threshold || velocity < -500) {
        // Swiped left -> next image
        newIndex = Math.min(currentImageIndex + 1, totalImages - 1);
      } else if (offset > threshold || velocity > 500) {
        // Swiped right -> previous image
        newIndex = Math.max(currentImageIndex - 1, 0);
      }

      // Update index
      setCurrentImageIndex(newIndex);

      // Reset swiping state after animation
      setTimeout(() => setIsSwiping(false), 100);
    },
    [containerWidth, currentImageIndex, totalImages],
  );

  const handleOpenGallery = useCallback(() => {
    if (!isSwiping) {
      router.push(`/${locale}/room/${roomId}/gallery`);
    }
  }, [isSwiping, router, locale, roomId]);

  // Handle search from header - navigate to search page
  const handleHeaderSearch = (values: SearchBarValues) => {
    const searchParams = new URLSearchParams();
    if (values.location) searchParams.set('location', values.location);
    if (values.checkIn) searchParams.set('checkIn', values.checkIn.toISOString().substring(0, 10));
    if (values.checkOut)
      searchParams.set('checkOut', values.checkOut.toISOString().substring(0, 10));
    const totalGuests = values.guests.adults + values.guests.children;
    if (totalGuests > 0) {
      searchParams.set('guests', totalGuests.toString());
      searchParams.set('adults', values.guests.adults.toString());
      searchParams.set('children', values.guests.children.toString());
      searchParams.set('infants', values.guests.infants.toString());
    }
    i18nRouter.push(`/search?${searchParams.toString()}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header variant="with-search" onSearch={handleHeaderSearch} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--snug-orange))]" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !accommodation) {
    return (
      <div className="min-h-screen bg-white">
        <Header variant="with-search" onSearch={handleHeaderSearch} />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-lg text-[hsl(var(--snug-gray))]">
            {error || t('roomDetail.notFound')}
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-[hsl(var(--snug-orange))] text-white rounded-full hover:opacity-90"
          >
            {t('common.back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Desktop Header - Hidden on Mobile */}
      <Header variant="with-search" onSearch={handleHeaderSearch} />

      {/* Mobile Image Gallery - Sliding Carousel */}
      <div className="lg:hidden relative overflow-hidden" ref={containerRef}>
        <div className="relative aspect-[4/3]">
          {/* Sliding Images Container */}
          {photos.length > 0 && containerWidth > 0 ? (
            <motion.div
              className="flex h-full cursor-grab active:cursor-grabbing"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              animate={
                isDragging
                  ? undefined
                  : {
                      x: -currentImageIndex * containerWidth,
                    }
              }
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                width: containerWidth * photos.length,
              }}
            >
              {photos.map((photo, index) => (
                <div
                  key={photo.id || index}
                  className="relative flex-shrink-0 h-full"
                  style={{ width: containerWidth }}
                  onClick={() => !isSwiping && handleOpenGallery()}
                >
                  <Image
                    src={photo.url}
                    alt={`${accommodation.roomName} - ${index + 1}`}
                    fill
                    sizes="100vw"
                    className="object-cover pointer-events-none"
                    priority={index <= currentImageIndex + 1}
                  />
                </div>
              ))}
            </motion.div>
          ) : photos.length > 0 && containerWidth === 0 ? (
            // Fallback while measuring container width
            <div className="absolute inset-0">
              <Image
                src={photos[0]!.url}
                alt={`${accommodation.roomName} - 1`}
                fill
                sizes="100vw"
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--snug-light-gray))] to-[hsl(var(--snug-border))] flex items-center justify-center">
              <ImageIcon className="w-16 h-16 text-[hsl(var(--snug-gray))]/30" />
            </div>
          )}

          {/* Mobile Overlay Buttons */}
          <div className="absolute top-4 left-4 z-10">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                router.back();
              }}
              className="p-2 bg-white/90 rounded-full shadow-md"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
          <div className="absolute top-4 right-4 z-10">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsFavorite(!isFavorite);
              }}
              className="p-2 bg-white/90 rounded-full shadow-md"
            >
              <HeartIcon
                className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`}
                filled={isFavorite}
              />
            </button>
          </div>

          {/* Mobile Tags */}
          <div className="absolute bottom-4 left-4 flex gap-2 z-10">
            <span
              className={`px-3 py-1.5 text-xs font-semibold rounded-full ${tagFirstColors.orange}`}
            >
              {displayRoomType}
            </span>
            {displayBuildingType && (
              <span
                className={`px-3 py-1.5 text-xs font-semibold rounded-full ${tagSecondColors.purple}`}
              >
                {displayBuildingType}
              </span>
            )}
          </div>

          {/* Mobile Image Counter + More */}
          {totalImages > 0 && (
            <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/60 rounded-full text-white text-xs z-10">
              <span>
                {currentImageIndex + 1}/{totalImages} · {t('common.seeMore')}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-6 pb-32 lg:pb-6">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Desktop Image Gallery */}
            <div
              className="hidden lg:block relative aspect-[16/10] rounded-2xl overflow-hidden mb-6 cursor-pointer group"
              onClick={handleOpenGallery}
            >
              {/* Photo or Placeholder */}
              {photos.length > 0 && photos[currentImageIndex] ? (
                <>
                  <Image
                    src={photos[currentImageIndex].url}
                    alt={`${accommodation.roomName} - ${currentImageIndex + 1}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 896px"
                    className="object-cover group-hover:brightness-95 transition-all"
                    priority
                  />
                  {/* Preload adjacent images for faster navigation */}
                  {photos.length > 1 && photos[(currentImageIndex + 1) % photos.length]?.url && (
                    <Image
                      src={photos[(currentImageIndex + 1) % photos.length]!.url}
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 100vw, 896px"
                      className="opacity-0 pointer-events-none"
                      priority
                    />
                  )}
                  {photos.length > 1 &&
                    currentImageIndex > 0 &&
                    photos[currentImageIndex - 1]?.url && (
                      <Image
                        src={photos[currentImageIndex - 1]!.url}
                        alt=""
                        fill
                        sizes="(max-width: 1024px) 100vw, 896px"
                        className="opacity-0 pointer-events-none"
                        priority
                      />
                    )}
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--snug-light-gray))] to-[hsl(var(--snug-border))] flex items-center justify-center group-hover:brightness-95 transition-all">
                  <ImageIcon className="w-16 h-16 text-[hsl(var(--snug-gray))]/30" />
                </div>
              )}

              {/* Tags */}
              <div className="absolute top-4 left-4 flex gap-2 z-10">
                <span
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full ${tagFirstColors.orange}`}
                >
                  {displayRoomType}
                </span>
                {displayBuildingType && (
                  <span
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full ${tagSecondColors.purple}`}
                  >
                    {displayBuildingType}
                  </span>
                )}
              </div>

              {/* Navigation Arrows */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevImage();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors shadow-md z-10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors shadow-md z-10"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Image Counter */}
              {totalImages > 0 && (
                <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/60 rounded-full text-white text-sm z-10">
                  {currentImageIndex + 1} / {totalImages}
                </div>
              )}
            </div>

            {/* Title & Location */}
            {/* Mobile: Location as title */}
            <h1 className="lg:hidden text-lg font-bold text-[hsl(var(--snug-text-primary))] mb-2">
              {displayLocation}, {displayDistrict}
            </h1>
            {/* Desktop: Title with heart icon */}
            <div className="hidden lg:flex items-center justify-between mb-2">
              <h1 className="text-xl font-bold text-[hsl(var(--snug-text-primary))]">
                {displayLocation}, {displayDistrict}
              </h1>
              <button
                type="button"
                onClick={() => setIsFavorite(!isFavorite)}
                className="p-2 hover:bg-[hsl(var(--snug-light-gray))] rounded-full transition-colors"
              >
                <HeartIcon
                  className={`w-5 h-5 ${isFavorite ? 'text-red-500' : 'text-[hsl(var(--snug-gray))]'}`}
                  filled={isFavorite}
                />
              </button>
            </div>

            {/* Room Info */}
            <div className="lg:hidden space-y-1 pb-4">
              <div className="flex items-center gap-1.5 text-[13px] text-[hsl(var(--snug-gray))]">
                <HotelIcon className="w-3.5 h-3.5" />
                <span>
                  {t('rooms.roomCount', { count: displayRoomCount })} ·{' '}
                  {t('rooms.bathroomCount', { count: displayBathroomCount })}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[13px] text-[hsl(var(--snug-gray))]">
                <UserIcon className="w-3.5 h-3.5" />
                <span>{t('rooms.guestCount', { count: displayCapacity })}</span>
              </div>
            </div>
            {/* Desktop Room Info */}
            <div className="hidden lg:block pb-6">
              <div className="flex items-center gap-1.5 text-sm text-[hsl(var(--snug-gray))] mb-1">
                <HotelIcon className="w-4 h-4" />
                <span>
                  {t('rooms.roomCount', { count: displayRoomCount })} ·{' '}
                  {t('rooms.bathroomCount', { count: displayBathroomCount })}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-[hsl(var(--snug-gray))]">
                <UserIcon className="w-4 h-4" />
                <span>{t('rooms.guestCount', { count: displayCapacity })}</span>
              </div>
            </div>

            {/* Mobile: Shared Room Info Card */}
            <div className="lg:hidden py-6">
              <div className="flex flex-col items-center text-center p-5 border-2 border-[hsl(var(--snug-orange))] rounded-2xl">
                <p className="text-base font-semibold text-[hsl(var(--snug-text-primary))] mb-1">
                  {displayRoomType}
                </p>
                <p className="text-[13px] text-[hsl(var(--snug-gray))]">{accommodation.roomName}</p>
              </div>
            </div>

            {/* Stay Description */}
            <Section
              title={t('roomDetail.aboutThisPlace')}
              expanded={expandedSections.description ?? false}
              onToggle={() => toggleSection('description')}
            >
              <p className="text-sm font-semibold text-[hsl(var(--snug-text-primary))] mb-2">
                {accommodation.roomName}
              </p>
              <p className="text-sm text-[hsl(var(--snug-gray))] leading-relaxed">
                {displayIntroduction}
              </p>
            </Section>

            {/* Guidelines */}
            <Section
              title={t('roomDetail.guidelines')}
              expanded={expandedSections.guidelines ?? false}
              onToggle={() => toggleSection('guidelines')}
            >
              <div className="space-y-2">
                {roomData.guidelines.map((guideline) => (
                  <div key={guideline.labelKey} className="text-sm">
                    <span className="text-[hsl(var(--snug-text-primary))]">
                      {t(`roomDetail.guidelinesItems.${guideline.labelKey}`)}:{' '}
                    </span>
                    <span className="text-[hsl(var(--snug-gray))]">
                      {t(`roomDetail.guidelinesItems.${guideline.valueKey}`)}
                    </span>
                  </div>
                ))}
              </div>
            </Section>

            {/* Details */}
            <Section
              title={t('roomDetail.details')}
              expanded={expandedSections.details ?? false}
              onToggle={() => toggleSection('details')}
            >
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {roomData.details.map((detail) => {
                  const Icon = detailIcons[detail.icon] || RoomIcon;
                  const displayValue = detail.valueKey
                    ? t(`roomDetail.detailItems.${detail.valueKey}`)
                    : detail.value;
                  return (
                    <div
                      key={detail.labelKey}
                      className="flex items-center gap-2 text-sm text-[hsl(var(--snug-text-primary))]"
                    >
                      <Icon className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
                      <span>{t(`roomDetail.detailItems.${detail.labelKey}`)}</span>
                      <span className="text-[hsl(var(--snug-gray))]">· {displayValue}</span>
                    </div>
                  );
                })}
              </div>
            </Section>

            {/* Facilities */}
            {(accommodation.facilities?.length ?? 0) > 0 && (
              <Section
                title={t('roomDetail.facilities')}
                expanded={expandedSections.facilities ?? false}
                onToggle={() => toggleSection('facilities')}
              >
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                  {(accommodation.facilities ?? []).slice(0, 9).map((facilityCode) => (
                    <div
                      key={facilityCode}
                      className="flex items-center gap-2 text-sm text-[hsl(var(--snug-text-primary))]"
                    >
                      <span className="w-1.5 h-1.5 bg-[hsl(var(--snug-text-primary))] rounded-full" />
                      <span>{t(`facilities.${getFacilityI18nKey(facilityCode)}`)}</span>
                    </div>
                  ))}
                </div>
                {(accommodation.facilities?.length ?? 0) > 9 && (
                  <button
                    type="button"
                    onClick={() => setIsFacilitiesModalOpen(true)}
                    className="w-full py-3 border border-[hsl(var(--snug-border))] rounded-xl text-sm font-medium text-[hsl(var(--snug-text-primary))] hover:bg-[hsl(var(--snug-light-gray))] transition-colors"
                  >
                    {t('roomDetail.facilities')} {t('common.seeMore')}
                  </button>
                )}
              </Section>
            )}

            {/* House Amenities */}
            {(accommodation.amenities?.length ?? 0) > 0 && (
              <Section
                title={t('roomDetail.houseAmenities')}
                expanded={expandedSections.amenities ?? false}
                onToggle={() => toggleSection('amenities')}
              >
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {(accommodation.amenities ?? []).map((amenityCode) => (
                    <div
                      key={amenityCode}
                      className="flex items-center gap-2 text-sm text-[hsl(var(--snug-text-primary))]"
                    >
                      <span className="w-1.5 h-1.5 bg-[hsl(var(--snug-text-primary))] rounded-full" />
                      <span>{t(`amenities.${getAmenityI18nKey(amenityCode)}`)}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* House Rules */}
            <Section
              title={t('roomDetail.houseRules')}
              expanded={expandedSections.houseRules ?? false}
              onToggle={() => toggleSection('houseRules')}
            >
              {displayHouseRules ? (
                <p className="text-sm text-[hsl(var(--snug-gray))] leading-relaxed whitespace-pre-wrap">
                  {displayHouseRules}
                </p>
              ) : (
                <p className="text-sm text-[hsl(var(--snug-gray))]">
                  {t('roomDetail.noHouseRules')}
                </p>
              )}
            </Section>

            {/* Information */}
            <Section
              title={t('roomDetail.information')}
              expanded={true}
              onToggle={() => {}}
              showToggle={false}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <h4 className="text-sm font-semibold text-[hsl(var(--snug-text-primary))]">
                    {t(`roomDetail.informationSection.${roomData.information.titleKey}`)}
                  </h4>
                  <span className="text-sm text-[hsl(var(--snug-gray))]">
                    {t(`roomDetail.informationSection.${roomData.information.subtitleKey}`)}
                  </span>
                </div>
                <p className="text-sm text-[hsl(var(--snug-gray))] leading-relaxed">
                  {t(`roomDetail.informationSection.${roomData.information.contentKey}`)}
                </p>
              </div>
            </Section>

            {/* Location */}
            <Section
              title={t('roomDetail.location')}
              expanded={true}
              onToggle={() => {}}
              showToggle={false}
            >
              <p className="text-xs text-[hsl(var(--snug-text-primary))] mb-3">
                {displayLocation}, {displayDistrict}
                {accommodation.nearestStation && ` · ${accommodation.nearestStation}`}
                {accommodation.walkingMinutes && ` (${accommodation.walkingMinutes}min walk)`}
              </p>
              {/* Map Container */}
              <div className="relative h-[250px] lg:h-[350px] rounded-[20px] overflow-hidden bg-[hsl(var(--snug-light-gray))] border border-[hsl(var(--snug-border))]">
                {shouldShowMap && displayLat && displayLng ? (
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={{ lat: displayLat, lng: displayLng }}
                    zoom={15}
                    options={{
                      disableDefaultUI: true,
                      zoomControl: false,
                    }}
                  >
                    <OverlayView
                      position={{ lat: displayLat, lng: displayLng }}
                      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                    >
                      <div className="relative" style={{ transform: 'translate(-50%, -100%)' }}>
                        <SnugMarkerIcon className="w-[62px] h-[50px]" />
                      </div>
                    </OverlayView>
                  </GoogleMap>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-[#f5f5f5]">
                    <LocationIcon className="w-8 h-8 text-[hsl(var(--snug-gray))]/30" />
                    <span className="text-xs text-[hsl(var(--snug-gray))]">Map View</span>
                  </div>
                )}
                {/* Zoom Buttons */}
                <div className="absolute top-2.5 right-2.5 flex flex-col gap-2.5">
                  <button
                    type="button"
                    className="w-8 h-8 bg-white rounded-full shadow-[0px_2px_4px_rgba(0,0,0,0.25)] flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <PlusIcon className="w-3.5 h-3.5 text-[#161616]" />
                  </button>
                  <button
                    type="button"
                    className="w-8 h-8 bg-white rounded-full shadow-[0px_2px_4px_rgba(0,0,0,0.25)] flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <MinusIcon className="w-3.5 h-3.5 text-[#161616]" />
                  </button>
                </div>
              </div>
            </Section>

            {/* Other Stays */}
            <Section
              title={t('roomDetail.otherStays')}
              expanded={true}
              onToggle={() => {}}
              showToggle={false}
            >
              {similarRooms.length > 0 ? (
                <>
                  {/* Mobile: Horizontal Scroll */}
                  <div className="lg:hidden -mx-4 px-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <div className="flex gap-3" style={{ width: 'max-content' }}>
                      {similarRooms.map((room) => (
                        <div
                          key={room.id}
                          className="cursor-pointer group w-[140px] flex-shrink-0"
                          onClick={() => router.push(`/${locale}/room/${room.id}`)}
                        >
                          <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-2">
                            {room.thumbnailUrl ? (
                              <Image
                                src={room.thumbnailUrl}
                                alt={room.roomName}
                                fill
                                sizes="140px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--snug-light-gray))] to-[hsl(var(--snug-border))] flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-[hsl(var(--snug-gray))]/30" />
                              </div>
                            )}
                          </div>
                          <h4 className="text-xs font-medium text-[hsl(var(--snug-text-primary))] mb-0.5 truncate">
                            {room.roomName}
                          </h4>
                          <p className="text-[10px] text-[hsl(var(--snug-gray))] mb-1">
                            {room.sigunguEn || room.sidoEn}
                          </p>
                          <p className="text-xs font-bold text-[hsl(var(--snug-orange))]">
                            {format(room.basePrice)}{' '}
                            <span className="text-[10px] font-normal text-[hsl(var(--snug-gray))]">
                              {t('roomDetail.perNight')}
                            </span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Desktop: Grid */}
                  <div className="hidden lg:grid grid-cols-3 gap-4">
                    {similarRooms.slice(0, 3).map((room) => (
                      <div
                        key={room.id}
                        className="cursor-pointer group"
                        onClick={() => router.push(`/${locale}/room/${room.id}`)}
                      >
                        <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3">
                          {room.thumbnailUrl ? (
                            <Image
                              src={room.thumbnailUrl}
                              alt={room.roomName}
                              fill
                              sizes="(max-width: 1024px) 33vw, 280px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--snug-light-gray))] to-[hsl(var(--snug-border))] flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 text-[hsl(var(--snug-gray))]/30" />
                            </div>
                          )}
                          {/* Tags */}
                          <div className="absolute top-3 left-3 flex gap-1.5 z-10">
                            <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-white border border-[hsl(var(--snug-orange))] text-[hsl(var(--snug-orange))]">
                              {getAccommodationTypeLabel(room.accommodationType, locale)}
                            </span>
                            {room.buildingType && (
                              <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-purple-500 text-white">
                                {getBuildingTypeLabel(room.buildingType, locale)}
                              </span>
                            )}
                          </div>
                          {/* Heart */}
                          <button
                            className="absolute top-3 right-3 p-1.5 bg-white/90 rounded-full z-10"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <HeartIcon className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
                          </button>
                        </div>
                        <h4 className="text-sm font-semibold text-[hsl(var(--snug-text-primary))] mb-1">
                          {room.roomName}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-[hsl(var(--snug-gray))] mb-0.5">
                          <HotelIcon className="w-3 h-3" />
                          <span>
                            {t('rooms.roomCount', { count: room.roomCount })} ·{' '}
                            {t('rooms.bathroomCount', { count: room.bathroomCount })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-[hsl(var(--snug-gray))] mb-1">
                          <UserIcon className="w-3 h-3" />
                          <span>{t('rooms.guestCount', { count: room.capacity })}</span>
                        </div>
                        <p className="text-sm">
                          <span className="font-bold text-[hsl(var(--snug-orange))]">
                            {format(room.basePrice)}
                          </span>
                          <span className="text-xs text-[hsl(var(--snug-gray))]">
                            {' '}
                            {t('roomDetail.perNight')}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-[hsl(var(--snug-gray))]">
                  {t('roomDetail.noSimilarStays')}
                </p>
              )}
            </Section>

            {/* Refund Policy */}
            <Section
              title={t('roomDetail.refundPolicy')}
              expanded={expandedSections.refundPolicy ?? false}
              onToggle={() => toggleSection('refundPolicy')}
            >
              <ul className="space-y-2">
                {roomData.refundPolicy.map((policyKey) => (
                  <li
                    key={policyKey}
                    className="flex items-start gap-2 text-sm text-[hsl(var(--snug-gray))]"
                  >
                    <span className="w-1.5 h-1.5 mt-1.5 bg-[hsl(var(--snug-text-primary))] rounded-full flex-shrink-0" />
                    <span>{t(`roomDetail.refundPolicyItems.${policyKey}`)}</span>
                  </li>
                ))}
              </ul>
            </Section>

            {/* Long-Term Stay Discount */}
            <Section
              title={t('roomDetail.longTermDiscount')}
              expanded={expandedSections.longTermDiscount ?? false}
              onToggle={() => toggleSection('longTermDiscount')}
            >
              <ul className="space-y-2">
                {roomData.longTermDiscount.map((discountKey) => (
                  <li
                    key={discountKey}
                    className="flex items-start gap-2 text-sm text-[hsl(var(--snug-gray))]"
                  >
                    <span className="w-1.5 h-1.5 mt-1.5 bg-[hsl(var(--snug-gray))] rounded-full flex-shrink-0" />
                    <span>{t(`roomDetail.longTermDiscountItems.${discountKey}`)}</span>
                  </li>
                ))}
              </ul>
            </Section>

            {/* Notes */}
            <Section
              title={t('roomDetail.importantNotes')}
              expanded={true}
              onToggle={() => {}}
              showToggle={false}
            >
              <ul className="space-y-2">
                {roomData.notes.map((noteKey) => (
                  <li
                    key={noteKey}
                    className="flex items-start gap-2 text-sm text-[hsl(var(--snug-gray))]"
                  >
                    <span className="w-1.5 h-1.5 mt-1.5 bg-[hsl(var(--snug-gray))] rounded-full flex-shrink-0" />
                    <span className="leading-relaxed">{t(`roomDetail.notesItems.${noteKey}`)}</span>
                  </li>
                ))}
              </ul>
            </Section>
          </div>

          {/* Booking Sidebar - Desktop Only */}
          <div className="hidden lg:block w-[350px] flex-shrink-0">
            <div className="sticky top-24">
              <BookingSidePanel
                roomType={displayRoomType}
                roomTypeDescription={accommodation.roomName}
                priceBreakdown={{
                  pricePerNight: pricePerNight,
                  nights: nights,
                  cleaningFee: cleaningFee,
                  deposit: deposit,
                  longStayDiscount: longStayDiscount,
                  longStayThreshold: longStayThreshold,
                  serviceFeePercent: serviceFeePercent,
                }}
                initialCheckIn={checkIn}
                initialCheckOut={checkOut}
                initialGuests={guests}
                onBook={() => {
                  const totalGuests = guests.adults + guests.children;
                  const params = new URLSearchParams();
                  if (checkIn) params.set('checkIn', checkIn.toISOString());
                  if (checkOut) params.set('checkOut', checkOut.toISOString());
                  params.set('guests', String(totalGuests));
                  router.push(`/${locale}/room/${roomId}/payment?${params.toString()}`);
                }}
                onChatWithHost={() => {}}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[hsl(var(--snug-border))] px-5 py-4 z-50">
        {/* Top Row: Total */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-base font-bold text-[hsl(var(--snug-text-primary))]">
            {t('roomDetail.total')}
          </span>
          <span className="text-base font-bold text-[hsl(var(--snug-text-primary))]">
            {format(total)}
          </span>
        </div>
        {/* Bottom Row: Actions */}
        <div className="flex items-center gap-3">
          {/* Chat with Host */}
          <button
            type="button"
            className="flex items-center gap-2 text-sm font-bold text-[hsl(var(--snug-text-primary))] hover:opacity-70 transition-opacity"
          >
            <ChatIcon className="w-5 h-5" />
            <span>{t('roomDetail.contactHost')}</span>
          </button>
          {/* Book Button */}
          <button
            type="button"
            onClick={() => {
              const totalGuests = guests.adults + guests.children;
              const params = new URLSearchParams();
              if (checkIn) params.set('checkIn', checkIn.toISOString());
              if (checkOut) params.set('checkOut', checkOut.toISOString());
              params.set('guests', String(totalGuests));
              router.push(`/${locale}/room/${roomId}/payment?${params.toString()}`);
            }}
            className="flex-1 py-3.5 bg-[hsl(var(--snug-orange))] text-white text-sm font-semibold rounded-full hover:opacity-90 transition-opacity"
          >
            {t('roomDetail.reserveNow')}
          </button>
        </div>
      </div>

      {/* Facilities Modal */}
      <FacilitiesModal
        isOpen={isFacilitiesModalOpen}
        onClose={() => setIsFacilitiesModalOpen(false)}
        facilities={accommodation.facilities ?? []}
        t={t}
      />
    </div>
  );
}

// Section Component
interface SectionProps {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  showToggle?: boolean;
  children: React.ReactNode;
}

function Section({ title, expanded, onToggle, showToggle = true, children }: SectionProps) {
  return (
    <div className="py-6">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between mb-4"
        disabled={!showToggle}
      >
        <h3 className="text-lg font-semibold text-[hsl(var(--snug-text-primary))]">{title}</h3>
        {showToggle && (
          <ChevronDown
            className={`w-5 h-5 text-[hsl(var(--snug-gray))] transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        )}
      </button>
      {expanded && children}
    </div>
  );
}

// Facilities Modal Component
interface FacilitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  facilities: string[];
  t: (key: string) => string;
}

function FacilitiesModal({ isOpen, onClose, facilities, t }: FacilitiesModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile: Full Screen */}
      <div className="lg:hidden fixed inset-0 z-[100] bg-white flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--snug-border))]">
          <h2 className="text-lg font-bold text-[hsl(var(--snug-text-primary))]">
            {t('roomDetail.facilities')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-[hsl(var(--snug-light-gray))] rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-[hsl(var(--snug-text-primary))]" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 px-5 py-6 overflow-y-auto">
          <ul className="space-y-4">
            {facilities.map((facilityCode) => (
              <li
                key={facilityCode}
                className="flex items-center gap-3 text-sm text-[hsl(var(--snug-text-primary))]"
              >
                <span className="w-1.5 h-1.5 bg-[hsl(var(--snug-text-primary))] rounded-full flex-shrink-0" />
                <span>{t(`facilities.${getFacilityI18nKey(facilityCode)}`)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Desktop: Center Modal */}
      <div className="hidden lg:block fixed inset-0 z-[100]">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/30" onClick={onClose} />

        {/* Modal */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--snug-border))]">
            <h2 className="text-lg font-bold text-[hsl(var(--snug-text-primary))]">
              {t('roomDetail.facilities')}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1 hover:bg-[hsl(var(--snug-light-gray))] rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-[hsl(var(--snug-text-primary))]" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
            <ul className="space-y-4">
              {facilities.map((facilityCode) => (
                <li
                  key={facilityCode}
                  className="flex items-center gap-3 text-sm text-[hsl(var(--snug-text-primary))]"
                >
                  <span className="w-1.5 h-1.5 bg-[hsl(var(--snug-text-primary))] rounded-full flex-shrink-0" />
                  <span>{t(`facilities.${getFacilityI18nKey(facilityCode)}`)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
