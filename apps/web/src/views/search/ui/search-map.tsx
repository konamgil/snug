'use client';

import { useCallback, useState, useRef } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { X, ImageIcon } from 'lucide-react';
import { HeartIcon, HotelIcon, UserIcon } from '@/shared/ui/icons';
import { useCurrencySafe } from '@/shared/providers';
import type { Room } from './room-card';

interface SearchMapProps {
  rooms: Room[];
  initialCenter?: { lat: number; lng: number };
  onRoomSelect?: (roomId: string | null) => void;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

// Gangnam-gu center
const defaultCenter = {
  lat: 37.5172,
  lng: 127.0473,
};

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
};

function createPriceMarkerIcon(formattedPrice: string, isSelected: boolean): string {
  const bgColor = isSelected ? '%23ff7900' : '%236B7280';
  // URL encode the formatted price for SVG data URI
  const encodedPrice = encodeURIComponent(formattedPrice);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="30"><rect x="0" y="0" width="80" height="30" rx="15" fill="${bgColor}"/><text x="40" y="20" text-anchor="middle" fill="white" font-size="10" font-weight="bold" font-family="Arial">${encodedPrice}</text></svg>`;
  return `data:image/svg+xml,${svg}`;
}

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

export function SearchMap({ rooms, initialCenter, onRoomSelect }: SearchMapProps) {
  const locale = useLocale();
  const { format } = useCurrencySafe();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    id: 'google-map-script',
  });

  const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
    mapRef.current = mapInstance;
  }, []);

  const onMapClick = useCallback(() => {
    setSelectedRoom(null);
    onRoomSelect?.(null);
  }, [onRoomSelect]);

  const handleMarkerClick = (room: Room) => {
    setSelectedRoom(room);
    setIsFavorite(room.isFavorite || false);
    onRoomSelect?.(room.id);

    // Pan map to show marker above the bottom card
    if (mapRef.current) {
      const offsetLat = room.lat - 0.003; // Offset to position marker above center
      mapRef.current.panTo({ lat: offsetLat, lng: room.lng });
    }
  };

  const handleClose = () => {
    setSelectedRoom(null);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[hsl(var(--snug-light-gray))]">
        <p className="text-[hsl(var(--snug-gray))]">Failed to load map</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[hsl(var(--snug-light-gray))]">
        <p className="text-[hsl(var(--snug-gray))]">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={initialCenter || defaultCenter}
        zoom={15}
        options={mapOptions}
        onLoad={onMapLoad}
        onClick={onMapClick}
      >
        {rooms.map((room) => (
          <MarkerF
            key={room.id}
            position={{ lat: room.lat, lng: room.lng }}
            onClick={() => handleMarkerClick(room)}
            icon={{
              url: createPriceMarkerIcon(
                format(room.price, { compact: true }),
                selectedRoom?.id === room.id,
              ),
              scaledSize: new google.maps.Size(80, 30),
              anchor: new google.maps.Point(40, 15),
            }}
          />
        ))}
      </GoogleMap>

      {/* Selected Room Card - Mobile only */}
      {selectedRoom && (
        <div className="absolute bottom-0 left-0 right-0 z-10 md:hidden">
          {/* Close Button */}
          <div className="flex justify-end px-4 pb-3">
            <button
              type="button"
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-md"
            >
              <X className="w-4 h-4 text-[hsl(var(--snug-text-primary))] drop-shadow-sm" />
            </button>
          </div>

          {/* Room Card */}
          <Link
            href={`/${locale}/room/${selectedRoom.id}`}
            className="block mx-4 mb-4 bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Image */}
            <div className="relative aspect-[16/10]">
              {selectedRoom.imageUrl ? (
                <Image
                  src={selectedRoom.imageUrl}
                  alt={selectedRoom.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--snug-light-gray))] to-[hsl(var(--snug-border))] flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-[hsl(var(--snug-gray))]/30" />
                </div>
              )}

              {/* Tags */}
              <div className="absolute top-3 left-3 flex gap-2">
                {selectedRoom.tags.map((tag, index) => (
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

              {/* Favorite Button */}
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
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Location */}
              <h3 className="text-[15px] font-semibold text-[hsl(var(--snug-text-primary))] mb-1.5">
                {selectedRoom.location}, {selectedRoom.district}
              </h3>

              {/* Room Info */}
              <div className="flex items-center gap-1.5 text-[13px] text-[hsl(var(--snug-gray))] mb-0.5">
                <HotelIcon className="w-3.5 h-3.5 flex-shrink-0" />
                <span>
                  {selectedRoom.rooms} Rooms · {selectedRoom.bathrooms} Bathroom ·{' '}
                  {selectedRoom.beds} Bed
                </span>
              </div>

              {/* Guests */}
              <div className="flex items-center gap-1.5 text-[13px] text-[hsl(var(--snug-gray))] mb-2.5">
                <UserIcon className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{selectedRoom.guests} Guests</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1.5">
                {selectedRoom.originalPrice && (
                  <span className="text-[13px] text-[hsl(var(--snug-gray))] line-through">
                    {format(selectedRoom.originalPrice)}
                  </span>
                )}
                <span className="text-[17px] font-bold text-[hsl(var(--snug-orange))]">
                  {format(selectedRoom.price)}
                </span>
                <span className="text-[13px] text-[hsl(var(--snug-gray))]">
                  for {selectedRoom.nights} nights
                </span>
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
