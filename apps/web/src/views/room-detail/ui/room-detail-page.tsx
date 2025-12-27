'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, ImageIcon, ChevronDown, X } from 'lucide-react';
import {
  LocationIcon,
  CalendarIcon as _CalendarIcon,
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
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { formatGuestSummary, type GuestCount } from '@/features/search/ui/guest-picker';
import { BookingSidePanel } from './booking-side-panel';
import { useCurrencySafe } from '@/shared/providers';

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
    { label: 'Check-in', value: 'Self check-in (Password will be provided)' },
    { label: 'Check-out', value: 'By 12:30 PM' },
    { label: 'Cooking', value: 'Allowed — please clean-up after use' },
    { label: 'Laundry', value: 'Long-term stays welcome' },
  ],
  details: [
    { icon: 'area', label: 'Area', value: '30㎡' },
    { icon: 'elevator', label: 'Elevator', value: 'Available' },
    { icon: 'parking', label: 'Parking', value: 'Available' },
    { icon: 'room', label: 'Room', value: '1' },
    { icon: 'living', label: 'Living room', value: '1' },
    { icon: 'bathroom', label: 'Bathroom', value: '1' },
    { icon: 'kitchen', label: 'Kitchen', value: '1' },
    { icon: 'floor', label: '2nd Floor', value: '1' },
    { icon: 'balcony', label: 'Balcony', value: '1' },
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
    title: 'Included in Maintenance Fee',
    subtitle: '(Gas, Water, Internet, Electricity)',
    content:
      'All utility charges and internet fees are included in the maintenance fee. If any of the included services are used excessively, additional charges may apply.',
  },
  refundPolicy: [
    'More than 15 days before check-in: 90% refund of rent and contract fee',
    '14-8 days before check-in: 70% refund of rent and contract fee',
    '7-1 days before check-in: 50% refund of rent and contract fee',
    'On the check-in date: No refund',
  ],
  notes: [
    'For same-day cancellations, 10% of the rent and contract fee will be charged as a penalty according to the refund policy. However, if the cancellation falls within the free cancellation period, a full refund will be issued.',
    'Maintenance fees, cleaning fees, and deposits are fully refundable.',
    "The refund policy may vary depending on the host's terms.",
  ],
  longTermDiscount: [
    { period: 'Contract for 2+ weeks', discount: '5% off' },
    { period: 'Contract for 4+ weeks', discount: '10% off' },
    { period: 'Contract for 12+ weeks', discount: '20% off' },
  ],
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

const tagColors = {
  orange: 'border-[hsl(var(--snug-orange))] text-[hsl(var(--snug-orange))] bg-white',
  purple: 'bg-purple-500 text-white',
  blue: 'bg-blue-500 text-white',
  green: 'bg-green-500 text-white',
};

