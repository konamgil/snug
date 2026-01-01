'use client';

import { useState, useEffect, useCallback, memo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Heart, ChevronLeft, ChevronRight, ImageIcon, ArrowRight } from 'lucide-react';
import { LocationIcon } from '@/shared/ui/icons';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useEasterEgg } from '@/shared/lib/easter-egg-context';

// Types
interface RoomCardData {
  id: string;
  image: string;
  tags: { label: string; color: 'orange' | 'purple' }[];
  location: string;
  originalPrice?: number;
  price: number;
  nights: number;
  imageCount: number;
  currentImageIndex: number;
}

interface TourCardData {
  id: string;
  image: string;
  location: string;
  title: string;
  pricePerPerson: number;
}

interface RoomSlide {
  type: 'rooms';
  rooms: RoomCardData[];
}

interface TourSlide {
  type: 'tour';
  tour: TourCardData;
}

interface IllustrationSlide {
  type: 'illustration';
  image: string;
  captionKey: string;
}

// Banner slide data
interface BannerSlide {
  type: 'banner';
  image: string;
  badge: string;
  title: string;
  titleHighlight?: string;
  linkText: string;
  linkHref: string;
  caption: string;
  isHostBanner?: boolean;
}

type Slide = RoomSlide | TourSlide | IllustrationSlide | BannerSlide;

const mockSlides: Slide[] = [
  {
    type: 'banner',
    image: '/images/banner/Banner_Type01.png',
    badge: 'Welcome aboard',
    title: 'live like a local,',
    titleHighlight: 'with snug.',
    linkText: 'Explore SNUG',
    linkHref: '/about',
    caption: 'Discover how SNUG helps you live, not just stay.',
    isHostBanner: false,
  },
  {
    type: 'rooms',
    rooms: [
      {
        id: 'cmjtsvlop000u2vmhz1bg1sug',
        image:
          'https://vrelxffwogpqnudmginp.supabase.co/storage/v1/object/public/snug-uploads/accommodations/cmjtsvlop000u2vmhz1bg1sug/1767172310074_yc2nnt_240817_js1_488.jpg',
        tags: [{ label: 'House', color: 'orange' }],
        location: 'Gangnam-gu',
        price: 115000,
        nights: 1,
        imageCount: 8,
        currentImageIndex: 0,
      },
      {
        id: 'cmjtsmq88000f2vmhpqf6ft8r',
        image:
          'https://vrelxffwogpqnudmginp.supabase.co/storage/v1/object/public/snug-uploads/accommodations/cmjtsmq88000f2vmhpqf6ft8r/1767171879394_34xqw6______2025-12-31_180259.png',
        tags: [{ label: 'House', color: 'orange' }],
        location: 'Gangnam-gu',
        price: 150000,
        nights: 1,
        imageCount: 7,
        currentImageIndex: 0,
      },
    ],
  },
  {
    type: 'rooms',
    rooms: [
      {
        id: 'cmjts03o300002vmhmm9lbkbo',
        image:
          'https://vrelxffwogpqnudmginp.supabase.co/storage/v1/object/public/snug-uploads/accommodations/cmjts03o300002vmhmm9lbkbo/1767170814277_a100y7_240817_js1_282.jpg',
        tags: [{ label: 'House', color: 'orange' }],
        location: 'Gangnam-gu',
        price: 130000,
        nights: 1,
        imageCount: 7,
        currentImageIndex: 0,
      },
      {
        id: 'cmjtr34fz00072wi3aio4utvs',
        image:
          'https://vrelxffwogpqnudmginp.supabase.co/storage/v1/object/public/snug-uploads/accommodations/cmjtr34fz00072wi3aio4utvs/1767169146670_uoiy7n_241104_js1_180.jpg',
        tags: [{ label: 'House', color: 'orange' }],
        location: 'Gangnam-gu',
        price: 135000,
        nights: 1,
        imageCount: 5,
        currentImageIndex: 0,
      },
    ],
  },
  {
    type: 'banner',
    image: '/images/banner/Banner_Type02.png',
    badge: 'Smart Earning',
    title: 'Steady Income,\nProfessional\nHosting',
    linkText: 'Become a Host',
    linkHref: '/host/intro',
    caption: 'Open Your Home. Host with Confidence.',
    isHostBanner: true,
  },
];

interface HeroBannerProps {
  className?: string;
}

