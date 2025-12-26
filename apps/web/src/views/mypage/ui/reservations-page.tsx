'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, ChevronLeft, ChevronRight, Heart, Calendar, ImageIcon } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { Header } from '@/widgets/header';
import { MypageSidebar } from './mypage-sidebar';

type TabType = 'upcoming' | 'past' | 'canceled';

interface Reservation {
  id: string;
  location: string;
  startDate: string;
  endDate: string;
  images: string[];
  status: 'pending' | 'confirmed' | 'completed' | 'canceled';
  daysUntilCheckIn?: number;
  roomTypes?: string[];
  isFavorite?: boolean;
}

export function ReservationsPage() {
  const t = useTranslations('mypage.reservations');
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');

  // Mock data
  const upcomingReservations: Reservation[] = [
    {
      id: '1',
      location: 'Nonhyeon-dong, Gangnam-gu',
      startDate: 'Aug 1, 25',
      endDate: 'Aug 31, 25',
      images: ['/images/room-placeholder.jpg'],
      status: 'pending',
    },
    {
      id: '2',
      location: 'Cheongdam-dong, Gangnam-gu',
      startDate: 'Aug 1, 25',
      endDate: 'Aug 31, 25',
      images: ['/images/room-placeholder.jpg'],
      status: 'confirmed',
      daysUntilCheckIn: 3,
    },
    {
      id: '3',
      location: 'Apgujeong-dong, Gangnam-gu',
      startDate: 'Aug 1, 25',
      endDate: 'Aug 31, 25',
      images: ['/images/room-placeholder.jpg'],
      status: 'confirmed',
      daysUntilCheckIn: 3,
    },
  ];

  const pastReservations: Reservation[] = [
    {
      id: '4',
      location: 'Nonhyeon-dong, Gangnam-gu',
      startDate: 'Aug 1, 25',
      endDate: 'Aug 31, 25',
      images: ['/images/room-placeholder.jpg'],
      status: 'completed',
      roomTypes: ['Shared Room', 'Apartment'],
      isFavorite: false,
    },
    {
      id: '5',
      location: 'Bangbae-dong, Seocho-gu',
      startDate: 'Aug 1, 25',
      endDate: 'Aug 31, 25',
      images: ['/images/room-placeholder.jpg'],
      status: 'completed',
      roomTypes: ['House', 'Hotel'],
      isFavorite: false,
    },
    {
      id: '6',
      location: 'Seocho-dong, Seocho-gu',
      startDate: 'Aug 1, 25',
      endDate: 'Aug 31, 25',
      images: ['/images/room-placeholder.jpg'],
      status: 'completed',
      roomTypes: ['Shared Room', 'Apartment'],
      isFavorite: false,
    },
  ];

  const canceledReservations: Reservation[] = [
    {
      id: '7',
      location: 'Nonhyeon-dong, Gangnam-gu',
      startDate: 'Aug 1, 25',
      endDate: 'Aug 31, 25',
      images: ['/images/room-placeholder.jpg'],
      status: 'canceled',
      isFavorite: false,
    },
    {
      id: '8',
      location: 'Nonhyeon-dong, Gangnam-gu',
      startDate: 'Aug 1, 25',
      endDate: 'Aug 31, 25',
      images: ['/images/room-placeholder.jpg'],
      status: 'canceled',
      isFavorite: false,
    },
    {
      id: '9',
      location: 'Nonhyeon-dong, Gangnam-gu',
      startDate: 'Aug 1, 25',
      endDate: 'Aug 31, 25',
      images: ['/images/room-placeholder.jpg'],
      status: 'canceled',
      isFavorite: false,
    },
    {
      id: '10',
      location: 'Nonhyeon-dong, Gangnam-gu',
      startDate: 'Aug 1, 25',
      endDate: 'Aug 31, 25',
      images: ['/images/room-placeholder.jpg'],
      status: 'canceled',
      isFavorite: false,
    },
  ];

  const getReservations = () => {
    switch (activeTab) {
      case 'upcoming':
        return upcomingReservations;
      case 'past':
        return pastReservations;
      case 'canceled':
        return canceledReservations;
      default:
        return [];
    }
  };

  const reservations = getReservations();

  // For demo, let's show empty state by setting this to true
  const showEmptyState = false;
  const displayReservations = showEmptyState ? [] : reservations;

  const ReservationCard = ({ reservation }: { reservation: Reservation }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const totalImages = 20; // Mock total

    const nextImage = (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentImageIndex((prev) => (prev + 1) % totalImages);
    };

    const prevImage = (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
    };

    const getBadge = () => {
      if (reservation.status === 'pending') {
        return (
          <span className="absolute top-3 left-3 px-3 py-1.5 bg-white text-[hsl(var(--snug-orange))] text-xs font-semibold rounded-full">
            {t('pendingConfirmation')}
          </span>
        );
      }
      if (reservation.status === 'canceled') {
        return (
          <span className="absolute top-3 left-3 px-3 py-1.5 bg-white text-[#888888] text-xs font-semibold rounded-full">
            {t('canceled')}
          </span>
        );
      }
      if (reservation.daysUntilCheckIn !== undefined && reservation.daysUntilCheckIn > 0) {
        return (
          <span className="absolute top-3 left-3 px-3 py-1.5 bg-white text-[hsl(var(--snug-orange))] text-xs font-semibold rounded-full">
            D-{reservation.daysUntilCheckIn}
          </span>
        );
      }
      return null;
    };

    const getRoomTypeBadges = () => {
      if (!reservation.roomTypes || reservation.roomTypes.length === 0) return null;
      return (
        <div className="absolute top-3 left-3 flex gap-1.5">
          {reservation.roomTypes.map((type, index) => (
            <span
              key={type}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full ${
                index === 0
                  ? 'bg-[#FDEEE5] text-[hsl(var(--snug-orange))]'
                  : 'bg-[#EF8BAC] text-white'
              }`}
            >
              {type}
            </span>
          ))}
        </div>
      );
    };

    const showRoomTypes = activeTab === 'past' && reservation.roomTypes;
    const showFavorite = activeTab === 'past' || activeTab === 'canceled';
    const isGrayed = activeTab === 'canceled';

    return (
      <div
        className="cursor-pointer active:scale-[0.99] transition-transform"
        onClick={() => router.push(`/mypage/reservations/${reservation.id}`)}
      >
        {/* Image Container */}
        <div className="relative rounded-3xl overflow-hidden aspect-[4/3]">
          {/* Placeholder Background */}
          <div
            className={`absolute inset-0 bg-gradient-to-br from-[hsl(var(--snug-light-gray))] to-[hsl(var(--snug-border))] flex items-center justify-center ${isGrayed ? 'opacity-70' : ''}`}
          >
            <ImageIcon className="w-12 h-12 text-[hsl(var(--snug-gray))]/30" />
          </div>

          {/* Navigation Arrows - Hidden on mobile */}
          <button
            type="button"
            onClick={prevImage}
            className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full items-center justify-center hover:bg-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <button
            type="button"
            onClick={nextImage}
            className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full items-center justify-center hover:bg-white transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>

          {/* Badge */}
          {showRoomTypes ? getRoomTypeBadges() : getBadge()}

          {/* Favorite Icon - Hidden on mobile */}
          {showFavorite && (
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="hidden md:flex absolute top-3 right-3 w-8 h-8 items-center justify-center"
            >
              <Heart
                className={`w-5 h-5 ${reservation.isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`}
                strokeWidth={2}
              />
            </button>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 text-white text-xs rounded">
            {currentImageIndex + 1} / {totalImages}
          </div>
        </div>

        {/* Info */}
        <div className="mt-3 px-1">
          <h3
            className={`text-sm font-semibold ${isGrayed ? 'text-[hsl(var(--snug-gray))]' : 'text-[hsl(var(--snug-text-primary))]'}`}
          >
            {reservation.location}
          </h3>
          <div className="flex items-center gap-1.5 mt-1">
            <Calendar className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
            <span
              className={`text-xs text-[hsl(var(--snug-gray))] ${isGrayed ? 'line-through' : ''}`}
            >
              {reservation.startDate} - {reservation.endDate}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const EmptyState = () => {
    const getEmptyContent = () => {
      switch (activeTab) {
        case 'upcoming':
          return {
            title: t('noCurrentStay'),
            description: t('noCurrentStayDesc'),
            showButton: true,
          };
        case 'past':
          return {
            title: t('noPastStays'),
            description: t('noPastStaysDesc'),
            showButton: false,
          };
        case 'canceled':
          return {
            title: t('noCanceledBookings'),
            description: t('noCanceledBookingsDesc'),
            showButton: false,
          };
        default:
          return { title: '', description: '', showButton: false };
      }
    };

    const content = getEmptyContent();

    return (
      <div className="py-16 text-center">
        <h3 className="text-base font-semibold text-[hsl(var(--snug-text-primary))] mb-2">
          {content.title}
        </h3>
        <p className="text-sm text-[hsl(var(--snug-gray))] mb-6 max-w-[300px] mx-auto">
          {content.description}
        </p>
        {content.showButton && (
          <button
            type="button"
            onClick={() => router.push('/')}
            className="px-8 py-3 bg-[hsl(var(--snug-orange))] text-white text-sm font-medium rounded-full hover:opacity-90 transition-opacity"
          >
            {t('browseStays')}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* PC Header with Logo */}
      <div className="hidden md:block">
        <Header showLogo />
      </div>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-5 py-4">
        <button type="button" onClick={() => router.back()} className="p-1" aria-label="Back">
          <ArrowLeft className="w-6 h-6 text-[hsl(var(--snug-text-primary))]" />
        </button>
        <div className="w-6" />
      </header>

      <div className="flex">
        {/* Sidebar - Desktop only */}
        <div className="hidden lg:block w-[280px] flex-shrink-0 px-6 py-8 border-r border-[hsl(var(--snug-border))]">
          <MypageSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex justify-center py-6 px-5 md:py-8 md:px-6">
          <div className="w-full max-w-[560px]">
            {/* Page Header */}
            <div className="mb-6 md:mb-8">
              <h1 className="text-lg md:text-xl font-bold text-[hsl(var(--snug-text-primary))] mb-1">
                {t('title')}
              </h1>
              <p className="text-sm text-[hsl(var(--snug-gray))]">{t('subtitle')}</p>
            </div>

            {/* Tabs */}
            <div className="mb-6 md:mb-8">
              <div className="flex">
                <button
                  type="button"
                  onClick={() => setActiveTab('upcoming')}
                  className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${
                    activeTab === 'upcoming'
                      ? 'text-[hsl(var(--snug-text-primary))] border-[hsl(var(--snug-orange))]'
                      : 'text-[hsl(var(--snug-gray))] border-[hsl(var(--snug-border))]'
                  }`}
                >
                  {t('upcomingStay')}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('past')}
                  className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${
                    activeTab === 'past'
                      ? 'text-[hsl(var(--snug-text-primary))] border-[hsl(var(--snug-orange))]'
                      : 'text-[hsl(var(--snug-gray))] border-[hsl(var(--snug-border))]'
                  }`}
                >
                  {t('pastStay')}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('canceled')}
                  className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${
                    activeTab === 'canceled'
                      ? 'text-[hsl(var(--snug-text-primary))] border-[hsl(var(--snug-orange))]'
                      : 'text-[hsl(var(--snug-gray))] border-[hsl(var(--snug-border))]'
                  }`}
                >
                  {t('canceledTab')}
                </button>
              </div>
            </div>

            {/* Content */}
            {displayReservations.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-6">
                {displayReservations.map((reservation) => (
                  <ReservationCard key={reservation.id} reservation={reservation} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