// Format date for display
function _formatDate(date: Date | null): string {
  if (!date) return 'Select';
  const month = date.toLocaleString('en', { month: 'short' });
  const day = date.getDate();
  const year = date.getFullYear().toString().slice(-2);
  return `${month} ${day}, ${year}`;
}

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
  const i18nRouter = useI18nRouter();
  const { format } = useCurrencySafe();
  const roomId = (params.id as string) || '1';

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [checkIn] = useState<Date | null>(null);
  const [checkOut] = useState<Date | null>(null);
  const [guests] = useState<GuestCount>({ adults: 1, children: 0, infants: 0 });
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

  const datePickerRef = useRef<HTMLDivElement>(null);
  const guestPickerRef = useRef<HTMLDivElement>(null);
  const totalImages = 20;

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

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : totalImages - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev < totalImages - 1 ? prev + 1 : 0));
  };

  const handleOpenGallery = () => {
    router.push(`/${locale}/room/${roomId}/gallery`);
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const nights = calculateNights(checkIn, checkOut) || roomData.nights; // Default from mock data
  const subtotal = roomData.pricePerNight * nights;
  const serviceFee = Math.round(subtotal * (roomData.serviceFeePercent / 100));
  const discount = nights >= roomData.longStayThreshold ? roomData.longStayDiscount : 0;
  const _total = subtotal + roomData.cleaningFee + roomData.deposit - discount - serviceFee;
  const _guestSummary = formatGuestSummary(guests) || '1 Guest';

  // Handle search from header - navigate to search page
  const handleHeaderSearch = (values: SearchBarValues) => {
    const searchParams = new URLSearchParams();
    if (values.location) searchParams.set('location', values.location);
    if (values.checkIn) searchParams.set('checkIn', values.checkIn.toISOString().substring(0, 10));
    if (values.checkOut)
      searchParams.set('checkOut', values.checkOut.toISOString().substring(0, 10));
    const totalGuests = values.guests.adults + values.guests.children;
    if (totalGuests > 0) searchParams.set('guests', totalGuests.toString());
    i18nRouter.push(`/search?${searchParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Desktop Header - Hidden on Mobile */}
      <Header variant="with-search" onSearch={handleHeaderSearch} />

      {/* Mobile Image Gallery - Full Width with Overlay Buttons */}
      <div className="lg:hidden relative">
        <div
          className="relative aspect-[4/3] overflow-hidden cursor-pointer"
          onClick={handleOpenGallery}
        >
          {/* Placeholder Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--snug-light-gray))] to-[hsl(var(--snug-border))] flex items-center justify-center">
            <ImageIcon className="w-16 h-16 text-[hsl(var(--snug-gray))]/30" />
          </div>

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
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-white border border-[hsl(var(--snug-orange))] text-[hsl(var(--snug-orange))]">
              {roomData.roomType}
            </span>
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-500 text-white">
              {roomData.buildingType}
            </span>
          </div>

          {/* Mobile Image Counter + More */}
          <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/60 rounded-full text-white text-xs z-10">
            <span>
              {currentImageIndex + 1}/{totalImages} · More
            </span>
          </div>
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
              {/* Placeholder Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--snug-light-gray))] to-[hsl(var(--snug-border))] flex items-center justify-center group-hover:brightness-95 transition-all">
                <ImageIcon className="w-16 h-16 text-[hsl(var(--snug-gray))]/30" />
              </div>

              {/* Tags */}
              <div className="absolute top-4 left-4 flex gap-2 z-10">
                {roomData.tags.map((tag, index) => (
                  <span
                    key={tag.label}
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      index === 0 ? tagColors[tag.color] + ' border' : tagColors[tag.color]
                    }`}
                  >
                    {tag.label}
                  </span>
                ))}
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
              <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/60 rounded-full text-white text-sm z-10">
                {currentImageIndex + 1} / {totalImages}
              </div>
            </div>

            {/* Room Type Badge - Desktop */}
            <div className="hidden lg:flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-[hsl(var(--snug-orange))] text-white text-xs font-medium rounded-full">
                Studio
              </span>
              <span className="text-sm text-[hsl(var(--snug-gray))]">{roomData.size}</span>
            </div>

            {/* Title & Location */}
            {/* Mobile: Location as title */}
            <h1 className="lg:hidden text-lg font-bold text-[hsl(var(--snug-text-primary))] mb-2">
              {roomData.location}, {roomData.district}
            </h1>
            {/* Desktop: Title with heart icon */}
            <div className="hidden lg:flex items-center justify-between mb-2">
              <h1 className="text-xl font-bold text-[hsl(var(--snug-text-primary))]">
                {roomData.location}, {roomData.district}
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
                  {roomData.rooms} Rooms · {roomData.bathrooms} Bathroom · {roomData.beds} Bed
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[13px] text-[hsl(var(--snug-gray))]">
                <UserIcon className="w-3.5 h-3.5" />
                <span>{roomData.guests} Guests</span>
              </div>
            </div>
            {/* Desktop Room Info */}
            <div className="hidden lg:block pb-6">
              <div className="flex items-center gap-1.5 text-sm text-[hsl(var(--snug-gray))] mb-1">
                <HotelIcon className="w-4 h-4" />
                <span>
                  {roomData.rooms} Rooms · {roomData.bathrooms} Bathroom · {roomData.beds} Bed
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-[hsl(var(--snug-gray))]">
                <UserIcon className="w-4 h-4" />
                <span>{roomData.guests} Guests</span>
              </div>
            </div>

            {/* Mobile: Shared Room Info Card */}
            <div className="lg:hidden py-6">
              <div className="flex flex-col items-center text-center p-5 border-2 border-[hsl(var(--snug-orange))] rounded-2xl">
                <p className="text-base font-semibold text-[hsl(var(--snug-text-primary))] mb-1">
                  {roomData.roomType}
                </p>
                <p className="text-[13px] text-[hsl(var(--snug-gray))]">
                  {roomData.roomTypeDescription}
                </p>
              </div>
            </div>

            {/* Stay Description */}
            <Section
              title="Stay Description"
              expanded={expandedSections.description ?? false}
              onToggle={() => toggleSection('description')}
            >
              <p className="text-sm font-semibold text-[hsl(var(--snug-text-primary))] mb-2">
                {roomData.title}
              </p>
              <p className="text-sm text-[hsl(var(--snug-gray))] leading-relaxed">
                {roomData.description}
              </p>
            </Section>

            {/* Guidelines */}
            <Section
              title="Guidelines"
              expanded={expandedSections.guidelines ?? false}
              onToggle={() => toggleSection('guidelines')}
            >
              <div className="space-y-2">
                {roomData.guidelines.map((guideline) => (
                  <div key={guideline.label} className="text-sm">
                    <span className="text-[hsl(var(--snug-text-primary))]">
                      {guideline.label}:{' '}
                    </span>
                    <span className="text-[hsl(var(--snug-gray))]">{guideline.value}</span>
                  </div>
                ))}
              </div>
            </Section>

            {/* Details */}
            <Section
              title="Details"
              expanded={expandedSections.details ?? false}
              onToggle={() => toggleSection('details')}
            >
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {roomData.details.map((detail) => {
                  const Icon = detailIcons[detail.icon] || RoomIcon;
                  return (
                    <div
                      key={detail.label}
                      className="flex items-center gap-2 text-sm text-[hsl(var(--snug-text-primary))]"
                    >
                      <Icon className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
                      <span>{detail.label}</span>
                      <span className="text-[hsl(var(--snug-gray))]">· {detail.value}</span>
                    </div>
                  );
                })}
              </div>
            </Section>

            {/* Facilities */}
            <Section
              title="Facilities"
              expanded={expandedSections.facilities ?? false}
              onToggle={() => toggleSection('facilities')}
            >
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                {roomData.facilities.slice(0, 9).map((facility) => (
                  <div
                    key={facility}
                    className="flex items-center gap-2 text-sm text-[hsl(var(--snug-text-primary))]"
                  >
                    <span className="w-1.5 h-1.5 bg-[hsl(var(--snug-text-primary))] rounded-full" />
                    <span>{facility}</span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setIsFacilitiesModalOpen(true)}
                className="w-full py-3 border border-[hsl(var(--snug-border))] rounded-xl text-sm font-medium text-[hsl(var(--snug-text-primary))] hover:bg-[hsl(var(--snug-light-gray))] transition-colors"
              >
                Facilities More
              </button>
            </Section>

            {/* House Amenities */}
            <Section
              title="House Amenities"
              expanded={expandedSections.amenities ?? false}
              onToggle={() => toggleSection('amenities')}
            >
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {roomData.houseAmenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-2 text-sm text-[hsl(var(--snug-text-primary))]"
                  >
                    <span className="w-1.5 h-1.5 bg-[hsl(var(--snug-text-primary))] rounded-full" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </Section>

            {/* House Rules */}
            <Section
              title="House Rules"
              expanded={expandedSections.houseRules ?? false}
              onToggle={() => toggleSection('houseRules')}
            >
              <div className="space-y-3">
                {roomData.houseRules.map((rule) => (
                  <div key={rule.text} className="flex items-center gap-2 text-sm">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        rule.allowed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {rule.allowed ? '✓' : '✗'}
                    </div>
                    <span className="text-[hsl(var(--snug-text-primary))]">{rule.text}</span>
                  </div>
                ))}
              </div>
            </Section>

            {/* Information */}
            <Section title="Information" expanded={true} onToggle={() => {}} showToggle={false}>
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <h4 className="text-sm font-semibold text-[hsl(var(--snug-text-primary))]">
                    {roomData.information.title}
                  </h4>
                  <span className="text-sm text-[hsl(var(--snug-gray))]">
                    {roomData.information.subtitle}
                  </span>
                </div>
                <p className="text-sm text-[hsl(var(--snug-gray))] leading-relaxed">
                  {roomData.information.content}
                </p>
              </div>
            </Section>

            {/* Location */}
            <Section title="Location" expanded={true} onToggle={() => {}} showToggle={false}>
              <p className="text-xs text-[hsl(var(--snug-text-primary))] mb-3">
                {roomData.address}
              </p>
              {/* Location Filter Buttons */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                <button
                  type="button"
                  className="px-3 py-1.5 bg-[hsl(var(--snug-orange))] text-white text-xs font-extrabold rounded-full"
                >
                  Subway Station
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 bg-[#999] text-white text-xs font-extrabold rounded-full"
                >
                  Bus Stop
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 bg-[#999] text-white text-xs font-extrabold rounded-full"
                >
                  Convenience store
                </button>
              </div>
              {/* Map Container */}
              <div className="relative h-[250px] lg:h-[350px] rounded-[20px] overflow-hidden bg-[hsl(var(--snug-light-gray))] border border-[hsl(var(--snug-border))]">
                {shouldShowMap ? (
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={{ lat: roomData.lat, lng: roomData.lng }}
                    zoom={15}
                    options={{
                      disableDefaultUI: true,
                      zoomControl: false,
                    }}
                  >
                    <Marker position={{ lat: roomData.lat, lng: roomData.lng }} />
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
                {/* Snug Marker */}
                <div className="absolute top-[100px] left-[calc(50%-30px)] pointer-events-none">
                  <SnugMarkerIcon className="w-[62px] h-[50px]" />
                </div>
              </div>
            </Section>

            {/* Other Stays */}
            <Section
              title="Other Stays You May Like"
              expanded={true}
              onToggle={() => {}}
              showToggle={false}
            >
              {/* Mobile: Horizontal Scroll */}
              <div className="lg:hidden -mx-4 px-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="flex gap-3" style={{ width: 'max-content' }}>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="cursor-pointer group w-[140px] flex-shrink-0">
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-2">
                        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--snug-light-gray))] to-[hsl(var(--snug-border))] flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-[hsl(var(--snug-gray))]/30" />
                        </div>
                      </div>
                      <h4 className="text-xs font-medium text-[hsl(var(--snug-text-primary))] mb-0.5 truncate">
                        Modern Studio {i}
                      </h4>
                      <p className="text-[10px] text-[hsl(var(--snug-gray))] mb-1">Gangnam-gu</p>
                      <p className="text-xs font-bold text-[hsl(var(--snug-orange))]">
                        $150{' '}
                        <span className="text-[10px] font-normal text-[hsl(var(--snug-gray))]">
                          / night
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Desktop: Grid */}
              <div className="hidden lg:grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="cursor-pointer group">
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3">
                      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--snug-light-gray))] to-[hsl(var(--snug-border))] flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-[hsl(var(--snug-gray))]/30" />
                      </div>
                      {/* Tags */}
                      <div className="absolute top-3 left-3 flex gap-1.5 z-10">
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-white border border-[hsl(var(--snug-orange))] text-[hsl(var(--snug-orange))]">
                          Shared Room
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-purple-500 text-white">
                          Apartment
                        </span>
                      </div>
                      {/* Heart */}
                      <button className="absolute top-3 right-3 p-1.5 bg-white/90 rounded-full z-10">
                        <HeartIcon className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
                      </button>
                      {/* Counter */}
                      <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 rounded-full text-white text-[10px] z-10">
                        1/10
                      </div>
                    </div>
                    <h4 className="text-sm font-semibold text-[hsl(var(--snug-text-primary))] mb-1">
                      Nonhyeon-dong, Gangnam-gu
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-[hsl(var(--snug-gray))] mb-0.5">
                      <HotelIcon className="w-3 h-3" />
                      <span>1 Rooms · 1 Bathroom · 2 Bed</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[hsl(var(--snug-gray))] mb-1">
                      <UserIcon className="w-3 h-3" />
                      <span>2 Guests</span>
                    </div>
                    <p className="text-sm">
                      <span className="text-[hsl(var(--snug-gray))] line-through mr-1">$200</span>
                      <span className="font-bold text-[hsl(var(--snug-orange))]">$160</span>
                      <span className="text-xs text-[hsl(var(--snug-gray))]"> for 2 nights</span>
                    </p>
                  </div>
                ))}
              </div>
            </Section>

            {/* Refund Policy */}
            <Section
              title="Refund Policy"
              expanded={expandedSections.refundPolicy ?? false}
              onToggle={() => toggleSection('refundPolicy')}
            >
              <ul className="space-y-2">
                {roomData.refundPolicy.map((policy, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-[hsl(var(--snug-gray))]"
                  >
                    <span className="w-1.5 h-1.5 mt-1.5 bg-[hsl(var(--snug-text-primary))] rounded-full flex-shrink-0" />
                    <span>{policy}</span>
                  </li>
                ))}
              </ul>
            </Section>

            {/* Long-Term Stay Discount */}
            <Section
              title="Long-Term Stay Discount"
              expanded={expandedSections.longTermDiscount ?? false}
              onToggle={() => toggleSection('longTermDiscount')}
            >
              <ul className="space-y-2">
                {roomData.longTermDiscount.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-[hsl(var(--snug-gray))]"
                  >
                    <span className="w-1.5 h-1.5 mt-1.5 bg-[hsl(var(--snug-gray))] rounded-full flex-shrink-0" />
                    <span>
                      {item.period}: {item.discount}
                    </span>
                  </li>
                ))}
              </ul>
            </Section>

            {/* Notes */}
            <Section title="Notes" expanded={true} onToggle={() => {}} showToggle={false}>
              <ul className="space-y-2">
                {roomData.notes.map((note, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-[hsl(var(--snug-gray))]"
                  >
                    <span className="w-1.5 h-1.5 mt-1.5 bg-[hsl(var(--snug-gray))] rounded-full flex-shrink-0" />
                    <span className="leading-relaxed">{note}</span>
                  </li>
                ))}
              </ul>
            </Section>
          </div>

          {/* Booking Sidebar - Desktop Only */}
          <div className="hidden lg:block w-[350px] flex-shrink-0">
            <div className="sticky top-24">
              <BookingSidePanel
                roomType={roomData.roomType}
                roomTypeDescription="A shared house for living together and connecting with others."
                priceBreakdown={{
                  pricePerNight: roomData.pricePerNight,
                  nights: nights,
                  cleaningFee: roomData.cleaningFee,
                  deposit: roomData.deposit,
                  longStayDiscount: roomData.longStayDiscount,
                  longStayThreshold: roomData.longStayThreshold,
                  serviceFeePercent: roomData.serviceFeePercent,
                }}
                initialCheckIn={checkIn}
                initialCheckOut={checkOut}
                initialGuests={guests}
                onBook={() => router.push(`/${locale}/room/${roomId}/payment`)}
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
          <span className="text-base font-bold text-[hsl(var(--snug-text-primary))]">Total</span>
          <span className="text-base font-bold text-[hsl(var(--snug-text-primary))]">
            {format(roomData.total)}
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
            <span>Chat with Host</span>
          </button>
          {/* Book Button */}
          <button
            type="button"
            onClick={() => router.push(`/${locale}/room/${roomId}/payment`)}
            className="flex-1 py-3.5 bg-[hsl(var(--snug-orange))] text-white text-sm font-semibold rounded-full hover:opacity-90 transition-opacity"
          >
            Book
          </button>
        </div>
      </div>

      {/* Facilities Modal */}
      <FacilitiesModal
        isOpen={isFacilitiesModalOpen}
        onClose={() => setIsFacilitiesModalOpen(false)}
        facilities={roomData.facilities}
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
}

function FacilitiesModal({ isOpen, onClose, facilities }: FacilitiesModalProps) {
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
          <h2 className="text-lg font-bold text-[hsl(var(--snug-text-primary))]">Facilities</h2>
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
            {facilities.map((facility) => (
              <li
                key={facility}
                className="flex items-center gap-3 text-sm text-[hsl(var(--snug-text-primary))]"
              >
                <span className="w-1.5 h-1.5 bg-[hsl(var(--snug-text-primary))] rounded-full flex-shrink-0" />
                <span>{facility}</span>
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
            <h2 className="text-lg font-bold text-[hsl(var(--snug-text-primary))]">Facilities</h2>
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
              {facilities.map((facility) => (
                <li
                  key={facility}
                  className="flex items-center gap-3 text-sm text-[hsl(var(--snug-text-primary))]"
                >
                  <span className="w-1.5 h-1.5 bg-[hsl(var(--snug-text-primary))] rounded-full flex-shrink-0" />
                  <span>{facility}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
