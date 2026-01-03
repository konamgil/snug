'use client';

import { GoogleMap, OverlayView } from '@react-google-maps/api';
import { LocationIcon, SnugMarkerIcon } from '@/shared/ui/icons';
import { useGoogleMaps } from '@/shared/providers';

interface RoomDetailMapProps {
  lat: number;
  lng: number;
}

export function RoomDetailMap({ lat, lng }: RoomDetailMapProps) {
  const { isLoaded } = useGoogleMaps();

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-[#f5f5f5]">
        <LocationIcon className="w-8 h-8 text-[hsl(var(--snug-gray))]/30" />
        <span className="text-xs text-[hsl(var(--snug-gray))]">Loading map...</span>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100%' }}
      center={{ lat, lng }}
      zoom={15}
      options={{
        disableDefaultUI: true,
        zoomControl: false,
      }}
    >
      <OverlayView position={{ lat, lng }} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
        <div className="relative" style={{ transform: 'translate(-50%, -100%)' }}>
          <SnugMarkerIcon className="w-[62px] h-[50px]" />
        </div>
      </OverlayView>
    </GoogleMap>
  );
}

export function RoomDetailMapSkeleton() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-[#f5f5f5] animate-pulse">
      <LocationIcon className="w-8 h-8 text-[hsl(var(--snug-gray))]/30" />
      <span className="text-xs text-[hsl(var(--snug-gray))]">Map View</span>
    </div>
  );
}
