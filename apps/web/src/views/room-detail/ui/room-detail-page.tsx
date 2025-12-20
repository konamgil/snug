'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  ImageIcon,
  Home,
  Bath,
  BedDouble,
  Users,
  Calendar,
  MapPin,
  Clock,
  Wifi,
  Car,
  Snowflake,
  Tv,
  UtensilsCrossed,
  WashingMachine,
  Wind,
  Coffee,
  Dumbbell,
  ShieldCheck,
  Info,
  ChevronDown,
  X,
} from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { DatePicker } from '@/features/search/ui/date-picker';
import {
  GuestPicker,
  formatGuestSummary,
  type GuestCount,
} from '@/features/search/ui/guest-picker';
import { ImageGalleryModal } from './image-gallery-modal';

// Mock room data
const roomData = {
  id: '1',
  title: 'Cozy Studio in Gangnam',
  location: 'Gangnam-gu',
  district: 'Seoul',
  address: '123 Gangnam-daero, Gangnam-gu, Seoul',
  lat: 37.4979,
  lng: 127.0276,
  rooms: 1,
  bathrooms: 1,
  beds: 2,
  guests: 2,
  size: '58㎡',
  floor: '5th Floor',
  originalPrice: 200,
  price: 160,
  nights: 2,
  tags: [
    { label: 'For Women', color: 'orange' as const },
    { label: 'Near Subway', color: 'purple' as const },
  ],
  description:
    'A beautiful and cozy studio apartment located in the heart of Gangnam. Perfect for solo travelers or couples looking for a comfortable stay in Seoul. The apartment features modern amenities and is within walking distance to major attractions, shopping centers, and public transportation.',
  guidelines: [
    { icon: 'clock', text: 'Check-in: 3:00 PM' },
    { icon: 'clock', text: 'Check-out: 11:00 AM' },
    { icon: 'users', text: 'Max 2 guests' },
    { icon: 'cigarette', text: 'No smoking' },
  ],
  details: [
    { label: 'Room Type', value: 'Studio' },
    { label: 'Floor', value: '5th Floor' },
    { label: 'Size', value: '58㎡' },
    { label: 'Bedrooms', value: '1' },
    { label: 'Bathrooms', value: '1' },
    { label: 'Orientation', value: 'South' },
  ],
  facilities: ['Wifi', 'Air Conditioning', 'TV', 'Kitchen', 'Washer', 'Dryer'],
  amenities: ['Gym', 'Parking', 'Security', 'Elevator', 'Rooftop'],
  houseRules: [
    { icon: 'pet', text: 'No pets allowed', allowed: false },
    { icon: 'party', text: 'No parties or events', allowed: false },
    { icon: 'baby', text: 'Not suitable for infants', allowed: false },
    { icon: 'music', text: 'Quiet hours: 10PM - 8AM', allowed: true },
  ],
  refundPolicy:
    'Full refund if canceled 7 days before check-in. 50% refund if canceled 3 days before check-in. No refund for cancellations made less than 3 days before check-in.',
  longTermDiscount: 'Stay 7+ nights and get 10% off. Stay 30+ nights and get 20% off.',
  host: {
    name: 'Kim',
    responseRate: 98,
    responseTime: 'within an hour',
  },
};

const facilityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Wifi: Wifi,
  'Air Conditioning': Snowflake,
  TV: Tv,
  Kitchen: UtensilsCrossed,
  Washer: WashingMachine,
  Dryer: Wind,
  Gym: Dumbbell,
  Parking: Car,
  Security: ShieldCheck,
  Coffee: Coffee,
};

const tagColors = {
  orange: 'border-[hsl(var(--snug-orange))] text-[hsl(var(--snug-orange))] bg-white',
  purple: 'bg-purple-500 text-white',
  blue: 'bg-blue-500 text-white',
  green: 'bg-green-500 text-white',
};

