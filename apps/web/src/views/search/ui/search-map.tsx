'use client';

import { useCallback, useState } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';
import type { Room } from './room-card';

interface SearchMapProps {
  rooms: Room[];
  onRoomSelect?: (roomId: string) => void;
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
  fullscreenControl: true,
};

function createPriceMarkerIcon(price: number, isSelected: boolean): string {
  const bgColor = isSelected ? '%23ff7900' : '%236B4423';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="30"><rect x="0" y="0" width="60" height="30" rx="15" fill="${bgColor}"/><text x="30" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold" font-family="Arial">$${price}</text></svg>`;
  return `data:image/svg+xml,${svg}`;
}

export function SearchMap({ rooms, onRoomSelect }: SearchMapProps) {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  const onMapClick = useCallback(() => {
    setSelectedRoom(null);
  }, []);

  const handleMarkerClick = (room: Room) => {
    setSelectedRoom(room);
    onRoomSelect?.(room.id);
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
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={defaultCenter}
      zoom={15}
      options={mapOptions}
      onClick={onMapClick}
    >
      {rooms.map((room) => (
        <MarkerF
          key={room.id}
          position={{ lat: room.lat, lng: room.lng }}
          onClick={() => handleMarkerClick(room)}
          icon={{
            url: createPriceMarkerIcon(room.price, selectedRoom?.id === room.id),
            scaledSize: new google.maps.Size(60, 30),
            anchor: new google.maps.Point(30, 15),
          }}
        />
      ))}

      {selectedRoom && (
        <InfoWindowF
          position={{ lat: selectedRoom.lat, lng: selectedRoom.lng }}
          onCloseClick={() => setSelectedRoom(null)}
          options={{ pixelOffset: new google.maps.Size(0, -20) }}
        >
          <div className="p-2 min-w-[200px]">
            <h3 className="font-semibold text-sm mb-1">
              {selectedRoom.location}, {selectedRoom.district}
            </h3>
            <p className="text-xs text-gray-500 mb-1">
              {selectedRoom.rooms} Rooms · {selectedRoom.bathrooms} Bath · {selectedRoom.beds} Bed
            </p>
            <p className="text-sm font-bold text-[#ff7900]">
              ${selectedRoom.price}
              <span className="font-normal text-gray-500 ml-1">
                for {selectedRoom.nights} nights
              </span>
            </p>
          </div>
        </InfoWindowF>
      )}
    </GoogleMap>
  );
}
