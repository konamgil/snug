'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { X, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import type { AccommodationListItem } from '@snug/types';
import {
  HeartIcon,
  HotelIcon,
  UserIcon,
  LocationIcon,
  AreaIcon,
  ElevatorIcon,
  ParkingIcon,
  RoomIcon,
  LivingRoomIcon,
  BathroomIcon,
  KitchenIcon,
  FloorIcon,
  BalconyIcon,
} from '@/shared/ui/icons';
import { getSimilarAccommodations } from '@/shared/api/accommodation';
import type { AccommodationFormData } from './types';
import {
  FACILITY_OPTIONS,
  AMENITY_OPTIONS,
  ACCOMMODATION_TYPE_OPTIONS,
  USAGE_TYPE_OPTIONS,
} from './types';

// Detail icons mapping
const detailIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  area: AreaIcon,
  elevator: ElevatorIcon,
  parking: ParkingIcon,
  room: RoomIcon,
  living: LivingRoomIcon,
  bathroom: BathroomIcon,
  kitchen: KitchenIcon,
  floor: FloorIcon,
  balcony: BalconyIcon,
};

// Map configuration
const mapContainerStyle = {
  width: '100%',
  height: '250px',
  borderRadius: '20px',
};

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
};

// Default center (Gangnam-gu)
const defaultCenter = {
  lat: 37.5172,
  lng: 127.0473,
};

interface AccommodationPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AccommodationFormData;
  accommodationId?: string; // 편집 모드에서만 제공 (유사 숙소 조회용)
}