// Format date for display
function formatDate(date: Date | null): string {
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
  const _t = useTranslations('roomDetail');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState<GuestCount>({ adults: 1, children: 0, infants: 0 });
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isGuestOpen, setIsGuestOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
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

  // Mock images array (placeholder for actual images)
  const roomImages = Array.from(
    { length: totalImages },
    (_, i) => `/images/rooms/room-${i + 1}.jpg`,
  );

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

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : totalImages - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev < totalImages - 1 ? prev + 1 : 0));
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleDateSelect = (newCheckIn: Date | null, newCheckOut: Date | null) => {
    setCheckIn(newCheckIn);
    setCheckOut(newCheckOut);
  };

  const nights = calculateNights(checkIn, checkOut) || 2; // Default 2 nights for display
  const subtotal = roomData.price * nights;
  const serviceFee = Math.round(subtotal * 0.1);
  const total = subtotal + serviceFee;
  const guestSummary = formatGuestSummary(guests) || '1 Guest';

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-[hsl(var(--snug-border))]">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            type="button"
            className="p-2 hover:bg-[hsl(var(--snug-light-gray))] rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className="p-2 hover:bg-[hsl(var(--snug-light-gray))] rounded-full transition-colors"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
            <button
              type="button"
              className="p-2 hover:bg-[hsl(var(--snug-light-gray))] rounded-full transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Image Gallery */}
            <div
              className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-6 cursor-pointer group"
              onClick={() => setIsGalleryOpen(true)}
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

            {/* Image Gallery Modal */}
            <ImageGalleryModal
              isOpen={isGalleryOpen}
              onClose={() => setIsGalleryOpen(false)}
              images={roomImages}
              initialIndex={currentImageIndex}
            />

            {/* Room Type Badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-[hsl(var(--snug-orange))] text-white text-xs font-medium rounded-full">
                Studio
              </span>
              <span className="text-sm text-[hsl(var(--snug-gray))]">{roomData.size}</span>
            </div>

            {/* Title & Location */}
            <h1 className="text-2xl font-bold text-[hsl(var(--snug-text-primary))] mb-2">
              {roomData.title}
            </h1>
            <div className="flex items-center gap-1 text-sm text-[hsl(var(--snug-gray))] mb-4">
              <MapPin className="w-4 h-4" />
              <span>{roomData.address}</span>
            </div>

            {/* Room Info */}
            <div className="flex items-center gap-4 pb-6 border-b border-[hsl(var(--snug-border))]">
              <div className="flex items-center gap-1.5 text-sm text-[hsl(var(--snug-text-primary))]">
                <Home className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
                <span>{roomData.rooms} Room</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-[hsl(var(--snug-text-primary))]">
                <Bath className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
                <span>{roomData.bathrooms} Bath</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-[hsl(var(--snug-text-primary))]">
                <BedDouble className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
                <span>{roomData.beds} Bed</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-[hsl(var(--snug-text-primary))]">
                <Users className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
                <span>{roomData.guests} Guests</span>
              </div>
            </div>

            {/* Description */}
            <Section
              title="About this place"
              expanded={expandedSections.description ?? false}
              onToggle={() => toggleSection('description')}
            >
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
              <div className="grid grid-cols-2 gap-3">
                {roomData.guidelines.map((guideline) => (
                  <div
                    key={guideline.text}
                    className="flex items-center gap-2 text-sm text-[hsl(var(--snug-text-primary))]"
                  >
                    <Clock className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
                    <span>{guideline.text}</span>
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
              <div className="grid grid-cols-3 gap-4">
                {roomData.details.map((detail) => (
                  <div
                    key={detail.label}
                    className="p-3 bg-[hsl(var(--snug-light-gray))] rounded-lg"
                  >
                    <p className="text-xs text-[hsl(var(--snug-gray))] mb-1">{detail.label}</p>
                    <p className="text-sm font-medium text-[hsl(var(--snug-text-primary))]">
                      {detail.value}
                    </p>
                  </div>
                ))}
              </div>
            </Section>

            {/* Facilities */}
            <Section
              title="Facilities"
              expanded={expandedSections.facilities ?? false}
              onToggle={() => toggleSection('facilities')}
            >
              <div className="grid grid-cols-3 gap-3">
                {roomData.facilities.map((facility) => {
                  const Icon = facilityIcons[facility] || Wifi;
                  return (
                    <div
                      key={facility}
                      className="flex items-center gap-2 text-sm text-[hsl(var(--snug-text-primary))]"
                    >
                      <Icon className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
                      <span>{facility}</span>
                    </div>
                  );
                })}
              </div>
            </Section>

            {/* House Amenities */}
            <Section
              title="House Amenities"
              expanded={expandedSections.amenities ?? false}
              onToggle={() => toggleSection('amenities')}
            >
              <div className="grid grid-cols-3 gap-3">
                {roomData.amenities.map((amenity) => {
                  const Icon = facilityIcons[amenity] || ShieldCheck;
                  return (
                    <div
                      key={amenity}
                      className="flex items-center gap-2 text-sm text-[hsl(var(--snug-text-primary))]"
                    >
                      <Icon className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
                      <span>{amenity}</span>
                    </div>
                  );
                })}
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

            {/* Location */}
            <Section title="Location" expanded={true} onToggle={() => {}} showToggle={false}>
              <div className="flex items-center gap-1 text-sm text-[hsl(var(--snug-gray))] mb-4">
                <MapPin className="w-4 h-4" />
                <span>{roomData.address}</span>
              </div>
              <div className="h-[300px] rounded-xl overflow-hidden bg-[hsl(var(--snug-light-gray))]">
                {isLoaded ? (
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={{ lat: roomData.lat, lng: roomData.lng }}
                    zoom={15}
                    options={{
                      disableDefaultUI: true,
                      zoomControl: true,
                    }}
                  >
                    <Marker position={{ lat: roomData.lat, lng: roomData.lng }} />
                  </GoogleMap>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-[hsl(var(--snug-gray))]/30" />
                  </div>
                )}
              </div>
            </Section>

            {/* Other Stays */}
            <Section
              title="Other Stays You May Like"
              expanded={true}
              onToggle={() => {}}
              showToggle={false}
            >
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="cursor-pointer group">
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-2">
                      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--snug-light-gray))] to-[hsl(var(--snug-border))] flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-[hsl(var(--snug-gray))]/30" />
                      </div>
                    </div>
                    <h4 className="text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-0.5 group-hover:text-[hsl(var(--snug-orange))] transition-colors">
                      Modern Studio {i}
                    </h4>
                    <p className="text-xs text-[hsl(var(--snug-gray))] mb-1">Gangnam-gu, Seoul</p>
                    <p className="text-sm font-bold text-[hsl(var(--snug-orange))]">
                      $150{' '}
                      <span className="text-xs font-normal text-[hsl(var(--snug-gray))]">
                        / night
                      </span>
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
              <p className="text-sm text-[hsl(var(--snug-gray))] leading-relaxed">
                {roomData.refundPolicy}
              </p>
            </Section>

            {/* Long-Term Discount */}
            <Section
              title="Long-Term Discount"
              expanded={expandedSections.longTermDiscount ?? false}
              onToggle={() => toggleSection('longTermDiscount')}
            >
              <p className="text-sm text-[hsl(var(--snug-gray))] leading-relaxed">
                {roomData.longTermDiscount}
              </p>
            </Section>

            {/* Notes */}
            <Section title="Important Notes" expanded={true} onToggle={() => {}} showToggle={false}>
              <div className="p-4 bg-[hsl(var(--snug-light-gray))] rounded-xl">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-[hsl(var(--snug-orange))] flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-[hsl(var(--snug-gray))] leading-relaxed">
                    <p className="mb-2">
                      Please read the house rules carefully before booking. The host may request
                      identification upon check-in.
                    </p>
                    <p>
                      For any questions or special requests, please contact the host through the
                      messaging system.
                    </p>
                  </div>
                </div>
              </div>
            </Section>
          </div>

          {/* Booking Sidebar */}
          <div className="w-[360px] flex-shrink-0">
            <div className="sticky top-20 bg-white border border-[hsl(var(--snug-border))] rounded-2xl p-5 shadow-lg">
              {/* Price */}
              <div className="flex items-baseline gap-2 mb-5">
                {roomData.originalPrice && (
                  <span className="text-lg text-[hsl(var(--snug-gray))] line-through">
                    ${roomData.originalPrice}
                  </span>
                )}
                <span className="text-2xl font-bold text-[hsl(var(--snug-orange))]">
                  ${roomData.price}
                </span>
                <span className="text-sm text-[hsl(var(--snug-gray))]">/ night</span>
              </div>

              {/* Date & Guests Selection */}
              <div className="border border-[hsl(var(--snug-border))] rounded-xl overflow-visible mb-4">
                {/* Dates Trigger */}
                <div ref={datePickerRef} className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDateOpen(!isDateOpen);
                      setIsGuestOpen(false);
                    }}
                    className="w-full p-3 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
                        <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                          {checkIn && checkOut
                            ? `${formatDate(checkIn)} - ${formatDate(checkOut)}`
                            : 'Stay Dates'}
                        </span>
                      </div>
                      {checkIn && checkOut ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCheckIn(null);
                            setCheckOut(null);
                          }}
                          className="p-1 hover:bg-[hsl(var(--snug-light-gray))] rounded-full"
                        >
                          <X className="w-3.5 h-3.5 text-[hsl(var(--snug-gray))]" />
                        </button>
                      ) : (
                        <ChevronDown
                          className={`w-4 h-4 text-[hsl(var(--snug-gray))] transition-transform ${isDateOpen ? 'rotate-180' : ''}`}
                        />
                      )}
                    </div>
                  </button>

                  {/* Date Picker Dropdown */}
                  {isDateOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[hsl(var(--snug-border))] rounded-xl shadow-lg z-50 p-4">
                      <div className="flex items-center justify-between mb-3 pb-3 border-b border-[hsl(var(--snug-border))]">
                        <span className="text-sm font-medium text-[hsl(var(--snug-text-primary))]">
                          {checkIn && checkOut
                            ? `${formatDate(checkIn)} - ${formatDate(checkOut)}`
                            : checkIn
                              ? `${formatDate(checkIn)} - Select checkout`
                              : 'Select dates'}
                        </span>
                        {(checkIn || checkOut) && (
                          <button
                            type="button"
                            onClick={() => {
                              setCheckIn(null);
                              setCheckOut(null);
                            }}
                            className="p-1 hover:bg-[hsl(var(--snug-light-gray))] rounded-full"
                          >
                            <X className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
                          </button>
                        )}
                      </div>
                      <DatePicker
                        checkIn={checkIn}
                        checkOut={checkOut}
                        onDateSelect={handleDateSelect}
                      />
                    </div>
                  )}
                </div>

                {/* Guests Trigger */}
                <div
                  ref={guestPickerRef}
                  className="relative border-t border-[hsl(var(--snug-border))]"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIsGuestOpen(!isGuestOpen);
                      setIsDateOpen(false);
                    }}
                    className="w-full p-3 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
                        <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                          {guestSummary}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-[hsl(var(--snug-gray))] transition-transform ${isGuestOpen ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </button>

                  {/* Guest Picker Dropdown */}
                  {isGuestOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[hsl(var(--snug-border))] rounded-xl shadow-lg z-50 p-4">
                      <GuestPicker guests={guests} onGuestChange={setGuests} />
                    </div>
                  )}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 pb-4 border-b border-[hsl(var(--snug-border))] mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[hsl(var(--snug-gray))] underline">
                    ${roomData.price} x {nights} nights
                  </span>
                  <span className="text-[hsl(var(--snug-text-primary))]">${subtotal}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[hsl(var(--snug-gray))] underline">Service fee</span>
                  <span className="text-[hsl(var(--snug-text-primary))]">${serviceFee}</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-base font-semibold text-[hsl(var(--snug-text-primary))]">
                  Total
                </span>
                <span className="text-xl font-bold text-[hsl(var(--snug-text-primary))]">
                  ${total}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  type="button"
                  className="w-full py-3 bg-[hsl(var(--snug-orange))] text-white font-medium rounded-full hover:opacity-90 transition-opacity"
                >
                  Reserve Now
                </button>
                <button
                  type="button"
                  className="w-full py-3 border border-[hsl(var(--snug-orange))] text-[hsl(var(--snug-orange))] font-medium rounded-full hover:bg-[hsl(var(--snug-orange))]/5 transition-colors"
                >
                  Contact Host
                </button>
              </div>

              {/* Notice */}
              <p className="text-xs text-center text-[hsl(var(--snug-gray))] mt-4">
                You won't be charged yet
              </p>
            </div>
          </div>
        </div>
      </div>
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
    <div className="py-6 border-b border-[hsl(var(--snug-border))]">
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
