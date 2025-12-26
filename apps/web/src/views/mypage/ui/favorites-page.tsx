'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, ChevronLeft, ChevronRight, Heart, Home, Users, ImageIcon } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { Header } from '@/widgets/header';
import { MypageSidebar } from './mypage-sidebar';

type TabType = 'favorite' | 'recent';

interface FavoriteItem {
  id: string;
  location: string;
  rooms: number;
  bathrooms: number;
  beds: number;
  guests: number;
  originalPrice?: number;
  price: number;
  nights: number;
  roomTypes: string[];
  isFavorite: boolean;
}

export function FavoritesPage() {
  const t = useTranslations('mypage.favorites');
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('favorite');

  // Mock data
  const favoriteItems: FavoriteItem[] = [
    {
      id: '1',
      location: 'Nonhyeon-dong, Gangnam-gu',
      rooms: 1,
      bathrooms: 1,
      beds: 2,
      guests: 2,
      originalPrice: 200,
      price: 160,
      nights: 2,
      roomTypes: ['Shared Room', 'Apartment'],
      isFavorite: true,
    },
    {
      id: '2',
      location: 'Cheongdam-dong, Gangnam-gu',
      rooms: 1,
      bathrooms: 1,
      beds: 2,
      guests: 2,
      originalPrice: 200,
      price: 160,
      nights: 2,
      roomTypes: ['House', 'Dormitory'],
      isFavorite: true,
    },
  ];

  const recentItems: FavoriteItem[] = [
    {
      id: '3',
      location: 'Nonhyeon-dong, Gangnam-gu',
      rooms: 1,
      bathrooms: 1,
      beds: 2,
      guests: 2,
      originalPrice: 200,
      price: 160,
      nights: 2,
      roomTypes: ['Shared Room', 'Apartment'],
      isFavorite: false,
    },
    {
      id: '4',
      location: 'Cheongdam-dong, Gangnam-gu',
      rooms: 1,
      bathrooms: 1,
      beds: 2,
      guests: 2,
      originalPrice: 200,
      price: 160,
      nights: 2,
      roomTypes: ['House', 'Dormitory'],
      isFavorite: false,
    },
  ];

  const getItems = () => {
    switch (activeTab) {
      case 'favorite':
        return favoriteItems;
      case 'recent':
        return recentItems;
      default:
        return [];
    }
  };

  const items = getItems();

  // For demo, set to false to show items
  const showEmptyState = false;
  const displayItems = showEmptyState ? [] : items;

  const FavoriteCard = ({
    item,
    showFilledHeart,
  }: {
    item: FavoriteItem;
    showFilledHeart: boolean;
  }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const totalImages = 20;

    const nextImage = (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentImageIndex((prev) => (prev + 1) % totalImages);
    };

    const prevImage = (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
    };

    return (
      <div
        className="cursor-pointer active:scale-[0.99] transition-transform"
        onClick={() => router.push(`/room/${item.id}`)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className="relative rounded-3xl overflow-hidden aspect-[4/3]">
          {/* Placeholder Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--snug-light-gray))] to-[hsl(var(--snug-border))] flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-[hsl(var(--snug-gray))]/30" />
          </div>

          {/* Room Type Badges */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            {item.roomTypes.map((type, index) => (
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

          {/* Heart Icon */}
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center"
          >
            <Heart
              className={`w-6 h-6 ${showFilledHeart ? 'fill-red-500 text-red-500' : 'text-white'}`}
              strokeWidth={2}
            />
          </button>

          {/* Navigation Arrows - Desktop only on hover */}
          {isHovered && (
            <>
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
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/60 text-white text-xs rounded-full">
            {currentImageIndex + 1} / {totalImages}
          </div>
        </div>

        {/* Info */}
        <div className="mt-3 px-1">
          <h3 className="text-sm font-semibold text-[hsl(var(--snug-text-primary))] truncate">
            {item.location}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-[hsl(var(--snug-gray))]">
            <Home className="w-4 h-4" />
            <span>
              {item.rooms} Rooms · {item.bathrooms} Bathroom · {item.beds} Bed
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-[hsl(var(--snug-gray))]">
            <Users className="w-4 h-4" />
            <span>{item.guests} Guests</span>
          </div>
          <div className="flex items-baseline gap-1.5 mt-2">
            {item.originalPrice && (
              <span className="text-sm text-[hsl(var(--snug-gray))] line-through">
                ${item.originalPrice}
              </span>
            )}
            <span className="text-base font-bold text-[hsl(var(--snug-orange))]">
              ${item.price}
            </span>
            <span className="text-xs text-[hsl(var(--snug-gray))]">for {item.nights} nights</span>
          </div>
        </div>
      </div>
    );
  };

  const EmptyState = () => {
    const getEmptyContent = () => {
      switch (activeTab) {
        case 'favorite':
          return {
            title: t('noFavorites'),
            description: t('noFavoritesDesc'),
          };
        case 'recent':
          return {
            title: t('noRecent'),
            description: t('noRecentDesc'),
          };
        default:
          return { title: '', description: '' };
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
        <button
          type="button"
          onClick={() => router.push('/')}
          className="px-8 py-3 bg-[hsl(var(--snug-orange))] text-white text-sm font-medium rounded-full hover:opacity-90 transition-opacity"
        >
          {t('browseStays')}
        </button>
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
                  onClick={() => setActiveTab('favorite')}
                  className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${
                    activeTab === 'favorite'
                      ? 'text-[hsl(var(--snug-text-primary))] border-[hsl(var(--snug-orange))]'
                      : 'text-[hsl(var(--snug-gray))] border-[hsl(var(--snug-border))]'
                  }`}
                >
                  {t('favoriteTab')}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('recent')}
                  className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${
                    activeTab === 'recent'
                      ? 'text-[hsl(var(--snug-text-primary))] border-[hsl(var(--snug-orange))]'
                      : 'text-[hsl(var(--snug-gray))] border-[hsl(var(--snug-border))]'
                  }`}
                >
                  {t('recentTab')}
                </button>
              </div>
            </div>

            {/* Content */}
            {displayItems.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-6">
                {displayItems.map((item) => (
                  <FavoriteCard
                    key={item.id}
                    item={item}
                    showFilledHeart={activeTab === 'favorite'}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