export function AccommodationPreviewModal({
  isOpen,
  onClose,
  data,
  accommodationId,
}: AccommodationPreviewModalProps) {
  const t = useTranslations('host.accommodation.preview');
  const tDetails = useTranslations('host.accommodation.details');

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    description: true,
    guidelines: true,
    details: true,
    facilities: true,
    amenities: true,
    location: true,
    refundPolicy: false,
    longTermDiscount: false,
    notes: false,
  });

  // Map state
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);

  // Similar accommodations state
  const [similarAccommodations, setSimilarAccommodations] = useState<AccommodationListItem[]>([]);
  const [isSimilarLoading, setIsSimilarLoading] = useState(false);

  // Load Google Maps
  const { isLoaded: isMapLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    id: 'google-map-script',
  });

  // Geocode address to get coordinates
  useEffect(() => {
    if (!isOpen || !isMapLoaded || !data.address) {
      setMapCenter(null);
      return;
    }

    // If coordinates are already provided, use them
    if (data.latitude && data.longitude) {
      setMapCenter({ lat: data.latitude, lng: data.longitude });
      return;
    }

    // Otherwise, geocode the address
    const geocoder = new google.maps.Geocoder();
    setIsGeocodingLoading(true);

    geocoder.geocode({ address: data.address }, (results, status) => {
      setIsGeocodingLoading(false);
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        setMapCenter({ lat: location.lat(), lng: location.lng() });
      } else {
        // Fallback to default center if geocoding fails
        setMapCenter(defaultCenter);
      }
    });
  }, [isOpen, isMapLoaded, data.address, data.latitude, data.longitude]);

  // Fetch similar accommodations when modal opens and ID is available
  useEffect(() => {
    if (!isOpen || !accommodationId) {
      setSimilarAccommodations([]);
      return;
    }

    const fetchSimilar = async () => {
      setIsSimilarLoading(true);
      try {
        const similar = await getSimilarAccommodations(accommodationId, 6);
        setSimilarAccommodations(similar);
      } catch (error) {
        console.error('[AccommodationPreviewModal] Failed to fetch similar:', error);
        setSimilarAccommodations([]);
      } finally {
        setIsSimilarLoading(false);
      }
    };

    fetchSimilar();
  }, [isOpen, accommodationId]);

  const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
    mapRef.current = mapInstance;
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  if (!isOpen) return null;

  const getMainPhoto = () => {
    const mainCategory = data.mainPhotos.find((c) => c.id === 'main');
    if (mainCategory && mainCategory.photos.length > 0) {
      return mainCategory.photos[0];
    }
    for (const category of data.mainPhotos) {
      if (category.photos.length > 0) return category.photos[0];
    }
    return null;
  };

  const mainPhoto = getMainPhoto();
  const allPhotos = data.mainPhotos.flatMap((cat) => cat.photos);
  const photoCount = allPhotos.length;

  const getTotalBeds = () => {
    const beds = data.space.beds;
    return beds.king + beds.queen + beds.single + beds.superSingle + beds.bunkBed;
  };

  const getUsageTypeBadges = () => {
    return data.usageTypes.map((type) => {
      const option = USAGE_TYPE_OPTIONS.find((o) => o.id === type);
      return option?.label || type;
    });
  };

  const getAccommodationTypeBadge = () => {
    const option = ACCOMMODATION_TYPE_OPTIONS.find((o) => o.id === data.accommodationType);
    return option?.label || data.accommodationType;
  };

  const getFacilityLabels = () => {
    return data.facilities.map((id) => {
      const option = FACILITY_OPTIONS.find((o) => o.id === id);
      return option?.label || id;
    });
  };

  const getAmenityLabels = () => {
    return data.amenities.map((id) => {
      const option = AMENITY_OPTIONS.find((o) => o.id === id);
      return option?.label || id;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal - 740px width as per Figma */}
      <div className="relative w-[740px] max-h-[90vh] bg-white shadow-xl overflow-hidden flex flex-col">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
        >
          <X className="w-5 h-5 text-[#161616]" />
        </button>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="px-5 py-10">
            {/* Hero Image Section */}
            <div className="relative w-[700px] h-[467px] mb-5 rounded-lg overflow-hidden bg-[#f4f4f4]">
              {mainPhoto ? (
                <Image src={mainPhoto.url} alt="Main photo" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-[#6f6f6f]">{t('noPhotos')}</p>
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-5 left-5 flex gap-1">
                {getUsageTypeBadges().map((badge, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 text-[10px] font-medium bg-[hsl(var(--snug-orange))] text-white rounded"
                  >
                    {badge}
                  </span>
                ))}
                <span className="px-2 py-0.5 text-[10px] font-medium bg-[#e0e0e0] text-[#161616] rounded">
                  {getAccommodationTypeBadge()}
                </span>
              </div>

              {/* Photo Count Badge */}
              {photoCount > 1 && (
                <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/60 rounded text-xs text-white">
                  1 / {photoCount}
                </div>
              )}
            </div>

            {/* Title Section */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-[#161616]">
                  {data.address || <span className="text-[#a8a8a8]">{t('addressNotEntered')}</span>}
                </h2>
                <HeartIcon className="w-[18px] h-[18px] text-[#161616]" />
              </div>

              {/* Room Info */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-xs text-[#6f6f6f]">
                  <HotelIcon className="w-3.5 h-3.5" />
                  <span>{t('rooms', { count: data.space.rooms.room || 0 })}</span>
                  <span>·</span>
                  <span>{t('bathrooms', { count: data.space.rooms.bathroom || 0 })}</span>
                  <span>·</span>
                  <span>{t('beds', { count: getTotalBeds() || 0 })}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#6f6f6f]">
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>{t('guests', { count: data.space.capacity || 0 })}</span>
                </div>
              </div>
            </div>

            {/* Stay Description */}
            <Section
              title={t('stayDescription')}
              expanded={expandedSections.description}
              onToggle={() => toggleSection('description')}
            >
              <p className="text-xs font-medium text-[#161616] mb-1">
                {data.roomName || <span className="text-[#a8a8a8]">{t('roomNameNotEntered')}</span>}
              </p>
              <p className="text-xs text-[#6f6f6f] leading-relaxed">
                {data.space.introduction || (
                  <span className="text-[#a8a8a8]">{t('descriptionNotEntered')}</span>
                )}
              </p>
            </Section>

            {/* Guidelines */}
            <Section
              title={t('guidelines')}
              expanded={expandedSections.guidelines}
              onToggle={() => toggleSection('guidelines')}
            >
              <p className="text-xs text-[#6f6f6f] leading-relaxed whitespace-pre-line">
                {data.space.houseRules || (
                  <span className="text-[#a8a8a8]">{t('guidelinesNotEntered')}</span>
                )}
              </p>
            </Section>

            {/* Details */}
            <Section
              title={t('details')}
              expanded={expandedSections.details}
              onToggle={() => toggleSection('details')}
            >
              {/* Row 1 - Area */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <DetailIconItem
                  icon="area"
                  label={tDetails('area')}
                  value={data.space.sizeM2 ? `${data.space.sizeM2}m²` : '-'}
                />
                <DetailIconItem
                  icon="area"
                  label={tDetails('pyeong')}
                  value={data.space.sizePyeong ? `${data.space.sizePyeong}평` : '-'}
                />
                <div />
              </div>

              <div className="border-t border-[#e0e0e0] my-4" />

              {/* Row 2 - Rooms */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                <DetailIconItem
                  icon="room"
                  label={tDetails('room')}
                  value={String(data.space.rooms.room || 0)}
                />
                <DetailIconItem
                  icon="living"
                  label={tDetails('livingRoom')}
                  value={String(data.space.rooms.livingRoom || 0)}
                />
                <DetailIconItem
                  icon="bathroom"
                  label={tDetails('bathroom')}
                  value={String(data.space.rooms.bathroom || 0)}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <DetailIconItem
                  icon="kitchen"
                  label={tDetails('kitchen')}
                  value={String(data.space.rooms.kitchen || 0)}
                />
                <DetailIconItem
                  icon="balcony"
                  label={tDetails('terrace')}
                  value={String(data.space.rooms.terrace || 0)}
                />
                <div />
              </div>
            </Section>

            {/* Facilities */}
            <Section
              title={t('facilities')}
              expanded={expandedSections.facilities}
              onToggle={() => toggleSection('facilities')}
            >
              {getFacilityLabels().length > 0 ? (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                    {getFacilityLabels()
                      .slice(0, 9)
                      .map((facility, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs text-[#161616]">
                          <span className="w-1.5 h-1.5 bg-[#161616] rounded-full flex-shrink-0" />
                          <span>{facility}</span>
                        </div>
                      ))}
                  </div>
                  {getFacilityLabels().length > 9 && (
                    <button
                      type="button"
                      className="w-full py-3 border border-[#e0e0e0] rounded-xl text-xs font-medium text-[#161616] hover:bg-[#f4f4f4] transition-colors"
                    >
                      {t('viewMore', { count: getFacilityLabels().length - 9 })}
                    </button>
                  )}
                </>
              ) : (
                <p className="text-xs text-[#a8a8a8]">{t('selectFacilities')}</p>
              )}
            </Section>

            {/* House Amenities */}
            <Section
              title={t('houseAmenities')}
              expanded={expandedSections.amenities}
              onToggle={() => toggleSection('amenities')}
            >
              {getAmenityLabels().length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {getAmenityLabels().map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-[#161616]">
                      <span className="w-1.5 h-1.5 bg-[#161616] rounded-full flex-shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#a8a8a8]">{t('selectAmenities')}</p>
              )}
            </Section>

            {/* Location */}
            <Section
              title={t('location')}
              expanded={expandedSections.location}
              onToggle={() => toggleSection('location')}
            >
              <p className="text-xs text-[#161616] mb-3">
                {data.address || <span className="text-[#a8a8a8]">{t('addressNotEntered')}</span>}
              </p>

              {/* Map */}
              <div className="w-full h-[250px] rounded-[20px] overflow-hidden border border-[#e0e0e0]">
                {!isMapLoaded || isGeocodingLoading ? (
                  <div className="w-full h-full bg-[#f4f4f4] flex flex-col items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-[hsl(var(--snug-orange))] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-[#6f6f6f]">{t('mapLoading')}</span>
                  </div>
                ) : !data.address ? (
                  <div className="w-full h-full bg-[#f4f4f4] flex flex-col items-center justify-center gap-2">
                    <LocationIcon className="w-8 h-8 text-[hsl(var(--snug-gray))]/30" />
                    <span className="text-xs text-[#6f6f6f]">{t('enterAddressForMap')}</span>
                  </div>
                ) : mapCenter ? (
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={mapCenter}
                    zoom={16}
                    options={mapOptions}
                    onLoad={onMapLoad}
                  >
                    <MarkerF position={mapCenter} />
                  </GoogleMap>
                ) : (
                  <div className="w-full h-full bg-[#f4f4f4] flex flex-col items-center justify-center gap-2">
                    <LocationIcon className="w-8 h-8 text-[hsl(var(--snug-gray))]/30" />
                    <span className="text-xs text-[#6f6f6f]">{t('mapLoadError')}</span>
                  </div>
                )}
              </div>
            </Section>

            {/* Pricing Information */}
            <Section
              title={t('pricingInfo')}
              expanded={true}
              onToggle={() => {}}
              showToggle={false}
            >
              <div className="space-y-3">
                {/* Base Price */}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#6f6f6f]">{t('basePrice')}</span>
                  <span className="text-xs font-semibold text-[#161616]">
                    {data.pricing.basePrice > 0 ? (
                      `₩${data.pricing.basePrice.toLocaleString()}`
                    ) : (
                      <span className="text-[#a8a8a8]">{t('notEntered')}</span>
                    )}
                  </span>
                </div>

                {/* Weekend Price */}
                {data.pricing.weekendPrice && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#6f6f6f]">{t('weekendPrice')}</span>
                    <span className="text-xs font-semibold text-[#161616]">
                      ₩{data.pricing.weekendPrice.toLocaleString()}
                    </span>
                  </div>
                )}

                {/* Management Fee */}
                {data.pricing.managementFee && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#6f6f6f]">{t('managementFee')}</span>
                    <span className="text-xs font-semibold text-[#161616]">
                      ₩{data.pricing.managementFee.toLocaleString()}
                    </span>
                  </div>
                )}

                {/* Cleaning Fee */}
                {data.pricing.cleaningFee && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#6f6f6f]">{t('cleaningFee')}</span>
                    <span className="text-xs font-semibold text-[#161616]">
                      ₩{data.pricing.cleaningFee.toLocaleString()}
                    </span>
                  </div>
                )}

                {/* Extra Person Fee */}
                {data.pricing.extraPersonFee && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#6f6f6f]">{t('extraPersonFee')}</span>
                    <span className="text-xs font-semibold text-[#161616]">
                      ₩{data.pricing.extraPersonFee.toLocaleString()}
                    </span>
                  </div>
                )}

                {/* Pet Fee */}
                {data.pricing.petFee && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#6f6f6f]">{t('petFee')}</span>
                    <span className="text-xs font-semibold text-[#161616]">
                      ₩{data.pricing.petFee.toLocaleString()}
                    </span>
                  </div>
                )}

                {/* Additional Fees */}
                {data.pricing.additionalFees?.length > 0 &&
                  data.pricing.additionalFees.map((fee) => (
                    <div key={fee.id} className="flex justify-between items-center">
                      <span className="text-xs text-[#6f6f6f]">{fee.name}</span>
                      <span className="text-xs font-semibold text-[#161616]">
                        ₩{fee.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}

                {/* Utilities Included */}
                <div className="pt-2 border-t border-[#e0e0e0]">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${data.pricing.includesUtilities ? 'bg-green-500' : 'bg-[#a8a8a8]'}`}
                    />
                    <span className="text-xs text-[#6f6f6f]">
                      {data.pricing.includesUtilities
                        ? t('utilitiesIncluded')
                        : t('utilitiesExcluded')}
                    </span>
                  </div>
                </div>
              </div>
            </Section>

            {/* Manager Info */}
            {data.managers.length > 0 && (
              <Section
                title={t('managerInfo')}
                expanded={true}
                onToggle={() => {}}
                showToggle={false}
              >
                <div className="space-y-3">
                  {data.managers.map((manager) => (
                    <div key={manager.id} className="flex justify-between items-center">
                      <span className="text-xs text-[#161616] font-medium">{manager.name}</span>
                      <span className="text-xs text-[#6f6f6f]">{manager.phone}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Other Stays You May Like */}
            <Section
              title={t('otherStaysYouMayLike')}
              expanded={true}
              onToggle={() => {}}
              showToggle={false}
            >
              {isSimilarLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-[hsl(var(--snug-orange))] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : !accommodationId ? (
                <p className="text-xs text-[#a8a8a8] text-center py-4">{t('showAfterSave')}</p>
              ) : similarAccommodations.length === 0 ? (
                <p className="text-xs text-[#a8a8a8] text-center py-4">
                  {t('noSimilarAccommodations')}
                </p>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-2 -mx-5 px-5">
                  {similarAccommodations.map((item) => (
                    <div key={item.id} className="w-[180px] flex-shrink-0 cursor-pointer group">
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-2">
                        {item.thumbnailUrl ? (
                          <Image
                            src={item.thumbnailUrl}
                            alt={item.roomName}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#f4f4f4] to-[#e0e0e0] flex items-center justify-center">
                            <HotelIcon className="w-8 h-8 text-[#a8a8a8]" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-[#161616] mb-0.5 truncate">
                        {item.sigunguEn || item.sidoEn || item.roomName}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-[#6f6f6f] mb-0.5">
                        <HotelIcon className="w-3 h-3" />
                        <span>
                          {t('rooms', { count: item.roomCount })} ·{' '}
                          {t('bathrooms', { count: item.bathroomCount })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-[#6f6f6f] mb-1">
                        <UserIcon className="w-3 h-3" />
                        <span>{t('guests', { count: item.capacity })}</span>
                      </div>
                      <p className="text-xs">
                        <span className="font-bold text-[hsl(var(--snug-orange))]">
                          ₩{item.basePrice.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-[#6f6f6f]"> {t('perNight')}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* Information - TODO: 추후 실제 데이터 연결 */}
            <Section
              title={t('information')}
              expanded={true}
              onToggle={() => {}}
              showToggle={false}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <h4 className="text-xs font-semibold text-[#161616]">
                    {t('includedInMaintenanceFee')}
                  </h4>
                  <span className="text-xs text-[#6f6f6f]">({t('includedServices')})</span>
                </div>
                <p className="text-xs text-[#6f6f6f] leading-relaxed">
                  {t('includedServicesDesc')}
                </p>
              </div>
            </Section>

            {/* Refund Policy - TODO: 추후 실제 데이터 연결 */}
            <Section
              title={t('refundPolicy')}
              expanded={expandedSections.refundPolicy}
              onToggle={() => toggleSection('refundPolicy')}
            >
              <ul className="space-y-2">
                {[
                  'More than 15 days before check-in: 90% refund of rent and contract fee',
                  '14–8 days before check-in: 70% refund of rent and contract fee',
                  '7–1 days before check-in: 50% refund of rent and contract fee',
                  'On the check-in date: No refund',
                ].map((policy, index) => (
                  <li key={index} className="flex items-start gap-2 text-xs text-[#6f6f6f]">
                    <span className="w-1.5 h-1.5 mt-1.5 bg-[#161616] rounded-full flex-shrink-0" />
                    <span>{policy}</span>
                  </li>
                ))}
              </ul>
            </Section>

            {/* Long-Term Stay Discount - TODO: 추후 실제 데이터 연결 */}
            <Section
              title={t('longTermDiscount')}
              expanded={expandedSections.longTermDiscount}
              onToggle={() => toggleSection('longTermDiscount')}
            >
              <ul className="space-y-2">
                {[
                  { period: 'Contract for 2+ weeks', discount: '5% off' },
                  { period: 'Contract for 4+ weeks', discount: '10% off' },
                  { period: 'Contract for 12+ weeks', discount: '20% off' },
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-xs text-[#6f6f6f]">
                    <span className="w-1.5 h-1.5 mt-1.5 bg-[#6f6f6f] rounded-full flex-shrink-0" />
                    <span>
                      {item.period}: {item.discount}
                    </span>
                  </li>
                ))}
              </ul>
            </Section>

            {/* Notes - TODO: 추후 실제 데이터 연결 */}
            <Section
              title={t('notes')}
              expanded={expandedSections.notes}
              onToggle={() => toggleSection('notes')}
            >
              <ul className="space-y-2">
                {[
                  'For same-day cancellations, 10% of the rent and contract fee will be charged as a penalty according to the refund policy. However, if the cancellation falls within the free cancellation period, a full refund will be issued.',
                  'Maintenance fees, cleaning fees, and deposits are fully refundable.',
                  "The refund policy may vary depending on the host's terms.",
                ].map((note, index) => (
                  <li key={index} className="flex items-start gap-2 text-xs text-[#6f6f6f]">
                    <span className="w-1.5 h-1.5 mt-1.5 bg-[#6f6f6f] rounded-full flex-shrink-0" />
                    <span className="leading-relaxed">{note}</span>
                  </li>
                ))}
              </ul>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}

// Section Component with expand/collapse
interface SectionProps {
  title: string;
  expanded?: boolean;
  onToggle?: () => void;
  showToggle?: boolean;
  children: React.ReactNode;
}

function Section({ title, expanded = true, onToggle, showToggle = true, children }: SectionProps) {
  return (
    <div className="py-4 border-t border-[#e0e0e0] first:border-t-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between mb-3"
        disabled={!showToggle}
      >
        <h3 className="text-sm font-bold text-[#161616]">{title}</h3>
        {showToggle && (
          <ChevronDown
            className={`w-4 h-4 text-[#6f6f6f] transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        )}
      </button>
      {expanded && children}
    </div>
  );
}

function DetailIconItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  const Icon = detailIcons[icon] || RoomIcon;
  return (
    <div className="flex items-center gap-2 text-xs text-[#161616]">
      <Icon className="w-4 h-4 text-[#6f6f6f]" />
      <span>{label}</span>
      <span className="text-[#a8a8a8]">·</span>
      <span className="text-[#6f6f6f]">{value}</span>
    </div>
  );
}
