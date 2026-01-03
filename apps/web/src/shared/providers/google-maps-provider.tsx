'use client';

import { createContext, useContext, useMemo, ReactNode } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';

/**
 * Shared Google Maps configuration
 * All map components must use this single loader to avoid conflicts
 */
const GOOGLE_MAPS_ID = 'google-maps-script';
const GOOGLE_MAPS_LIBRARIES: ('places' | 'marker')[] = ['places', 'marker'];

interface GoogleMapsContextType {
  isLoaded: boolean;
  loadError: Error | undefined;
}

const GoogleMapsContext = createContext<GoogleMapsContextType>({
  isLoaded: false,
  loadError: undefined,
});

interface GoogleMapsProviderProps {
  children: ReactNode;
}

export function GoogleMapsProvider({ children }: GoogleMapsProviderProps) {
  const libraries = useMemo(() => GOOGLE_MAPS_LIBRARIES, []);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    id: GOOGLE_MAPS_ID,
    libraries,
  });

  const value = useMemo(() => ({ isLoaded, loadError }), [isLoaded, loadError]);

  return <GoogleMapsContext.Provider value={value}>{children}</GoogleMapsContext.Provider>;
}

export function useGoogleMaps() {
  const context = useContext(GoogleMapsContext);
  if (context === undefined) {
    throw new Error('useGoogleMaps must be used within a GoogleMapsProvider');
  }
  return context;
}
