'use client';

import { useState, useEffect, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { ArrowLeft, Heart, Users, ImageIcon, Loader2 } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { Header } from '@/widgets/header';
import { MypageSidebar } from './mypage-sidebar';
import { useCurrencySafe } from '@/shared/providers';
import {
  getFavorites,
  getRecentlyViewed,
  removeFavorite,
  removeFromRecentlyViewed,
  type FavoriteItem as ApiFavoriteItem,
} from '@/shared/api/favorites';

type TabType = 'favorite' | 'recent';

interface FavoriteItem {
  id: string;
  roomName: string;
  location: string;
  address: string;
  capacity: number;
  basePrice: number;
  accommodationType: string;
  thumbnailUrl: string | null;
  isFavorite: boolean;
}

export function FavoritesPage() {
  const t = useTranslations('mypage.favorites');
  const router = useRouter();
  const { format } = useCurrencySafe();
  const [activeTab, setActiveTab] = useState<TabType>('favorite');
  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([]);
  const [recentItems, setRecentItems] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // API 데이터를 FavoriteItem 형식으로 변환
  const mapApiToItem = (item: ApiFavoriteItem, isFavorite: boolean): FavoriteItem => ({
    id: item.id,
    roomName: item.roomName,
    location: item.sigungu
      ? `${item.bname || ''}, ${item.sigungu}`.replace(/^, /, '')
      : item.address,
    address: item.address,
    capacity: item.capacity,
    basePrice: item.basePrice,
    accommodationType: item.accommodationType,
    thumbnailUrl: item.thumbnailUrl,
    isFavorite,
  });

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [favorites, recent] = await Promise.all([getFavorites(), getRecentlyViewed()]);

        setFavoriteItems(favorites.map((item) => mapApiToItem(item, true)));
        setRecentItems(recent.map((item) => mapApiToItem(item, false)));
      } catch (error) {
        console.error('Failed to load favorites:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // 찜 삭제 핸들러
  const handleRemoveFavorite = (id: string) => {
    startTransition(async () => {
      try {
        await removeFavorite(id);
        setFavoriteItems((prev) => prev.filter((item) => item.id !== id));
      } catch (error) {
        console.error('Failed to remove favorite:', error);
      }
    });
  };

  // 최근 본 숙소 삭제 핸들러
  const handleRemoveRecent = (id: string) => {
    startTransition(async () => {
      try {
        await removeFromRecentlyViewed(id);
        setRecentItems((prev) => prev.filter((item) => item.id !== id));
      } catch (error) {
        console.error('Failed to remove recent:', error);
      }
    });
  };

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
  const displayItems = items;

  const FavoriteCard = ({
    item,
    showFilledHeart,
    onRemove,
  }: {
    item: FavoriteItem;
    showFilledHeart: boolean;
    onRemove: (id: string) => void;
  }) => {
    const [_isHovered, setIsHovered] = useState(false);

    const handleHeartClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onRemove(item.id);
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
          {/* Image or Placeholder */}
          {item.thumbnailUrl ? (
            <Image
              src={item.thumbnailUrl}
              alt={item.roomName}
              fill
              sizes="(max-width: 768px) 100vw, 560px"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--snug-light-gray))] to-[hsl(var(--snug-border))] flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-[hsl(var(--snug-gray))]/30" />
            </div>
          )}

          {/* Room Type Badge */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-[#FDEEE5] text-[hsl(var(--snug-orange))]">
              {item.accommodationType}
            </span>
          </div>

          {/* Heart Icon */}
          <button
            type="button"
            onClick={handleHeartClick}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center hover:scale-110 transition-transform"
            disabled={isPending}
          >
            <Heart
              className={`w-6 h-6 ${showFilledHeart ? 'fill-red-500 text-red-500' : 'text-white drop-shadow-md'}`}
              strokeWidth={2}
            />
          </button>
        </div>

        {/* Info */}
        <div className="mt-3 px-1">
          <h3 className="text-sm font-semibold text-[hsl(var(--snug-text-primary))] truncate">
            {item.location}
          </h3>
          <p className="text-xs text-[hsl(var(--snug-gray))] truncate mt-0.5">{item.roomName}</p>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-[hsl(var(--snug-gray))]">
            <Users className="w-4 h-4" />
            <span>
              {item.capacity} {t('guests')}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-base font-bold text-[hsl(var(--snug-orange))]">
              {format(item.basePrice)}
            </span>
            <span className="text-xs text-[hsl(var(--snug-gray))]">/ {t('month')}</span>
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
            {isLoading ? (
              <div className="py-16 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--snug-orange))]" />
              </div>
            ) : displayItems.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-6">
                {displayItems.map((item) => (
                  <FavoriteCard
                    key={item.id}
                    item={item}
                    showFilledHeart={activeTab === 'favorite'}
                    onRemove={activeTab === 'favorite' ? handleRemoveFavorite : handleRemoveRecent}
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
