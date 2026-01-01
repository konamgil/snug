'use client';

import { useState, useTransition, useCallback } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Bath, BedDouble, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { HeartIcon, HotelIcon, UserIcon } from '@/shared/ui/icons';
import { useCurrencySafe, useNavigationLoading } from '@/shared/providers';
import { useAuthStore } from '@/shared/stores';
import { useRouter } from '@/i18n/navigation';
import { toggleFavorite } from '@/shared/api/favorites';
import { getAccommodationPublic } from '@/shared/api/accommodation/actions';
import { accommodationKeys } from '@/shared/api/accommodation/hooks';

export interface Room {
  id: string;
  title: string;
  location: string;
  district: string;
  rooms: number;
  bathrooms: number;
  beds: number;
  guests: number;
  originalPrice?: number;
  price: number;
  nights: number;
  tags: { label: string; color: 'orange' | 'purple' | 'blue' | 'green' }[];
  imageUrl: string;
  imageCount: number;
  isFavorite?: boolean;
  lat: number;
  lng: number;
}

interface RoomCardProps {
  room: Room;
  viewMode?: 'list' | 'grid' | 'mobile';
  onFavoriteToggle?: (id: string) => void;
  index?: number;
}

// Blur placeholder for smooth image loading
const BLUR_DATA_URL =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBEQCEPwC/AB//2Q==';

// First tag - soft background
const tagFirstColors = {
  orange: 'bg-[#FFF5E6] text-[hsl(var(--snug-orange))] font-bold',
  purple: 'bg-[#F9A8D4] text-white font-bold',
  blue: 'bg-blue-100 text-blue-500 font-bold',
  green: 'bg-green-100 text-green-500 font-bold',
};

// Second+ tags - solid background with white text
const tagSecondColors = {
  orange: 'bg-[#FFF5E6] text-[hsl(var(--snug-orange))] font-bold',
  purple: 'bg-[#F9A8D4] text-white font-bold',
  blue: 'bg-blue-400 text-white font-bold',
  green: 'bg-green-400 text-white font-bold',
};

