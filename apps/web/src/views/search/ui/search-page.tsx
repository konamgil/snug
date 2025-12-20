'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import {
  ChevronDown,
  MapPin,
  Calendar,
  Users,
  Search,
  User,
  Globe,
  MessageCircle,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { DatePicker } from '@/features/search/ui/date-picker';
import {
  GuestPicker,
  formatGuestSummary,
  type GuestCount,
} from '@/features/search/ui/guest-picker';
import { FilterBar } from './filter-bar';
import { RoomCard, type Room } from './room-card';
import { SearchMap } from './search-map';

// Popular search locations
const popularLocations = [
  { dong: 'Seocho-dong', gu: 'Gangnam-gu' },
  { dong: 'Yeoksam-dong', gu: 'Gangnam-gu' },
  { dong: 'Apgujeong-dong', gu: 'Gangnam-gu' },
  { dong: 'Seonneung-dong', gu: 'Gangnam-gu' },
  { dong: 'Cheongdam-dong', gu: 'Gangnam-gu' },
  { dong: 'Yangjae-dong', gu: 'Gangnam-gu' },
  { dong: 'Bangbae-dong', gu: 'Gangnam-gu' },
  { dong: 'Sinsa-dong', gu: 'Gangnam-gu' },
  { dong: 'Nonhyeon-dong', gu: 'Gangnam-gu' },
  { dong: 'Dogok-dong', gu: 'Gangnam-gu' },
];

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
      { label: 'Apartment', color: 'orange' },
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
      { label: 'Apartment', color: 'orange' },
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
      { label: 'Shared House', color: 'purple' },
      { label: 'Dormitory', color: 'orange' },
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
      { label: 'Shared House', color: 'purple' },
      { label: 'Apartment', color: 'orange' },
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
      { label: 'Hotel', color: 'blue' },
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
      { label: 'Apartment', color: 'orange' },
    ],
    imageUrl: '/images/rooms/room-6.jpg',
    lat: 37.5132,
    lng: 127.0425,
  },
];