export function HeroBanner({ className }: HeroBannerProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('home.banner');
  const { isEasterEggActive } = useEasterEgg();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isHovered, setIsHovered] = useState(false);

  const slides = mockSlides;
  const totalSlides = slides.length;
  const wasEasterEggActive = useRef(false);

  // Jump to illustration slide when Easter egg is first activated
  useEffect(() => {
    if (isEasterEggActive && !wasEasterEggActive.current) {
      wasEasterEggActive.current = true;
      // Use setTimeout to ensure state update happens after context propagation
      setTimeout(() => {
        setCurrentSlide(0);
      }, 0);
    }
  }, [isEasterEggActive]);

  // Auto-rotate slides - 10 seconds for Easter egg illustration, 5 seconds for others
  // Pause when hovered
  useEffect(() => {
    if (isHovered) return;

    const isOnIllustrationSlide = slides[currentSlide]?.type === 'illustration';
    const duration = isEasterEggActive && isOnIllustrationSlide ? 10000 : 3000;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, duration);
    return () => clearInterval(timer);
  }, [totalSlides, isEasterEggActive, currentSlide, slides, isHovered]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      setTouchStart(touch.clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      setTouchEnd(touch.clientX);
    }
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  };

  const handleRoomClick = (roomId: string) => {
    router.push(`/${locale}/room/${roomId}`);
  };

  const handleTourClick = (tourId: string) => {
    // Tour detail page (to be implemented)
    router.push(`/${locale}/tour/${tourId}`);
  };

  const handleBookClick = (e: React.MouseEvent, id: string, type: 'room' | 'tour') => {
    e.stopPropagation();
    if (type === 'room') {
      router.push(`/${locale}/room/${id}/payment`);
    } else {
      // Tour booking (to be implemented)
      router.push(`/${locale}/tour/${id}/booking`);
    }
  };

  return (
    <div className={`w-full max-w-[600px] ${className ?? ''}`}>
      {/* Carousel Container */}
      <div
        className="relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Navigation Arrows */}
        <button
          type="button"
          onClick={prevSlide}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/90 rounded-full shadow-md opacity-0 hover:opacity-100 transition-opacity hidden md:flex items-center justify-center"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
        <button
          type="button"
          onClick={nextSlide}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/90 rounded-full shadow-md opacity-0 hover:opacity-100 transition-opacity hidden md:flex items-center justify-center"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>

        {/* Slides */}
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, slideIndex) => (
            <div key={slideIndex} className="w-full flex-shrink-0 px-1">
              {slide.type === 'banner' ? (
                <BannerSlideComponent slide={slide} />
              ) : slide.type === 'illustration' ? (
                <IllustrationSlideComponent
                  image={slide.image}
                  caption={t(slide.captionKey)}
                  isEasterEggActive={isEasterEggActive}
                />
              ) : slide.type === 'rooms' ? (
                <RoomsSlide
                  rooms={slide.rooms}
                  favorites={favorites}
                  onFavoriteToggle={toggleFavorite}
                  onRoomClick={handleRoomClick}
                  onBookClick={handleBookClick}
                />
              ) : slide.type === 'tour' ? (
                <TourSlideComponent
                  tour={slide.tour}
                  isFavorite={favorites.has(slide.tour.id)}
                  onFavoriteToggle={toggleFavorite}
                  onTourClick={handleTourClick}
                  onBookClick={handleBookClick}
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-end items-center gap-1 mt-3 pr-1">
        <span className="text-sm font-bold text-[hsl(var(--snug-text-primary))]">
          {currentSlide + 1}
        </span>
        <span className="text-sm text-[hsl(var(--snug-gray))]">/</span>
        <span className="text-sm text-[hsl(var(--snug-gray))]">{totalSlides}</span>
      </div>
    </div>
  );
}

// Room Card Component
interface RoomCardProps {
  room: RoomCardData;
  isFavorite: boolean;
  onFavoriteToggle: (id: string, e: React.MouseEvent) => void;
  onClick: () => void;
  onBookClick: (e: React.MouseEvent) => void;
}

const RoomCard = memo(function RoomCard({
  room,
  isFavorite,
  onFavoriteToggle,
  onClick,
  onBookClick,
}: RoomCardProps) {
  const [imageIndex, setImageIndex] = useState(0);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageIndex((prev) => (prev - 1 + room.imageCount) % room.imageCount);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageIndex((prev) => (prev + 1) % room.imageCount);
  };

  return (
    <div className="flex-1 min-w-0 cursor-pointer group flex flex-col h-full" onClick={onClick}>
      {/* Image Container */}
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[hsl(var(--snug-light-gray))] flex-shrink-0">
        {/* Room Image */}
        {room.image ? (
          <Image
            src={room.image}
            alt={room.location}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 300px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon className="w-10 h-10 text-[hsl(var(--snug-gray))]/30" />
          </div>
        )}

        {/* Tags */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {room.tags.map((tag) => (
            <span
              key={tag.label}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                tag.color === 'orange'
                  ? 'bg-[#FFF5E6] text-[hsl(var(--snug-orange))]'
                  : 'bg-[#F9A8D4] text-white'
              }`}
            >
              {tag.label}
            </span>
          ))}
        </div>

        {/* Favorite Button */}
        <button
          type="button"
          onClick={(e) => onFavoriteToggle(room.id, e)}
          className="absolute top-2.5 right-2.5 p-1.5 z-10"
        >
          <Heart
            className={`w-5 h-5 ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-white drop-shadow-md'
            }`}
            fill={isFavorite ? 'currentColor' : 'none'}
          />
        </button>

        {/* Image Navigation */}
        <button
          type="button"
          onClick={handlePrevImage}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-1 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          <ChevronLeft className="w-4 h-4 text-gray-700" />
        </button>
        <button
          type="button"
          onClick={handleNextImage}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          <ChevronRight className="w-4 h-4 text-gray-700" />
        </button>

        {/* Image Counter */}
        <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-black/50 rounded text-white text-[11px] z-10">
          {imageIndex + 1} / {room.imageCount}
        </div>
      </div>

      {/* Info */}
      <div className="mt-2 flex items-center justify-between flex-1">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-[hsl(var(--snug-text-primary))] truncate">
            {room.location}
          </h3>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            {room.originalPrice && (
              <span className="text-xs text-[hsl(var(--snug-gray))] line-through">
                ${room.originalPrice}
              </span>
            )}
            <span className="text-sm font-bold text-[hsl(var(--snug-orange))]">${room.price}</span>
            <span className="text-xs text-[hsl(var(--snug-gray))] whitespace-nowrap">
              for {room.nights} {room.nights === 1 ? 'night' : 'nights'}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onBookClick}
          className="px-4 py-1.5 bg-[hsl(var(--snug-orange))] text-white text-xs font-medium rounded-full hover:opacity-90 transition-opacity flex-shrink-0 ml-2"
        >
          Book
        </button>
      </div>
    </div>
  );
});

// Rooms Slide Component (2 cards side by side)
interface RoomsSlideProps {
  rooms: RoomCardData[];
  favorites: Set<string>;
  onFavoriteToggle: (id: string, e: React.MouseEvent) => void;
  onRoomClick: (id: string) => void;
  onBookClick: (e: React.MouseEvent, id: string, type: 'room' | 'tour') => void;
}

const RoomsSlide = memo(function RoomsSlide({
  rooms,
  favorites,
  onFavoriteToggle,
  onRoomClick,
  onBookClick,
}: RoomsSlideProps) {
  return (
    <div className="flex gap-4 items-stretch">
      {rooms.map((room) => (
        <RoomCard
          key={room.id}
          room={room}
          isFavorite={favorites.has(room.id)}
          onFavoriteToggle={onFavoriteToggle}
          onClick={() => onRoomClick(room.id)}
          onBookClick={(e) => onBookClick(e, room.id, 'room')}
        />
      ))}
    </div>
  );
});

// Tour Slide Component
interface TourSlideComponentProps {
  tour: TourCardData;
  isFavorite: boolean;
  onFavoriteToggle: (id: string, e: React.MouseEvent) => void;
  onTourClick: (id: string) => void;
  onBookClick: (e: React.MouseEvent, id: string, type: 'room' | 'tour') => void;
}

const TourSlideComponent = memo(function TourSlideComponent({
  tour,
  isFavorite,
  onFavoriteToggle,
  onTourClick,
  onBookClick,
}: TourSlideComponentProps) {
  return (
    <div className="cursor-pointer group" onClick={() => onTourClick(tour.id)}>
      {/* Image Container */}
      <div className="relative aspect-[8/3] rounded-2xl overflow-hidden bg-[hsl(var(--snug-light-gray))]">
        {/* Placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <ImageIcon className="w-12 h-12 text-[hsl(var(--snug-gray))]/30" />
        </div>

        {/* Location Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-white/90 rounded-full z-10">
          <LocationIcon className="w-3.5 h-3.5 text-[hsl(var(--snug-gray))]" />
          <span className="text-xs font-medium text-[hsl(var(--snug-text-primary))]">
            {tour.location}
          </span>
        </div>

        {/* Favorite Button */}
        <button
          type="button"
          onClick={(e) => onFavoriteToggle(tour.id, e)}
          className="absolute top-3 right-3 p-1.5 z-10"
        >
          <Heart
            className={`w-5 h-5 ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-white drop-shadow-md'
            }`}
            fill={isFavorite ? 'currentColor' : 'none'}
          />
        </button>
      </div>

      {/* Info */}
      <div className="mt-2 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[hsl(var(--snug-text-primary))]">
            {tour.title}
          </h3>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold text-[hsl(var(--snug-orange))]">
              ${tour.pricePerPerson}
            </span>
            <span className="text-xs text-[hsl(var(--snug-gray))]">per person</span>
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => onBookClick(e, tour.id, 'tour')}
          className="px-4 py-1.5 bg-[hsl(var(--snug-orange))] text-white text-xs font-medium rounded-full hover:opacity-90 transition-opacity"
        >
          Book
        </button>
      </div>
    </div>
  );
});

// Host Banner SVG Logo - "Steady Income, Professional Hosting"
const HostBannerLogo = memo(function HostBannerLogo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1500 680"
      fill="none"
      className={className}
    >
      {/* Steady Income, */}
      <text
        x="1500"
        y="170"
        textAnchor="end"
        fill="black"
        stroke="black"
        strokeWidth="4"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="200"
        fontWeight="900"
      >
        Steady Income,
      </text>
      {/* Professional */}
      <text
        x="1500"
        y="390"
        textAnchor="end"
        fill="black"
        stroke="black"
        strokeWidth="4"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="200"
        fontWeight="900"
      >
        Professional
      </text>
      {/* Hosting */}
      <text
        x="1500"
        y="610"
        textAnchor="end"
        fill="black"
        stroke="black"
        strokeWidth="4"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="200"
        fontWeight="900"
      >
        Hosting
      </text>
    </svg>
  );
});

// Live Like a Local SVG Logo
const LiveLikeLocalLogo = memo(function LiveLikeLocalLogo({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 178 53" fill="none" className={className}>
      <path
        d="M6.17809 2.09223C6.17809 1.26835 5.784 1.19363 5.05473 1.16063C3.7401 1.10047 2.12508 1.10047 0.713866 1.16646C0.143005 1.19266 -0.00188361 1.35666 4.82371e-05 1.90203C0.0193667 6.52701 0.0270941 15.2666 4.82371e-05 19.8915C-0.00381546 20.5301 0.224143 20.6533 0.78631 20.6388C2.08934 20.6067 3.3943 20.6252 4.69733 20.6291C5.6858 20.6316 6.17938 20.1442 6.17809 19.1666V2.09223Z"
        fill="black"
      />
      <path
        d="M118.749 2.09223C118.749 1.26835 118.355 1.19363 117.626 1.16063C116.311 1.10047 114.696 1.10047 113.285 1.16646C112.714 1.19363 112.569 1.35666 112.572 1.90203C112.592 6.52701 112.599 15.2666 112.572 19.8915C112.568 20.5301 112.796 20.6533 113.359 20.6388C114.662 20.6067 115.967 20.6252 117.27 20.6291C118.258 20.6316 118.752 20.1442 118.75 19.1666V2.09223H118.749Z"
        fill="black"
      />
      <path
        d="M171.111 2.02973C171.111 1.20585 170.717 1.13113 169.987 1.09813C168.673 1.03797 167.058 1.03797 165.646 1.10396C165.076 1.13113 164.931 1.29416 164.934 1.83953C164.953 6.46451 164.961 15.2041 164.934 19.829C164.93 20.4676 165.158 20.5908 165.72 20.5763C167.023 20.5442 168.328 20.5627 169.631 20.5666C170.619 20.5691 171.113 20.0817 171.112 19.1041V2.02973H171.111Z"
        fill="black"
      />
      <path
        d="M177.363 16.1719C176.762 15.4014 175.879 15.0987 175.044 15.0511C174.05 14.9948 173.055 15.318 172.364 16.2263C171.944 16.7794 171.842 17.3733 171.822 18.0739C171.822 19.9556 173.5 20.6785 174.599 20.7523C175.072 20.7843 175.159 20.7494 175.397 20.7309C175.397 20.7309 174.944 21.0842 174.559 21.353C174.417 21.4519 174.28 21.6169 174.424 21.8566C174.515 22.0099 174.716 22.3069 174.813 22.4573C174.912 22.6106 175.168 22.6291 175.388 22.4282C175.988 21.8789 176.337 21.5121 176.784 20.9939C177.286 20.4136 177.687 19.8546 177.913 18.8095C178.071 18.0856 178.08 17.0899 177.363 16.171V16.1719Z"
        fill="black"
      />
      <path
        d="M134.46 12.999C134.354 16.0907 133.364 18.7749 130.407 20.3382C125.928 22.707 120.5 20.2004 119.475 15.3484C118.977 12.9941 119.077 10.6787 120.246 8.50404C121.692 5.816 124.453 4.37882 127.691 4.73399C130.854 5.08043 132.89 6.86987 133.94 9.74229C134.322 10.7874 134.484 11.8791 134.461 12.999H134.46ZM127.549 12.7651C127.549 11.7918 127.563 11.1038 127.481 10.0421C127.449 9.62584 127.39 8.99701 126.804 9.02903C126.211 9.06106 126.154 9.57732 126.133 10.0092C126.085 10.9718 126.076 11.9374 126.071 12.902C126.066 13.8947 126.05 14.8884 126.112 15.8782C126.138 16.2906 126.215 16.8428 126.796 16.8797C127.364 16.9156 127.414 16.1936 127.46 15.7783C127.563 14.8418 127.548 13.8695 127.548 12.7651H127.549Z"
        fill="black"
      />
      <path
        d="M37.6242 13.4073C36.6283 13.4083 35.8227 13.3956 34.6375 13.3956C34.0406 13.3956 33.8068 13.6402 33.7875 14.1584C33.7518 15.1327 33.7479 15.6936 33.9643 16.2797C34.0899 16.6193 34.2966 16.7659 34.6627 16.8018C34.9544 16.8309 35.2171 16.7727 35.39 16.5272C35.5571 16.2913 35.6073 15.8964 35.6479 15.6198C35.7187 15.1359 36.0092 14.894 36.5192 14.894C37.97 14.894 39.4324 14.9124 40.72 14.9007C41.3159 14.8959 41.4608 15.0754 41.3951 15.615C40.8262 20.2856 35.7657 22.6728 31.3775 20.3244C28.4324 18.7475 27.4279 16.1186 27.3535 13.0715C27.2782 9.96135 28.2847 7.25778 31.1834 5.60614C35.8469 3.09374 40.8861 5.98168 41.3903 10.7183C41.455 11.3219 41.4927 11.876 41.4473 12.6562C41.4193 13.153 41.1788 13.415 40.633 13.415C39.5811 13.415 38.6761 13.4044 37.6232 13.4053L37.6242 13.4073ZM34.8645 10.7192C35.2548 10.7134 35.7532 10.6765 35.7522 10.1321C35.7522 9.02199 35.7107 8.45818 34.8462 8.45818C33.9817 8.45818 33.9682 9.1986 33.945 10.1535C33.945 10.63 34.5091 10.7251 34.8636 10.7202L34.8645 10.7192Z"
        fill="black"
      />
      <path
        d="M13.3178 6.07854C13.3178 5.36723 12.9237 5.30221 12.1944 5.27407C10.8798 5.22166 9.26474 5.22166 7.85353 5.27892C7.28266 5.30221 7.13778 5.65932 7.14067 6.12997C7.15999 10.1242 7.16772 15.9991 7.14067 19.9933C7.13681 20.5445 7.36477 20.6512 7.92693 20.6386C9.22997 20.6105 10.5349 20.627 11.838 20.6299C12.8264 20.6325 13.32 20.2116 13.3187 19.3674V6.07854H13.3178Z"
        fill="black"
      />
      <path
        d="M13.1903 2.82584C13.3033 2.21254 13.1188 1.34208 12.6484 0.880164C12.0466 0.288213 11.2961 0 10.2355 0C8.53839 0 7.23633 0.994673 7.23633 2.29309C7.23633 3.5915 8.3539 4.80354 10.052 4.80354C11.7501 4.80354 12.9536 4.10776 13.1903 2.82487V2.82584Z"
        fill="black"
      />
      <path
        d="M29.6752 33.8178C29.6752 33.1065 29.2811 33.0415 28.5518 33.0133C27.2372 32.9609 25.6222 32.9609 24.2109 33.0182C23.6401 33.0415 23.4952 33.3986 23.4981 33.8692C23.5174 37.8634 23.5251 43.7383 23.4981 47.7325C23.4942 48.2837 23.7222 48.3905 24.2844 48.3779C25.5874 48.3497 26.8923 48.3662 28.1954 48.3691C29.1838 48.3717 29.6774 47.9509 29.6761 47.1066V33.8178H29.6752Z"
        fill="black"
      />
      <path
        d="M29.5477 30.5651C29.6607 29.9518 29.4762 29.0813 29.0058 28.6194C28.404 28.0275 27.6535 27.7393 26.5929 27.7393C24.8958 27.7393 23.5938 28.7339 23.5938 30.0323C23.5938 31.3308 24.7113 32.5428 26.4094 32.5428C28.1075 32.5428 29.3111 31.847 29.5477 30.5641V30.5651Z"
        fill="black"
      />
      <path
        d="M77.1838 19.9694L72.3745 11.7141C72.3078 11.6005 72.3184 11.4569 72.4015 11.355L76.6545 6.05075C76.8583 5.77224 76.6603 5.37923 76.3164 5.37923H71.3622C70.857 5.37923 70.7266 5.45104 70.5672 5.6558C69.9442 6.45056 68.1621 8.75432 68.1621 8.75432C68.0433 8.90765 67.7979 8.82225 67.7989 8.62817C67.8066 5.03376 67.8211 2.00413 67.8211 2.00413C67.8404 1.25789 67.6965 1.11523 66.9701 1.11523C65.5782 1.11523 63.6628 1.12106 62.3424 1.12106C61.7744 1.12106 61.6798 1.55289 61.6817 2.09535C61.701 6.69123 61.7078 15.2998 61.6817 19.8956C61.6778 20.5303 61.9038 20.6526 62.4631 20.639C63.7584 20.6069 65.0537 20.6254 66.35 20.6283C67.824 20.6322 67.8423 20.4197 67.8211 18.9602C67.8095 18.1411 67.7989 16.9203 67.7989 15.7064C67.7989 15.586 67.8124 15.4676 67.9022 15.3745C67.993 15.2803 68.1862 15.2406 68.2847 15.4133C68.987 16.6457 71.0193 20.3867 71.0193 20.3867C71.0936 20.5215 71.2028 20.605 71.5612 20.605H76.8235C77.1481 20.605 77.3499 20.2508 77.1867 19.9694H77.1838Z"
        fill="black"
      />
      <path
        d="M21.6575 33.019C20.2453 32.953 19.6001 32.953 18.2855 33.0132C17.5552 33.0471 17.3794 33.151 17.1621 33.9448C16.6705 35.742 16.174 37.5498 15.6814 39.3247C15.1887 37.5498 14.6923 35.741 14.2006 33.9448C13.9833 33.15 13.8065 33.0462 13.0772 33.0132C12.3219 32.9782 11.7877 32.9637 11.2024 32.9705C10.617 32.9647 10.0819 32.9792 9.32751 33.0132C8.59728 33.0471 8.42148 33.151 8.20414 33.9448C7.71249 35.742 7.216 37.5498 6.72338 39.3247C6.23076 37.5498 5.73428 35.741 5.24262 33.9448C5.02529 33.15 4.84853 33.0462 4.11925 33.0132C2.80463 32.953 2.1594 32.953 0.747215 33.019C0.176355 33.0462 -0.0912062 33.2237 0.0343638 33.7546C1.19154 38.6668 1.87155 41.1365 3.68072 47.6305C3.85169 48.2457 3.90482 48.3923 4.46699 48.3777C4.99148 48.3651 5.35853 48.3602 5.69564 48.3593C5.80286 48.3641 5.91587 48.368 6.03951 48.368C6.30224 48.368 6.5244 48.3661 6.72435 48.3641C6.9243 48.3651 7.14646 48.367 7.40919 48.368C7.53283 48.368 7.64488 48.3651 7.75306 48.3593C8.09017 48.3593 8.45722 48.3651 8.98171 48.3777C9.54388 48.3913 9.59604 48.2448 9.76797 47.6305C10.3446 45.5625 10.8054 43.9031 11.2053 42.4427C11.6042 43.9031 12.0659 45.5625 12.6426 47.6305C12.8135 48.2457 12.8667 48.3923 13.4288 48.3777C13.9533 48.3651 14.3204 48.3602 14.6575 48.3593C14.7647 48.3641 14.8777 48.368 15.0013 48.368C15.2641 48.368 15.4862 48.3661 15.6862 48.3641C15.8861 48.3651 16.1083 48.367 16.371 48.368C16.4947 48.368 16.6067 48.3651 16.7149 48.3593C17.052 48.3593 17.4191 48.3651 17.9436 48.3777C18.5057 48.3913 18.5579 48.2448 18.7298 47.6305C20.539 41.1365 21.22 38.6678 22.3762 33.7546C22.5008 33.2237 22.2342 33.0452 21.6633 33.019H21.6575Z"
        fill="black"
      />
      <path
        d="M27.1276 5.23629C25.6062 5.23629 24.8654 5.23047 23.5507 5.23047C22.8195 5.23047 22.6544 5.37312 22.4206 6.16498C22.0497 7.42166 21.5696 9.1063 21.0751 10.8686C20.5805 9.1063 20.1005 7.42166 19.7296 6.16498C19.4958 5.37312 19.3306 5.23047 18.5994 5.23047C17.2848 5.23047 16.5439 5.23629 15.0226 5.23629C14.4517 5.23629 14.1842 5.44202 14.3098 5.97478C15.4669 10.9016 16.1469 13.3771 17.9561 19.8895C18.1271 20.5057 18.1802 20.6464 18.7424 20.6387C18.9008 20.6367 19.0737 20.6358 19.2553 20.6348C19.292 20.6377 19.3306 20.6387 19.3702 20.6387C19.8532 20.6387 20.4559 20.6358 21.0751 20.6338C21.6942 20.6358 22.297 20.6387 22.7799 20.6387C22.8195 20.6387 22.8572 20.6367 22.8949 20.6348C23.0755 20.6348 23.2484 20.6367 23.4078 20.6387C23.97 20.6455 24.0221 20.5057 24.194 19.8895C26.0032 13.3771 26.6842 10.9006 27.8404 5.97478C27.965 5.44202 27.6984 5.23629 27.1276 5.23629Z"
        fill="black"
      />
      <path
        d="M53.5775 2.09223C53.5775 1.26835 53.1834 1.19363 52.4541 1.16063C51.1395 1.10047 49.5245 1.10047 48.1133 1.16646C47.5424 1.19363 47.3975 1.35666 47.4004 1.90203C47.4198 6.52701 47.4275 15.2666 47.4004 19.8915C47.3966 20.5301 47.6245 20.6533 48.1867 20.6388C49.4897 20.6067 50.7947 20.6252 52.0977 20.6291C53.0862 20.6316 53.5798 20.1442 53.5785 19.1666V2.09223H53.5775Z"
        fill="black"
      />
      <path
        d="M86.0988 13.4073C85.1029 13.4083 84.2973 13.3956 83.1121 13.3956C82.5152 13.3956 82.2815 13.6402 82.2621 14.1584C82.2264 15.1327 82.2225 15.6936 82.4389 16.2797C82.5645 16.6193 82.7712 16.7659 83.1373 16.8018C83.429 16.8309 83.6917 16.7727 83.8646 16.5272C84.0317 16.2913 84.0819 15.8964 84.1225 15.6198C84.1933 15.1359 84.4838 14.894 84.9938 14.894C86.4446 14.894 87.907 14.9124 89.1946 14.9007C89.7905 14.8959 89.9354 15.0754 89.8697 15.615C89.3008 20.2856 84.2403 22.6728 79.8522 20.3244C76.9071 18.7475 75.9025 16.1186 75.8281 13.0715C75.7528 9.96135 76.7593 7.25778 79.658 5.60614C84.3215 3.09374 89.3607 5.98168 89.8649 10.7183C89.9296 11.3219 89.9673 11.876 89.9219 12.6562C89.8939 13.153 89.6534 13.415 89.1076 13.415C88.0557 13.415 87.1507 13.4044 86.0978 13.4053L86.0988 13.4073ZM83.3382 10.7192C83.7284 10.7134 84.2268 10.6765 84.2259 10.1321C84.2259 9.02199 84.1843 8.45818 83.3198 8.45818C82.4553 8.45818 82.4418 9.1986 82.4186 10.1535C82.4186 10.63 82.9827 10.7251 83.3372 10.7202L83.3382 10.7192Z"
        fill="black"
      />
      <path
        d="M60.7181 6.07854C60.7181 5.36723 60.324 5.30221 59.5948 5.27407C58.2801 5.22166 56.6651 5.22166 55.2539 5.27892C54.6831 5.30221 54.5382 5.65932 54.5411 6.12997C54.5604 10.1242 54.5681 15.9991 54.5411 19.9933C54.5372 20.5445 54.7652 20.6512 55.3273 20.6386C56.6304 20.6105 57.9353 20.627 59.2383 20.6299C60.2268 20.6325 60.7204 20.2116 60.7191 19.3674V6.07854H60.7181Z"
        fill="black"
      />
      <path
        d="M60.5887 2.82584C60.7017 2.21254 60.5172 1.34208 60.0468 0.880164C59.4451 0.288213 58.6945 0 57.634 0C55.9368 0 54.6348 0.994673 54.6348 2.29309C54.6348 3.5915 55.7523 4.80354 57.4504 4.80354C59.1485 4.80354 60.3521 4.10776 60.5887 2.82487V2.82584Z"
        fill="black"
      />
      <path
        d="M144.126 13.712C143.531 13.712 143.199 13.9177 143.189 14.4854C143.181 14.9871 143.158 15.3074 143.106 15.778C143.06 16.1924 143.01 16.9153 142.443 16.8794C141.861 16.8426 141.785 16.2904 141.759 15.878C141.675 14.5553 141.733 13.2239 141.715 11.8993C141.707 11.2093 141.73 10.5194 141.792 9.83133C141.826 9.44705 141.939 9.05694 142.451 9.0288C143.038 8.99678 143.096 9.62463 143.129 10.0419C143.175 10.6377 143.195 10.9017 143.195 11.3782C143.195 11.9691 143.486 12.2098 144.175 12.2098H149.312C149.741 12.2098 150.073 11.8265 150.009 11.4005C149.925 10.8367 149.786 10.2835 149.589 9.74205C148.54 6.8706 146.502 5.08019 143.339 4.73375C140.101 4.37955 137.341 5.81576 135.895 8.5038C134.725 10.6795 134.626 12.9939 135.123 15.3481C136.149 20.2002 141.575 22.7058 146.055 20.337C148.514 19.0376 149.612 16.9639 149.973 14.5252C150.037 14.0973 149.707 13.712 149.277 13.712H144.127H144.126Z"
        fill="black"
      />
      <path
        d="M106.113 33.1012C104.81 33.1012 103.931 33.1148 102.627 33.1119C101.144 33.108 101.145 33.3215 101.146 34.7907C101.148 37.7048 101.14 40.4026 101.157 43.3167C101.159 43.7738 101.078 44.1484 100.586 44.2085C100.052 44.2736 99.8313 43.8641 99.754 43.4264C99.6854 43.0353 99.7086 42.6277 99.7086 42.227C99.7047 39.4729 99.6738 36.977 99.7231 34.224C99.7366 33.4748 99.6265 33.1158 98.817 33.0993C97.74 33.0779 96.4583 33.1022 95.7841 33.1158C95.0693 33.1303 94.3641 33.1788 94.001 33.4709C93.6909 33.7203 93.4291 34.0134 93.4243 34.7422C93.4031 37.9901 93.291 41.7369 93.6436 44.9034C94.0522 48.5676 97.004 49.6205 99.6362 48.3774C100.337 48.0465 101.058 47.4905 101.601 47.0538C101.619 47.2935 101.612 47.4342 101.62 47.5739C101.66 48.3435 101.811 48.4997 102.541 48.4687C103.896 48.4104 105.255 48.426 106.611 48.4628C107.182 48.4784 107.327 48.2726 107.324 47.7273C107.305 43.1023 107.298 38.7636 107.324 34.1395C107.328 33.501 107.21 33.1051 106.112 33.1051L106.113 33.1012Z"
        fill="#FF7900"
      />
      <path
        d="M92.5351 36.3455C92.4018 32.8831 89.1167 32.0155 86.5589 33.0587C85.8412 33.3518 85.1091 33.9728 84.6367 34.6182C84.6416 34.3697 84.6454 34.1116 84.6493 33.9C84.6638 33.0762 84.2552 33.0014 83.5259 32.9685C82.2113 32.9083 80.9962 32.9083 79.584 32.9743C79.0131 33.0014 78.8682 33.1645 78.8711 33.7098C78.8905 38.3348 78.8972 42.9608 78.8711 47.5858C78.8673 48.2243 79.0952 48.3476 79.6574 48.333C80.9604 48.301 82.2654 48.3194 83.5684 48.3233C84.5569 48.3259 85.0505 47.8384 85.0492 46.8609C85.0473 43.9467 85.055 41.0326 85.0386 38.1184C85.0357 37.6623 85.1168 37.2868 85.6094 37.2276C86.1436 37.1626 86.3638 37.5711 86.4411 38.0097C86.5097 38.4008 86.4865 38.8094 86.4865 39.2101C86.4903 41.9642 86.5213 44.7182 86.472 47.4713C86.4585 48.2204 86.7106 48.3272 87.378 48.3291C88.4985 48.334 89.8266 48.3291 90.838 48.3291C91.8493 48.3291 92.4762 48.4397 92.5196 47.7343C92.6162 46.1709 92.6046 44.3931 92.6046 43.6643C92.6046 42.2048 92.6703 39.8332 92.5351 36.3465V36.3455Z"
        fill="#FF7900"
      />
      <path
        d="M76.7732 40.1946C75.8962 39.5929 75.0008 39.294 73.8445 38.9486C73.1201 38.7322 72.1774 38.5507 71.6287 38.4013C71.1892 38.2819 70.5005 38.1625 70.3276 37.6608C70.231 37.3823 70.344 37.0834 70.4628 36.9524C70.5894 36.8137 70.7681 36.7069 70.9941 36.638C71.2375 36.5623 71.478 36.5546 71.7697 36.5614C72.1696 36.5711 72.5579 36.7448 72.8004 36.9495C73.1443 37.2387 73.2486 37.4464 73.3703 37.8122C73.4785 38.1354 73.7093 38.3159 74.3864 38.3159H77.6145C78.0425 38.3159 78.2096 38.2848 78.3573 38.1257C78.51 37.9617 78.5022 37.6851 78.4829 37.4677C78.4056 36.6109 78.1246 35.9044 77.6097 35.1873C77.1808 34.5905 76.4004 33.8413 75.5253 33.3823C74.4869 32.8369 73.2157 32.375 71.6384 32.375C70.061 32.375 68.9734 32.6157 68.0307 32.9854C66.9788 33.3978 66.1394 34.0305 65.5782 34.8243C65.0913 35.5123 64.6432 36.4682 64.6432 37.7006C64.6335 38.9835 65.0266 39.8811 65.8148 40.7011C66.5972 41.5143 67.9399 42.083 69.3076 42.3615C69.9538 42.4935 71.0463 42.7099 71.6258 42.8254C72.1812 42.936 72.5579 43.0427 72.8342 43.2329C72.9839 43.3368 73.0892 43.5085 73.0892 43.7618C73.0892 43.9433 72.9955 44.1733 72.8786 44.2994C72.7511 44.4363 72.6371 44.5149 72.3918 44.5983C72.243 44.6488 72.0798 44.676 71.7533 44.676C71.1892 44.676 70.8067 44.5498 70.4551 44.2975C70.1905 44.1083 70.0977 43.9404 69.9364 43.6648C69.779 43.396 69.5327 43.1786 69.2129 43.1786H65.1561C64.9262 43.1786 64.7098 43.2756 64.5611 43.4464C64.4075 43.6221 64.3457 43.8521 64.392 44.0772C64.5649 44.9147 64.903 45.6716 65.3985 46.3257C66.0225 47.1505 66.8928 47.7987 67.9843 48.2539C69.0681 48.7061 70.3653 48.9351 71.8403 48.9351C73.3152 48.9351 74.2039 48.7711 75.2712 48.314C76.5134 47.7822 77.0079 47.2699 77.3682 46.8497C78.1197 45.9744 78.5669 44.7516 78.5669 43.6405C78.5669 42.4324 77.9584 41.0078 76.7723 40.1936L76.7732 40.1946Z"
        fill="#FF7900"
      />
      <path
        d="M119.615 44.5309C119.181 44.3892 118.732 44.2941 118.282 44.199C117.456 44.0243 116.617 44.0272 115.808 44.0292C115.381 44.0302 114.941 44.0321 114.513 44.0069C113.998 43.9778 113.832 43.8594 113.829 43.5217C113.826 43.1781 113.989 43.0617 114.503 43.0394L114.842 43.0258C115.545 42.9976 116.272 42.9685 116.989 42.856C119.39 42.4814 121.2 40.7599 121.492 38.5726C121.842 35.9612 120.703 33.9078 118.375 32.9209C118.144 32.8229 118.052 32.7501 118.024 32.5997C117.978 32.359 118.094 32.1591 118.166 31.9873C118.355 31.5351 118.662 30.8529 118.83 30.4764C119.063 29.9563 119.075 29.5273 118.89 29.2139C118.75 28.9752 118.489 28.8781 117.98 28.8112C117.713 28.7753 117.479 28.7568 116.758 28.7568C116.191 28.7568 115.428 28.7733 114.918 28.8054C114.562 28.8277 114.331 28.8684 114.205 28.9936C113.96 29.2382 113.891 29.5865 113.927 30.0397C113.949 30.3046 113.948 30.489 113.957 30.6521C113.977 30.9597 113.996 31.0994 113.93 31.5002C113.842 32.0339 113.038 32.457 112.522 32.5744C110.927 32.9383 109.785 33.6128 109.03 34.6356C107.975 36.067 107.729 37.5235 108.278 39.0888C108.47 39.6361 108.735 40.1175 109.092 40.56C109.286 40.8016 109.366 41.1121 109.312 41.41C109.264 41.6789 109.103 41.8875 108.884 42.035C108.322 42.4144 108.128 42.658 108.048 43.3004C107.932 44.2242 108.423 44.5687 108.805 44.824C108.997 44.953 109.163 45.0646 109.213 45.2141C109.306 45.5023 109.199 45.8089 109.06 45.971C108.131 47.0588 107.79 48.3504 108.126 49.513C108.466 50.6901 109.588 51.5926 110.862 52.0409C112.077 52.4679 113.651 52.596 114.784 52.596C115.657 52.596 116.589 52.5494 117.587 52.3912C118.841 52.1923 120.148 51.5858 120.859 50.8502C121.706 49.9739 122.285 48.3495 121.943 46.9725C121.65 45.7885 120.822 44.921 119.615 44.528V44.5309ZM114.514 36.3115C114.593 35.9806 114.78 35.9709 114.851 35.968C114.861 35.968 114.871 35.968 114.882 35.968C115.022 35.968 115.172 36.0194 115.264 36.3173C115.402 36.7647 115.404 37.246 115.394 37.5682V37.5769C115.397 38.1301 115.39 38.5891 115.247 39.0267C115.153 39.312 115.012 39.3518 114.885 39.3528C114.643 39.3372 114.559 39.1888 114.525 39.051C114.303 38.1339 114.298 37.212 114.512 36.3125L114.514 36.3115ZM115.561 48.8686C115.259 48.889 114.867 48.8939 114.566 48.8735C113.895 48.8298 113.704 48.4358 113.704 48.1826C113.704 47.8623 113.959 47.5314 114.51 47.4974C114.807 47.479 115.12 47.4761 115.418 47.4926C116.091 47.5295 116.358 47.7944 116.362 48.1457C116.367 48.5688 116.04 48.8366 115.561 48.8686Z"
        fill="#FF7900"
      />
      <path
        d="M126.309 42.7454C125.315 42.6892 124.32 43.0123 123.63 43.9206C123.21 44.4737 123.107 45.0676 123.088 45.7683C123.088 47.6499 124.766 48.3729 125.865 48.4466C126.337 48.4786 126.424 48.4437 126.663 48.4253C126.663 48.4253 126.21 48.7785 125.824 49.0473C125.682 49.1463 125.545 49.3113 125.689 49.5509C125.781 49.7043 125.982 50.0012 126.078 50.1516C126.178 50.305 126.434 50.3234 126.654 50.1225C127.254 49.5733 127.603 49.2064 128.05 48.6882C128.551 48.1079 128.953 47.549 129.179 46.5038C129.336 45.7799 129.346 44.7843 128.628 43.8653C128.028 43.0948 127.145 42.792 126.309 42.7445V42.7454Z"
        fill="#FF7900"
      />
      <path
        d="M58.7519 36.3915C58.6186 32.9291 55.3335 32.0615 52.7757 33.1047C52.058 33.3978 51.3259 34.0188 50.8535 34.6641C50.8584 34.4157 50.8622 30.044 50.8661 29.8325C50.8806 29.0086 50.472 28.9339 49.7427 28.9009C48.4281 28.8407 47.213 28.8407 45.8008 28.9067C45.2299 28.9339 45.085 29.0969 45.0879 29.6423C45.1073 34.2672 45.115 43.0068 45.0879 47.6318C45.0841 48.2703 45.312 48.3935 45.8742 48.379C47.1772 48.347 48.4822 48.3654 49.7862 48.3693C50.7747 48.3719 51.2682 47.8844 51.267 46.9069C51.265 43.9927 51.2727 41.0786 51.2563 38.1644C51.2534 37.7083 51.4669 37.2736 51.9634 37.2668C52.4753 37.26 52.6163 37.6123 52.6588 38.0548C52.7042 38.5274 52.7042 38.8544 52.7042 39.2552C52.7081 42.0092 52.739 44.7632 52.6898 47.5163C52.6762 48.2654 52.9283 48.3722 53.5958 48.3741C54.7163 48.379 56.0444 48.3741 57.0557 48.3741C58.067 48.3741 58.6939 48.4848 58.7374 47.7793C58.834 46.2159 58.8224 44.4381 58.8224 43.7094C58.8224 42.2499 58.8881 39.8782 58.7538 36.3915H58.7519Z"
        fill="black"
      />
      <path
        d="M43.7361 33.0135C42.661 33.0183 41.6758 33.0222 40.7331 33.0251V29.8315C40.7331 29.0076 40.339 28.9329 39.6097 28.8999C38.2951 28.8397 36.68 28.8397 35.2688 28.9057C34.698 28.9329 34.5531 29.0959 34.556 29.6413C34.5598 30.6127 34.5637 31.7684 34.5666 33.0271C33.6103 33.0241 32.6087 33.0203 31.5152 33.0135C30.8797 33.0096 30.7715 33.2376 30.7715 33.8034C30.7715 35.0931 30.785 35.2629 30.7811 36.5729C30.7786 37.566 31.2638 38.0619 32.2368 38.0606H34.5734C34.5753 41.59 34.5705 45.1854 34.556 47.6308C34.5521 48.2693 34.7801 48.3926 35.3422 48.378C36.6453 48.346 37.9502 48.3644 39.2533 48.3683C40.2417 48.3709 40.7353 47.8834 40.734 46.9059V38.0606H43.5478C44.3678 38.0606 44.4422 37.6647 44.475 36.932C44.5349 35.6113 44.5349 35.1493 44.4692 33.7306C44.4422 33.1571 44.2799 33.0115 43.7371 33.0144L43.7361 33.0135Z"
        fill="black"
      />
      <path
        d="M106.496 7.42791C105.926 6.61179 105.204 5.90145 104.035 5.30076C103.164 4.85243 101.662 4.68164 100.656 4.68164C99.2797 4.68164 98.0926 4.98053 97.1247 5.4832C96.1462 5.99267 95.4256 6.73115 94.8693 7.53562C94.1004 8.64772 93.9864 10.2169 94.0598 10.4604C94.0965 10.5808 94.2163 10.6371 94.3525 10.6371H98.3678C98.5881 10.6371 98.8382 10.64 98.9947 10.574C99.1811 10.4954 99.1879 10.1887 99.1927 10.1227C99.2169 9.78019 99.3019 9.60843 99.5482 9.40658C99.8032 9.19794 100.223 9.13292 100.663 9.12419C100.934 9.11837 101.18 9.15815 101.394 9.24161C101.585 9.3173 101.683 9.4289 101.774 9.57058C101.865 9.7142 101.956 10.0034 101.962 10.2295C101.966 10.3906 101.978 10.7661 101.978 10.7661C101.982 10.9097 101.886 11.0301 101.758 11.0388L101.356 11.0679C100.091 11.1349 99.7414 11.197 99.4275 11.2397C97.9438 11.4425 96.3655 11.8957 95.3831 12.7438C94.3689 13.6191 93.6416 14.6517 93.5807 16.379C93.544 17.4241 93.7275 18.5023 94.1989 19.1912C94.6143 19.7987 95.1078 20.2965 95.8555 20.6459C96.5471 20.969 97.5652 21.2398 98.4625 21.2398C98.5156 21.2398 98.5688 21.2398 98.6228 21.2379C99.3038 21.2233 99.9577 21.0962 100.493 20.8972C101.034 20.6964 101.486 20.4441 101.638 20.3189C101.848 20.1461 102.294 19.7929 102.469 19.5522C102.469 19.5522 102.473 19.657 102.479 19.9365C102.481 20.0297 102.474 20.478 102.551 20.5586C102.654 20.6653 102.745 20.6323 103.103 20.6343C104.16 20.6381 106.296 20.643 107.18 20.6323C107.253 20.6323 107.399 20.6265 107.465 20.5595C107.579 20.4421 107.553 20.1199 107.553 19.9705C107.557 17.3979 107.54 13.9743 107.557 11.5318C107.567 10.048 107.351 8.6516 106.497 7.42888L106.496 7.42791ZM102.108 15.4561C102.092 15.8113 102.037 15.9646 101.864 16.2606C101.692 16.5575 101.448 16.7943 101.142 16.9622C100.827 17.1359 100.482 17.2281 100.117 17.2349C99.8679 17.2398 99.64 17.199 99.441 17.1136C99.2584 17.034 99.1213 16.9215 99.0237 16.7701C98.9261 16.6206 98.8769 16.4421 98.873 16.2257C98.8663 15.8967 98.8663 15.7492 99.0643 15.5144C99.2681 15.2737 99.6322 15.132 99.9819 15.0262C100.344 14.9166 100.801 14.8244 101.08 14.8118C101.308 14.8011 101.689 14.7594 101.902 14.838C102.048 14.8923 102.096 14.9651 102.106 15.1068C102.108 15.1398 102.113 15.3261 102.108 15.4561Z"
        fill="black"
      />
      <path
        d="M163.086 7.42791C162.516 6.61179 161.794 5.90145 160.625 5.30076C159.753 4.85243 158.251 4.68164 157.246 4.68164C155.87 4.68164 154.682 4.98053 153.715 5.4832C152.736 5.99267 152.015 6.73115 151.459 7.53562C150.69 8.64772 150.576 10.2169 150.65 10.4604C150.686 10.5808 150.805 10.6371 150.942 10.6371H154.958C155.178 10.6371 155.428 10.64 155.585 10.574C155.771 10.4954 155.778 10.1887 155.783 10.1227C155.807 9.78019 155.892 9.60843 156.138 9.40658C156.393 9.19794 156.813 9.13292 157.253 9.12419C157.524 9.11837 157.769 9.15815 157.984 9.24161C158.175 9.3173 158.273 9.4289 158.364 9.57058C158.455 9.7142 158.546 10.0034 158.552 10.2295C158.556 10.3906 158.568 10.7661 158.568 10.7661C158.572 10.9097 158.476 11.0301 158.348 11.0388L157.946 11.0679C156.681 11.1349 156.331 11.197 156.017 11.2397C154.534 11.4425 152.955 11.8957 151.973 12.7438C150.959 13.6191 150.231 14.6517 150.171 16.379C150.134 17.4241 150.317 18.5023 150.789 19.1912C151.204 19.7987 151.698 20.2965 152.445 20.6459C153.137 20.969 154.155 21.2398 155.052 21.2398C155.105 21.2398 155.159 21.2398 155.213 21.2379C155.894 21.2233 156.548 21.0962 157.083 20.8972C157.624 20.6964 158.076 20.4441 158.228 20.3189C158.438 20.1461 158.884 19.7929 159.059 19.5522C159.059 19.5522 159.063 19.657 159.069 19.9365C159.071 20.0297 159.064 20.478 159.141 20.5586C159.243 20.6653 159.335 20.6323 159.693 20.6343C160.75 20.6381 162.886 20.643 163.77 20.6323C163.843 20.6323 163.989 20.6265 164.055 20.5595C164.169 20.4421 164.143 20.1199 164.143 19.9705C164.147 17.3979 164.13 13.9743 164.147 11.5318C164.157 10.048 163.941 8.6516 163.087 7.42888L163.086 7.42791ZM158.698 15.4561C158.682 15.8113 158.627 15.9646 158.454 16.2606C158.281 16.5575 158.038 16.7943 157.732 16.9622C157.417 17.1359 157.072 17.2281 156.707 17.2349C156.458 17.2398 156.23 17.199 156.031 17.1136C155.848 17.034 155.711 16.9215 155.614 16.7701C155.516 16.6206 155.467 16.4421 155.463 16.2257C155.456 15.8967 155.456 15.7492 155.654 15.5144C155.858 15.2737 156.222 15.132 156.572 15.0262C156.934 14.9166 157.391 14.8244 157.67 14.8118C157.898 14.8011 158.279 14.7594 158.492 14.838C158.638 14.8923 158.686 14.9651 158.696 15.1068C158.698 15.1398 158.704 15.3261 158.698 15.4561Z"
        fill="black"
      />
    </svg>
  );
});

// Banner Slide Component (New design with text overlay)
interface BannerSlideComponentProps {
  slide: BannerSlide;
}

const BannerSlideComponent = memo(function BannerSlideComponent({
  slide,
}: BannerSlideComponentProps) {
  const isHostBanner = slide.isHostBanner;

  return (
    <Link href={slide.linkHref} className="block cursor-pointer">
      {/* Banner Card */}
      <div className="relative border-[1.5px] border-[hsl(var(--snug-border))] rounded-[20px] overflow-hidden aspect-[350/170] bg-white hover:shadow-md transition-shadow">
        {/* Banner Image */}
        <div
          className={`absolute ${isHostBanner ? 'left-0 w-[55%]' : 'right-0 w-[68%]'} top-0 h-full`}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            className={`object-cover ${isHostBanner ? 'object-left' : 'object-right'}`}
            priority
          />
        </div>

        {/* Badge */}
        <div
          className={`absolute top-4 ${isHostBanner ? 'right-3.5' : 'left-3.5'} bg-[#ffecda] px-2 py-1 rounded-[10px] flex items-center justify-center`}
        >
          <span className="text-[11px] font-bold text-[hsl(var(--snug-orange))] tracking-[0.24px] leading-none">
            {slide.badge}
          </span>
        </div>

        {/* Text Content */}
        <div
          className={`absolute ${isHostBanner ? 'right-3.5 left-[45%]' : 'left-3.5 right-[45%]'} top-[45%] -translate-y-1/2`}
        >
          {isHostBanner ? (
            <HostBannerLogo className="w-full h-auto" />
          ) : (
            <LiveLikeLocalLogo className="w-full h-auto" />
          )}
        </div>

        {/* Link Text */}
        <div
          className={`absolute bottom-3.5 ${isHostBanner ? 'right-3.5' : 'left-3.5'} flex items-center gap-1 group`}
        >
          <span
            className={`text-[12px] font-semibold ${isHostBanner ? 'text-[hsl(var(--snug-text-primary))]' : 'text-[hsl(var(--snug-orange))]'}`}
          >
            {slide.linkText}
          </span>
          <ArrowRight
            className={`w-3.5 h-3.5 ${isHostBanner ? 'text-[hsl(var(--snug-text-primary))]' : 'text-[hsl(var(--snug-orange))]'} group-hover:translate-x-0.5 transition-transform`}
          />
        </div>
      </div>

      {/* Caption Bar */}
      <div className="mt-2">
        <div className="rounded-full py-2 px-4 bg-[hsl(var(--snug-light-gray))]">
          <p className="text-[11px] font-bold text-center tracking-tight text-[hsl(var(--snug-text-secondary))]">
            {slide.caption}
          </p>
        </div>
      </div>
    </Link>
  );
});

// Illustration Slide Component
interface IllustrationSlideComponentProps {
  image: string;
  caption: string;
  isEasterEggActive?: boolean;
}

const IllustrationSlideComponent = memo(function IllustrationSlideComponent({
  image,
  caption,
  isEasterEggActive: _isEasterEggActive,
}: IllustrationSlideComponentProps) {
  // TODO: 오픈 후 isEasterEggActive 조건 복원 필요
  // 오픈 전까지는 항상 비디오 표시
  const showVideo = true; // _isEasterEggActive

  return (
    <div>
      {/* Banner Card */}
      <div className="relative border-[1.5px] border-[hsl(var(--snug-border))] rounded-[20px] overflow-hidden aspect-[8/3] bg-white">
        {/* Illustration Image or Video */}
        {showVideo ? (
          <video
            poster="/images/banner/banner-illustration.webp"
            preload="auto"
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover scale-[1.15]"
          >
            <source src="/images/banner/live-banner.webm" type="video/webm" />
            <source src="/images/banner/live-banner.mp4" type="video/mp4" />
          </video>
        ) : (
          <Image
            src={image}
            alt="Snug coworking and living space illustration"
            fill
            className="object-cover object-center"
            priority
          />
        )}

        {/* Favorite Button */}
        <button
          type="button"
          className="absolute top-2 right-2 w-[18px] h-[18px] flex items-center justify-center hover:scale-110 transition-transform z-10"
          aria-label="Add to favorites"
        >
          <Heart
            className="w-4 h-4 text-white drop-shadow-sm"
            fill="white"
            strokeWidth={1}
            stroke="#D8D8D8"
          />
        </button>
      </div>

      {/* Caption Bar */}
      <div className="mt-2">
        <div
          className={`rounded-full py-2 px-4 ${showVideo ? 'bg-[hsl(var(--snug-orange))]/10' : 'bg-[hsl(var(--snug-light-gray))]'}`}
        >
          <p
            className={`text-[11px] font-bold text-center tracking-tight ${showVideo ? 'text-[hsl(var(--snug-orange))]' : 'text-[hsl(var(--snug-text-primary))]'}`}
          >
            {showVideo ? 'Snug Living in Korea, Made Easy.' : caption}
          </p>
        </div>
      </div>
    </div>
  );
});