export function RoomCard({ room, viewMode = 'list', onFavoriteToggle, index }: RoomCardProps) {
  // Priority loading for first 2 images (above the fold)
  const isPriority = index !== undefined && index < 2;
  const t = useTranslations('rooms');
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { format } = useCurrencySafe();
  const { navigateWithLoading } = useNavigationLoading();
  const user = useAuthStore((state) => state.user);
  const [isFavorite, setIsFavorite] = useState(room.isFavorite || false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [_isPending, startTransition] = useTransition();
  const totalImages = room.imageCount || 1;

  // Prefetch room data on hover for faster navigation
  const handlePrefetch = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: accommodationKeys.detail(room.id),
      queryFn: () => getAccommodationPublic(room.id),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  }, [queryClient, room.id]);

  // Build room detail URL with search params (checkIn, checkOut, guests)
  const buildRoomDetailUrl = useCallback(() => {
    const params = new URLSearchParams();
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const guests = searchParams.get('guests');
    const adults = searchParams.get('adults');
    const children = searchParams.get('children');
    const infants = searchParams.get('infants');

    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests) params.set('guests', guests);
    if (adults) params.set('adults', adults);
    if (children) params.set('children', children);
    if (infants) params.set('infants', infants);

    const queryString = params.toString();
    return `/room/${room.id}${queryString ? `?${queryString}` : ''}`;
  }, [searchParams, room.id]);

  // 카드 클릭 시 데이터 로드 후 페이지 이동
  const handleCardClick = useCallback(() => {
    const roomDetailUrl = buildRoomDetailUrl();

    navigateWithLoading(
      async () => {
        // 데이터가 캐시에 없으면 로드
        await queryClient.fetchQuery({
          queryKey: accommodationKeys.detail(room.id),
          queryFn: () => getAccommodationPublic(room.id),
          staleTime: 5 * 60 * 1000,
        });
      },
      () => router.push(roomDetailUrl),
    );
  }, [buildRoomDetailUrl, navigateWithLoading, queryClient, room.id, router]);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    // 로그인 안 된 경우 로그인 페이지로 이동
    if (!user) {
      router.push('/login');
      return;
    }

    // Optimistic update
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);
    onFavoriteToggle?.(room.id);

    // API 호출
    startTransition(async () => {
      try {
        const result = await toggleFavorite(room.id);
        // API 결과와 로컬 상태 동기화
        setIsFavorite(result.isFavorite);
      } catch (error) {
        // 실패 시 원래 상태로 롤백
        console.error('Failed to toggle favorite:', error);
        setIsFavorite(!newFavoriteState);
      }
    });
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : totalImages - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev < totalImages - 1 ? prev + 1 : 0));
  };

  // Mobile View - Full width card with large image
  if (viewMode === 'mobile') {
    return (
      <div
        onClick={handleCardClick}
        onMouseEnter={handlePrefetch}
        onTouchStart={handlePrefetch}
        className="group cursor-pointer block active:scale-[0.98] active:opacity-90 transition-transform duration-150"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
      >
        {/* Image Container - Larger aspect ratio for mobile */}
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
          {/* Image or Placeholder */}
          {room.imageUrl && !room.imageUrl.includes('placeholder') ? (
            <Image
              src={room.imageUrl}
              alt={room.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority={isPriority}
              loading={isPriority ? undefined : 'lazy'}
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--snug-light-gray))] to-[hsl(var(--snug-border))] flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-[hsl(var(--snug-gray))]/30" />
            </div>
          )}

          {/* Tags - Top Left */}
          <div className="absolute top-3 left-3 flex gap-2">
            {room.tags.map((tag, index) => (
              <span
                key={index}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full ${
                  index === 0 ? tagFirstColors[tag.color] : tagSecondColors[tag.color]
                }`}
              >
                {tag.label}
              </span>
            ))}
          </div>

          {/* Favorite Button - Top Right */}
          <button
            type="button"
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 p-2"
          >
            <HeartIcon
              className={`w-6 h-6 ${isFavorite ? 'text-red-500' : 'text-white drop-shadow-md'}`}
              filled={isFavorite}
            />
          </button>

          {/* Image Counter - Bottom Right */}
          <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/50 rounded-full text-white text-xs">
            {currentImageIndex + 1} / {totalImages}
          </div>
        </div>

        {/* Content */}
        <div className="pt-2.5">
          {/* Location */}
          <h3 className="text-[15px] font-semibold text-[hsl(var(--snug-text-primary))] mb-1.5">
            {room.location}, {room.district}
          </h3>

          {/* Room Info */}
          <div className="flex items-center gap-1.5 text-[13px] text-[hsl(var(--snug-gray))] mb-0.5">
            <HotelIcon className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              {t('roomCount', { count: room.rooms })} ·{' '}
              {t('bathroomCount', { count: room.bathrooms })} ·{' '}
              {t('bedCount', { count: room.beds })}
            </span>
          </div>

          {/* Guests */}
          <div className="flex items-center gap-1.5 text-[13px] text-[hsl(var(--snug-gray))] mb-2.5">
            <UserIcon className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{t('guestCount', { count: room.guests })}</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1.5">
            {room.originalPrice && (
              <span className="text-[13px] text-[hsl(var(--snug-gray))] line-through">
                {format(room.originalPrice)}
              </span>
            )}
            <span className="text-[17px] font-bold text-[hsl(var(--snug-orange))]">
              {format(room.price)}
            </span>
            <span className="text-[13px] text-[hsl(var(--snug-gray))]">
              {t('forNights', { count: room.nights })}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Grid View
  if (viewMode === 'grid') {
    return (
      <div
        onClick={handleCardClick}
        onMouseEnter={handlePrefetch}
        onTouchStart={handlePrefetch}
        className="group cursor-pointer block active:scale-[0.98] active:opacity-90 transition-transform duration-150"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
          {/* Image or Placeholder */}
          {room.imageUrl && !room.imageUrl.includes('placeholder') ? (
            <Image
              src={room.imageUrl}
              alt={room.title}
              fill
              sizes="(max-width: 1024px) 50vw, 33vw"
              className="object-cover"
              priority={isPriority}
              loading={isPriority ? undefined : 'lazy'}
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--snug-light-gray))] to-[hsl(var(--snug-border))] flex items-center justify-center">
              <ImageIcon className="w-10 h-10 text-[hsl(var(--snug-gray))]/30" />
            </div>
          )}

          {/* Tags - Top Left */}
          <div className="absolute top-2.5 left-2.5 flex gap-1.5">
            {room.tags.map((tag, tagIndex) => (
              <span
                key={tagIndex}
                className={`px-2.5 py-1 text-[10px] font-semibold rounded-full ${
                  tagIndex === 0 ? tagFirstColors[tag.color] : tagSecondColors[tag.color]
                }`}
              >
                {tag.label}
              </span>
            ))}
          </div>

          {/* Favorite Button - Top Right */}
          <button
            type="button"
            onClick={handleFavoriteClick}
            className="absolute top-2.5 right-2.5 p-1.5 bg-white/90 rounded-full hover:bg-white transition-colors"
          >
            <HeartIcon
              className={`w-4 h-4 ${isFavorite ? 'text-red-500' : 'text-gray-400'}`}
              filled={isFavorite}
            />
          </button>

          {/* Image Navigation Arrows */}
          <button
            type="button"
            onClick={handlePrevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <button
            type="button"
            onClick={handleNextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>

          {/* Image Counter - Bottom Right */}
          <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-black/50 rounded text-white text-[11px]">
            {currentImageIndex + 1} / {totalImages}
          </div>
        </div>

        {/* Content */}
        <div className="pt-2.5">
          {/* Location */}
          <h3 className="text-sm font-semibold text-[hsl(var(--snug-text-primary))] mb-1">
            {room.location}, {room.district}
          </h3>

          {/* Room Info */}
          <div className="flex items-center gap-1 text-xs text-[hsl(var(--snug-gray))] mb-0.5">
            <HotelIcon className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              {t('roomCount', { count: room.rooms })} ·{' '}
              {t('bathroomCount', { count: room.bathrooms })} ·{' '}
              {t('bedCount', { count: room.beds })}
            </span>
          </div>

          {/* Guests */}
          <div className="flex items-center gap-1 text-xs text-[hsl(var(--snug-gray))] mb-2">
            <UserIcon className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{t('guestCount', { count: room.guests })}</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1.5">
            {room.originalPrice && (
              <span className="text-sm text-[hsl(var(--snug-gray))] line-through">
                {format(room.originalPrice)}
              </span>
            )}
            <span className="text-base font-bold text-[hsl(var(--snug-orange))]">
              {format(room.price)}
            </span>
            <span className="text-xs text-[hsl(var(--snug-gray))]">
              {t('forNights', { count: room.nights })}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // List View (default)
  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={handlePrefetch}
      onTouchStart={handlePrefetch}
      className="flex gap-3 py-3 hover:bg-[hsl(var(--snug-light-gray))]/50 active:scale-[0.99] active:opacity-90 transition-all duration-150 cursor-pointer"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
    >
      {/* Image */}
      <div className="relative w-[120px] h-[90px] flex-shrink-0 rounded-lg overflow-hidden">
        {/* Image or Placeholder */}
        {room.imageUrl && !room.imageUrl.includes('placeholder') ? (
          <Image
            src={room.imageUrl}
            alt={room.title}
            fill
            sizes="120px"
            className="object-cover"
            priority={isPriority}
            loading={isPriority ? undefined : 'lazy'}
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--snug-light-gray))] to-[hsl(var(--snug-border))] flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-[hsl(var(--snug-gray))]/30" />
          </div>
        )}
        <button
          type="button"
          onClick={handleFavoriteClick}
          className="absolute top-1.5 left-1.5 p-1 bg-white/80 rounded-full hover:bg-white transition-colors"
        >
          <HeartIcon
            className={`w-3.5 h-3.5 ${isFavorite ? 'text-red-500' : 'text-gray-500'}`}
            filled={isFavorite}
          />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Location & Tags Row */}
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <h3 className="text-sm font-semibold text-[hsl(var(--snug-text-primary))] truncate">
            {room.location}, {room.district}
          </h3>
          <div className="flex flex-wrap gap-1 flex-shrink-0">
            {room.tags.map((tag, index) => (
              <span
                key={index}
                className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                  index === 0 ? tagFirstColors[tag.color] : tagSecondColors[tag.color]
                }`}
              >
                {tag.label}
              </span>
            ))}
          </div>
        </div>

        {/* Room Info */}
        <div className="flex items-center gap-1.5 text-[11px] text-[hsl(var(--snug-gray))] mb-0.5">
          <span className="flex items-center gap-0.5">
            <HotelIcon className="w-3 h-3" />
            {t('roomsShort', { count: room.rooms })}
          </span>
          <span>·</span>
          <span className="flex items-center gap-0.5">
            <Bath className="w-3 h-3" />
            {t('bathroomsShort', { count: room.bathrooms })}
          </span>
          <span>·</span>
          <span className="flex items-center gap-0.5">
            <BedDouble className="w-3 h-3" />
            {t('bedsShort', { count: room.beds })}
          </span>
          <span>·</span>
          <span className="flex items-center gap-0.5">
            <UserIcon className="w-3 h-3" />
            {room.guests}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 mt-1">
          {room.originalPrice && (
            <span className="text-xs text-[hsl(var(--snug-gray))] line-through">
              {format(room.originalPrice)}
            </span>
          )}
          <span className="text-base font-bold text-[hsl(var(--snug-orange))]">
            {format(room.price)}
          </span>
          <span className="text-xs text-[hsl(var(--snug-gray))]">
            {t('perNights', { count: room.nights })}
          </span>
        </div>
      </div>
    </div>
  );
}