export function SearchPage() {
  const t = useTranslations('search');
  const tHome = useTranslations('home');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isDateFocused, setIsDateFocused] = useState(false);
  const [isGuestFocused, setIsGuestFocused] = useState(false);
  const [locationValue, setLocationValue] = useState('');
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState<GuestCount>({ adults: 0, children: 0, infants: 0 });
  const searchBarRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const guestPickerRef = useRef<HTMLDivElement>(null);

  const roomCount = MOCK_ROOMS.length;
  const searchLocation = 'Gangnam';

  // Handle click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDateFocused(false);
      }
      if (guestPickerRef.current && !guestPickerRef.current.contains(event.target as Node)) {
        setIsGuestFocused(false);
      }
    }

    if (isSearchFocused || isDateFocused || isGuestFocused) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchFocused, isDateFocused, isGuestFocused]);

  const handleLocationSelect = (dong: string, gu: string) => {
    setLocationValue(`${dong}, ${gu}`);
    setIsSearchFocused(false);
  };

  const handleDateSelect = (newCheckIn: Date | null, newCheckOut: Date | null) => {
    setCheckIn(newCheckIn);
    setCheckOut(newCheckOut);
  };

  const handleGuestChange = (newGuests: GuestCount) => {
    setGuests(newGuests);
  };

  const guestSummary = formatGuestSummary(guests);

  const formatDateDisplay = () => {
    if (!checkIn && !checkOut) return null;
    const formatDate = (date: Date) => {
      const month = date.toLocaleString('en-US', { month: 'short' });
      const day = date.getDate();
      return `${month} ${day}`;
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
      {/* Header with Logo, Search Bar, and Actions */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-[hsl(var(--snug-border))]">
        <div className="flex h-16 items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/images/logo/logo_hellosnug.svg"
              alt="hello.snug."
              width={140}
              height={28}
              className="h-7 w-auto"
              priority
            />
          </Link>

          {/* Center Search Bar */}
          <div className="flex-1 flex justify-center px-8">
            <div ref={searchBarRef} className="relative max-w-[500px] w-full">
              <div
                className={`flex items-center gap-4 px-4 py-2 border rounded-full bg-white shadow-sm w-full transition-all ${
                  isSearchFocused
                    ? 'border-[hsl(var(--snug-orange))] shadow-md'
                    : 'border-[hsl(var(--snug-border))]'
                }`}
              >
                <div
                  className="flex items-center gap-2 flex-1 border-r border-[hsl(var(--snug-border))] pr-4 cursor-pointer"
                  onClick={() => {
                    setIsSearchFocused(true);
                    setIsDateFocused(false);
                    setIsGuestFocused(false);
                  }}
                >
                  <MapPin
                    className={`w-4 h-4 ${isSearchFocused ? 'text-[hsl(var(--snug-orange))]' : 'text-[hsl(var(--snug-gray))]'}`}
                  />
                  <input
                    type="text"
                    value={locationValue}
                    onChange={(e) => setLocationValue(e.target.value)}
                    onFocus={() => {
                      setIsSearchFocused(true);
                      setIsDateFocused(false);
                      setIsGuestFocused(false);
                    }}
                    placeholder="Find your snug stay"
                    className="text-sm text-[hsl(var(--snug-text-primary))] placeholder:text-[hsl(var(--snug-placeholder))] bg-transparent outline-none w-full"
                  />
                </div>
                <div
                  className="flex items-center gap-2 border-r border-[hsl(var(--snug-border))] pr-4 cursor-pointer"
                  onClick={() => {
                    setIsDateFocused(!isDateFocused);
                    setIsSearchFocused(false);
                    setIsGuestFocused(false);
                  }}
                >
                  <Calendar
                    className={`w-4 h-4 ${isDateFocused ? 'text-[hsl(var(--snug-orange))]' : 'text-[hsl(var(--snug-gray))]'}`}
                  />
                  <span
                    className={`text-sm whitespace-nowrap ${formatDateDisplay() ? 'text-[hsl(var(--snug-text-primary))]' : 'text-[hsl(var(--snug-placeholder))]'}`}
                  >
                    {formatDateDisplay() || 'Stay Dates'}
                  </span>
                </div>
                <div
                  className="flex items-center gap-2 pr-2 cursor-pointer"
                  onClick={() => {
                    setIsGuestFocused(!isGuestFocused);
                    setIsSearchFocused(false);
                    setIsDateFocused(false);
                  }}
                >
                  <Users
                    className={`w-4 h-4 ${isGuestFocused ? 'text-[hsl(var(--snug-orange))]' : 'text-[hsl(var(--snug-gray))]'}`}
                  />
                  <span
                    className={`text-sm whitespace-nowrap ${guestSummary ? 'text-[hsl(var(--snug-text-primary))]' : 'text-[hsl(var(--snug-placeholder))]'}`}
                  >
                    {guestSummary || 'Guests'}
                  </span>
                </div>
                <button
                  type="button"
                  className="w-8 h-8 rounded-full bg-[hsl(var(--snug-orange))] flex items-center justify-center hover:opacity-90 transition-opacity flex-shrink-0"
                >
                  <Search className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Popular Searches Dropdown */}
              <div
                className={`absolute top-full left-0 right-0 mt-2 bg-white border border-[hsl(var(--snug-border))] rounded-2xl shadow-lg z-50 overflow-hidden transition-all duration-200 ${
                  isSearchFocused
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 -translate-y-2 pointer-events-none'
                }`}
              >
                <div className="p-4">
                  <p className="text-sm font-semibold text-[hsl(var(--snug-text-primary))] mb-3">
                    Popular Searches
                  </p>
                  <div className="space-y-1">
                    {popularLocations.map((location) => (
                      <button
                        key={location.dong}
                        type="button"
                        onClick={() => handleLocationSelect(location.dong, location.gu)}
                        className="w-full text-left py-2 px-2 text-sm text-[hsl(var(--snug-text-primary))] hover:bg-[hsl(var(--snug-light-gray))] rounded-lg transition-colors"
                      >
                        {location.dong}, {location.gu}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Date Picker Dropdown */}
              <div
                ref={datePickerRef}
                className={`absolute top-full left-0 right-0 mt-2 bg-white border border-[hsl(var(--snug-border))] rounded-2xl shadow-lg z-50 overflow-hidden transition-all duration-200 ${
                  isDateFocused
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 -translate-y-2 pointer-events-none'
                }`}
              >
                <div className="p-4">
                  <DatePicker
                    checkIn={checkIn}
                    checkOut={checkOut}
                    onDateSelect={handleDateSelect}
                  />
                </div>
              </div>

              {/* Guest Picker Dropdown */}
              <div
                ref={guestPickerRef}
                className={`absolute top-full left-0 right-0 mt-2 bg-white border border-[hsl(var(--snug-border))] rounded-2xl shadow-lg z-50 overflow-hidden transition-all duration-200 ${
                  isGuestFocused
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 -translate-y-2 pointer-events-none'
                }`}
              >
                <div className="p-4">
                  <GuestPicker guests={guests} onGuestChange={handleGuestChange} />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <Link
              href="/host"
              className="flex px-4 py-2 text-xs font-normal text-[hsl(var(--snug-brown))] border border-[hsl(var(--snug-brown))] rounded-full hover:bg-[hsl(var(--snug-brown))]/5 transition-colors whitespace-nowrap"
            >
              {tHome('hostMode')}
            </Link>
            <button
              type="button"
              className="w-8 h-8 rounded-full bg-[hsl(var(--snug-brown))] flex items-center justify-center hover:opacity-90 transition-opacity"
              aria-label="My Page"
            >
              <User className="w-3.5 h-3.5 text-white" />
            </button>
            <button
              type="button"
              className="w-8 h-8 rounded-full bg-[hsl(var(--snug-orange))] flex items-center justify-center hover:opacity-90 transition-opacity"
              aria-label="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-white" />
            </button>
            <button
              type="button"
              className="w-8 h-8 rounded-full bg-[hsl(var(--snug-orange))] flex items-center justify-center hover:opacity-90 transition-opacity"
              aria-label="Messages"
            >
              <MessageCircle className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left Side - Room List */}
        <div className="w-[480px] flex-shrink-0 border-r border-[hsl(var(--snug-border))] h-[calc(100vh-64px)] overflow-y-auto scrollbar-minimal">
          <div className="px-4">
            {/* Filter Bar */}
            <FilterBar currentView={view} onViewChange={setView} />

            {/* Results Header */}
            <div className="flex items-center justify-between py-3">
              <p className="text-sm text-[hsl(var(--snug-gray))]">
                {t('resultsCount', { count: roomCount, location: searchLocation })}
              </p>
              <button
                type="button"
                className="flex items-center gap-1 text-sm font-medium text-[hsl(var(--snug-text-primary))]"
              >
                {t('sort.recommended')}
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Room List / Grid */}
            <div className={view === 'grid' ? 'grid grid-cols-2 gap-4 pb-6' : 'space-y-0 pb-6'}>
              {MOCK_ROOMS.map((room) => (
                <RoomCard key={room.id} room={room} viewMode={view} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Map */}
        <div className="flex-1 sticky top-16 h-[calc(100vh-64px)]">
          <SearchMap rooms={MOCK_ROOMS} />
        </div>
      </div>
    </div>
  );
}
