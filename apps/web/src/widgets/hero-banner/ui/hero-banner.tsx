'use client';

import { useState, useEffect, useCallback, memo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Heart, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { LocationIcon } from '@/shared/ui/icons';
import Image from 'next/image';
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

type Slide = RoomSlide | TourSlide | IllustrationSlide;

// Mock data
const mockSlides: Slide[] = [
  {
    type: 'illustration',
    image: '/images/banner/banner-illustration.webp',
    captionKey: 'slide1',
  },
  {
    type: 'rooms',
    rooms: [
      {
        id: '1',
        image: '/images/rooms/room-1.jpg',
        tags: [
          { label: 'Shared Room', color: 'orange' },
          { label: 'Hotel', color: 'purple' },
        ],
        location: 'Gangnam-gu',
        originalPrice: 200,
        price: 160,
        nights: 1,
        imageCount: 10,
        currentImageIndex: 0,
      },
      {
        id: '2',
        image: '/images/rooms/room-2.jpg',
        tags: [
          { label: 'Shared House', color: 'orange' },
          { label: 'Hotel', color: 'purple' },
        ],
        location: 'Seocho-gu',
        price: 130,
        nights: 1,
        imageCount: 10,
        currentImageIndex: 0,
      },
    ],
  },
  {
    type: 'rooms',
    rooms: [
      {
        id: '3',
        image: '/images/rooms/room-3.jpg',
        tags: [
          { label: 'Shared Room', color: 'orange' },
          { label: 'Hotel', color: 'purple' },
        ],
        location: 'Mapo-gu',
        price: 120,
        nights: 1,
        imageCount: 8,
        currentImageIndex: 0,
      },
      {
        id: '4',
        image: '/images/rooms/room-4.jpg',
        tags: [{ label: 'Shared House', color: 'orange' }],
        location: 'Yongsan-gu',
        originalPrice: 180,
        price: 150,
        nights: 1,
        imageCount: 12,
        currentImageIndex: 0,
      },
    ],
  },
  {
    type: 'tour',
    tour: {
      id: 'tour-1',
      image: '/images/tours/bukchon.jpg',
      location: 'Seoul · Tour',
      title: 'Welcome to Bukchon Hanok Village',
      pricePerPerson: 15,
    },
  },
  {
    type: 'rooms',
    rooms: [
      {
        id: '5',
        image: '/images/rooms/room-5.jpg',
        tags: [{ label: 'Shared Room', color: 'orange' }],
        location: 'Jongno-gu',
        price: 140,
        nights: 1,
        imageCount: 6,
        currentImageIndex: 0,
      },
      {
        id: '6',
        image: '/images/rooms/room-6.jpg',
        tags: [
          { label: 'Shared House', color: 'orange' },
          { label: 'Hotel', color: 'purple' },
        ],
        location: 'Songpa-gu',
        originalPrice: 220,
        price: 180,
        nights: 1,
        imageCount: 15,
        currentImageIndex: 0,
      },
    ],
  },
  {
    type: 'tour',
    tour: {
      id: 'tour-2',
      image: '/images/tours/namsan.jpg',
      location: 'Seoul · Tour',
      title: 'Namsan Tower Night View Experience',
      pricePerPerson: 25,
    },
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
    const duration = isEasterEggActive && isOnIllustrationSlide ? 10000 : 5000;

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
              {slide.type === 'illustration' ? (
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
              ) : (
                <TourSlideComponent
                  tour={slide.tour}
                  isFavorite={favorites.has(slide.tour.id)}
                  onFavoriteToggle={toggleFavorite}
                  onTourClick={handleTourClick}
                  onBookClick={handleBookClick}
                />
              )}
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
    <div className="flex-1 cursor-pointer group flex flex-col h-full" onClick={onClick}>
      {/* Image Container */}
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[hsl(var(--snug-light-gray))] flex-shrink-0">
        {/* Placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <ImageIcon className="w-10 h-10 text-[hsl(var(--snug-gray))]/30" />
        </div>

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
              for {room.nights} nights
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

// Illustration Slide Component
interface IllustrationSlideComponentProps {
  image: string;
  caption: string;
  isEasterEggActive?: boolean;
}

const IllustrationSlideComponent = memo(function IllustrationSlideComponent({
  image,
  caption,
  isEasterEggActive,
}: IllustrationSlideComponentProps) {
  return (
    <div>
      {/* Banner Card */}
      <div className="relative border-[1.5px] border-[hsl(var(--snug-border))] rounded-[20px] overflow-hidden aspect-[8/3] bg-white">
        {/* Illustration Image or Video */}
        {isEasterEggActive ? (
          <video
            src="/images/banner/live-banner.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover scale-[1.15]"
          />
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
          className={`rounded-full py-2 px-4 ${isEasterEggActive ? 'bg-[hsl(var(--snug-orange))]/10' : 'bg-[hsl(var(--snug-light-gray))]'}`}
        >
          <p
            className={`text-[11px] font-bold text-center tracking-tight ${isEasterEggActive ? 'text-[hsl(var(--snug-orange))]' : 'text-[hsl(var(--snug-text-primary))]'}`}
          >
            {isEasterEggActive ? 'Snug Living in Korea, Made Easy.' : caption}
          </p>
        </div>
      </div>
    </div>
  );
});
