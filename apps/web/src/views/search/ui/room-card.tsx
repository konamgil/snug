'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  Heart,
  Home,
  Bath,
  BedDouble,
  Users,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
} from 'lucide-react';

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
  isFavorite?: boolean;
  lat: number;
  lng: number;
}

interface RoomCardProps {
  room: Room;
  viewMode?: 'list' | 'grid' | 'mobile';
  onFavoriteToggle?: (id: string) => void;
}

// First tag - soft background
const tagFirstColors = {
  orange: 'bg-[#FDEEE5] text-[hsl(var(--snug-orange))]',
  purple: 'bg-pink-100 text-pink-500',
  blue: 'bg-blue-100 text-blue-500',
  green: 'bg-green-100 text-green-500',
};

// Second+ tags - solid background with white text
const tagSecondColors = {
  orange: 'bg-[hsl(var(--snug-orange))] text-white',
  purple: 'bg-[#EF8BAC] text-white',
  blue: 'bg-blue-400 text-white',
  green: 'bg-green-400 text-white',
};

export function RoomCard({ room, viewMode = 'list', onFavoriteToggle }: RoomCardProps) {
  const locale = useLocale();
  const [isFavorite, setIsFavorite] = useState(room.isFavorite || false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const totalImages = 10; // Mock total images
  const roomDetailUrl = `/${locale}/room/${room.id}`;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    onFavoriteToggle?.(room.id);
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
      <Link href={roomDetailUrl} className="group cursor-pointer block">
        {/* Image Container - Larger aspect ratio for mobile */}
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
          {/* Placeholder Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--snug-light-gray))] to-[hsl(var(--snug-border))] flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-[hsl(var(--snug-gray))]/30" />
          </div>

          {/* Tags - Top Left */}
          <div className="absolute top-3 left-3 flex gap-2">
            {room.tags.map((tag, index) => (
              <span
                key={tag.label}
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
            <Heart
              className={`w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white drop-shadow-md'}`}
              fill={isFavorite ? 'currentColor' : 'none'}
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
            <Home className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              {room.rooms} Rooms · {room.bathrooms} Bathroom · {room.beds} Bed
            </span>
          </div>

          {/* Guests */}
          <div className="flex items-center gap-1.5 text-[13px] text-[hsl(var(--snug-gray))] mb-2.5">
            <Users className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{room.guests} Guests</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1.5">
            {room.originalPrice && (
              <span className="text-[13px] text-[hsl(var(--snug-gray))] line-through">
                ${room.originalPrice}
              </span>
            )}
            <span className="text-[17px] font-bold text-[hsl(var(--snug-orange))]">
              ${room.price}
            </span>
            <span className="text-[13px] text-[hsl(var(--snug-gray))]">
              for {room.nights} nights
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // Grid View
  if (viewMode === 'grid') {
    return (
      <Link href={roomDetailUrl} className="group cursor-pointer block">
        {/* Image Container */}
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
          {/* Placeholder Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--snug-light-gray))] to-[hsl(var(--snug-border))] flex items-center justify-center">
            <ImageIcon className="w-10 h-10 text-[hsl(var(--snug-gray))]/30" />
          </div>

          {/* Tags - Top Left */}
          <div className="absolute top-2.5 left-2.5 flex gap-1.5">
            {room.tags.map((tag, index) => (
              <span
                key={tag.label}
                className={`px-2.5 py-1 text-[10px] font-semibold rounded-full ${
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
            className="absolute top-2.5 right-2.5 p-1.5 bg-white/90 rounded-full hover:bg-white transition-colors"
          >
            <Heart
              className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
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
            <Home className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              {room.rooms} Rooms · {room.bathrooms} Bathroom · {room.beds} Bed
            </span>
          </div>

          {/* Guests */}
          <div className="flex items-center gap-1 text-xs text-[hsl(var(--snug-gray))] mb-2">
            <Users className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{room.guests} Guests</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1.5">
            {room.originalPrice && (
              <span className="text-sm text-[hsl(var(--snug-gray))] line-through">
                ${room.originalPrice}
              </span>
            )}
            <span className="text-base font-bold text-[hsl(var(--snug-orange))]">
              ${room.price}
            </span>
            <span className="text-xs text-[hsl(var(--snug-gray))]">for {room.nights} nights</span>
          </div>
        </div>
      </Link>
    );
  }

  // List View (default)
  return (
    <Link
      href={roomDetailUrl}
      className="flex gap-3 py-3 hover:bg-[hsl(var(--snug-light-gray))]/50 transition-colors"
    >
      {/* Image */}
      <div className="relative w-[120px] h-[90px] flex-shrink-0 rounded-lg overflow-hidden">
        {/* Placeholder Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--snug-light-gray))] to-[hsl(var(--snug-border))] flex items-center justify-center">
          <ImageIcon className="w-6 h-6 text-[hsl(var(--snug-gray))]/30" />
        </div>
        <button
          type="button"
          onClick={handleFavoriteClick}
          className="absolute top-1.5 left-1.5 p-1 bg-white/80 rounded-full hover:bg-white transition-colors"
        >
          <Heart
            className={`w-3.5 h-3.5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500'}`}
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
                key={tag.label}
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
            <Home className="w-3 h-3" />
            {room.rooms}R
          </span>
          <span>·</span>
          <span className="flex items-center gap-0.5">
            <Bath className="w-3 h-3" />
            {room.bathrooms}B
          </span>
          <span>·</span>
          <span className="flex items-center gap-0.5">
            <BedDouble className="w-3 h-3" />
            {room.beds}Bed
          </span>
          <span>·</span>
          <span className="flex items-center gap-0.5">
            <Users className="w-3 h-3" />
            {room.guests}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 mt-1">
          {room.originalPrice && (
            <span className="text-xs text-[hsl(var(--snug-gray))] line-through">
              ${room.originalPrice}
            </span>
          )}
          <span className="text-base font-bold text-[hsl(var(--snug-orange))]">${room.price}</span>
          <span className="text-xs text-[hsl(var(--snug-gray))]">/ {room.nights}nights</span>
        </div>
      </div>
    </Link>
  );
}
