'use client';

import { useCallback, useState, useRef, useMemo, useEffect } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import Image from 'next/image';
import { useRouter } from '@/i18n/navigation';
import { X, ImageIcon } from 'lucide-react';
import { HeartIcon, HotelIcon, UserIcon } from '@/shared/ui/icons';
import { useCurrencySafe } from '@/shared/providers';
import type { Room } from './room-card';

interface SearchMapProps {
  rooms: Room[];
  initialCenter?: { lat: number; lng: number };
  onRoomSelect?: (roomId: string | null) => void;
  onGroupSelect?: (roomIds: string[]) => void;
}

// 좌표 기반 그룹화된 마커
interface MarkerGroup {
  key: string;
  lat: number;
  lng: number;
  rooms: Room[];
  minPrice: number;
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

// 좌표를 키로 변환 (소수점 6자리까지 비교)
function getCoordinateKey(lat: number, lng: number): string {
  return `${lat.toFixed(6)}_${lng.toFixed(6)}`;
}

// 숙소들을 좌표별로 그룹화
function groupRoomsByLocation(rooms: Room[]): MarkerGroup[] {
  const groups = new Map<string, Room[]>();

  for (const room of rooms) {
    const key = getCoordinateKey(room.lat, room.lng);
    const existing = groups.get(key) || [];
    existing.push(room);
    groups.set(key, existing);
  }

  return Array.from(groups.entries())
    .filter(([, groupRooms]) => groupRooms.length > 0)
    .map(([key, groupRooms]) => ({
      key,
      lat: groupRooms[0]!.lat,
      lng: groupRooms[0]!.lng,
      rooms: groupRooms,
      minPrice: Math.min(...groupRooms.map((r) => r.price)),
    }));
}

// 마커 그룹들의 bounds 계산
function calculateBounds(markerGroups: MarkerGroup[]): google.maps.LatLngBounds | null {
  if (markerGroups.length === 0) return null;
  const bounds = new google.maps.LatLngBounds();
  markerGroups.forEach((group) => {
    bounds.extend(new google.maps.LatLng(group.lat, group.lng));
  });
  return bounds;
}

// zoom 제한 상수
const MAX_ZOOM = 17;
const MIN_ZOOM = 11;
const DEFAULT_ZOOM = 15;

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

export function SearchMap({ rooms, initialCenter, onRoomSelect, onGroupSelect }: SearchMapProps) {
  const router = useRouter();
  const { format } = useCurrencySafe();
  const [selectedGroup, setSelectedGroup] = useState<MarkerGroup | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  const cardContainerRef = useRef<HTMLDivElement | null>(null);

  // 숙소들을 좌표별로 그룹화
  const markerGroups = useMemo(() => groupRoomsByLocation(rooms), [rooms]);

  // Libraries for Google Maps API (marker library for AdvancedMarkerElement)
  const libraries = useMemo<'marker'[]>(() => ['marker'], []);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    id: 'google-map-script',
    libraries,
  });

  // Store markers ref for cleanup
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

  // 마커 클릭 직후 카드 클릭 방지용
  const markerClickedRef = useRef(false);

  // 반응형 padding 계산 (모바일: carousel 고려)
  const getPaddingForView = useCallback((): google.maps.Padding => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    return isMobile
      ? { top: 80, right: 20, bottom: 280, left: 20 }
      : { top: 100, right: 20, bottom: 40, left: 20 };
  }, []);

  const onMapLoad = useCallback(
    (mapInstance: google.maps.Map) => {
      mapRef.current = mapInstance;

      // 맵 로드 시 즉시 fitBounds 적용 (모바일 뷰 전환 대응)
      if (markerGroups.length > 0) {
        const bounds = calculateBounds(markerGroups);
        if (bounds) {
          mapInstance.fitBounds(bounds, getPaddingForView());

          // fitBounds 후 zoom 레벨 제한
          google.maps.event.addListenerOnce(mapInstance, 'bounds_changed', () => {
            const currentZoom = mapInstance.getZoom() ?? DEFAULT_ZOOM;
            if (currentZoom > MAX_ZOOM) {
              mapInstance.setZoom(MAX_ZOOM);
            } else if (currentZoom < MIN_ZOOM) {
              mapInstance.setZoom(MIN_ZOOM);
            }
          });
        }
      }
    },
    [markerGroups, getPaddingForView],
  );

  const onMapClick = useCallback(() => {
    setSelectedGroup(null);
    setCurrentIndex(0);
    onRoomSelect?.(null);
    onGroupSelect?.([]);
  }, [onRoomSelect, onGroupSelect]);

  // 검색 결과 변경 시 fitBounds로 모든 마커가 보이도록 자동 줌
  useEffect(() => {
    if (!mapRef.current || !isLoaded || markerGroups.length === 0) return;

    const bounds = calculateBounds(markerGroups);
    if (bounds) {
      mapRef.current.fitBounds(bounds, getPaddingForView());

      // fitBounds 후 zoom 레벨 제한
      const listener = google.maps.event.addListenerOnce(mapRef.current, 'bounds_changed', () => {
        const currentZoom = mapRef.current?.getZoom() ?? DEFAULT_ZOOM;
        if (currentZoom > MAX_ZOOM) {
          mapRef.current?.setZoom(MAX_ZOOM);
        } else if (currentZoom < MIN_ZOOM) {
          mapRef.current?.setZoom(MIN_ZOOM);
        }
      });

      return () => {
        google.maps.event.removeListener(listener);
      };
    }
  }, [markerGroups, isLoaded, getPaddingForView]);

  const handleMarkerClick = useCallback(
    (group: MarkerGroup) => {
      // 마커 클릭 플래그 설정 (카드 클릭 방지)
      markerClickedRef.current = true;
      setTimeout(() => {
        markerClickedRef.current = false;
      }, 500);

      setSelectedGroup(group);
      setCurrentIndex(0);

      // PC: 그룹 내 모든 숙소 ID 전달
      onGroupSelect?.(group.rooms.map((r) => r.id));
      // 첫 번째 숙소 ID도 전달 (기존 호환성)
      if (group.rooms[0]) {
        onRoomSelect?.(group.rooms[0].id);
      }

      // Pan map to show marker above the bottom card + zoom 전환
      if (mapRef.current) {
        const offsetLat = group.lat - 0.003;
        mapRef.current.panTo({ lat: offsetLat, lng: group.lng });

        // 부드러운 zoom 전환 (현재 zoom이 16 미만일 때만)
        const currentZoom = mapRef.current.getZoom() ?? DEFAULT_ZOOM;
        if (currentZoom < 16) {
          setTimeout(() => {
            mapRef.current?.setZoom(16);
          }, 300);
        }
      }
    },
    [onGroupSelect, onRoomSelect],
  );

  // Create/update Advanced Markers when map loads or data changes
  useEffect(() => {
    if (!mapRef.current || !isLoaded) return;

    // Clean up existing markers
    markersRef.current.forEach((marker) => {
      marker.map = null;
    });
    markersRef.current = [];

    // Create new markers
    markerGroups.forEach((group) => {
      // Create custom marker content
      const content = document.createElement('div');
      const formattedPrice = format(group.minPrice, { compact: true });
      const extraCount = group.rooms.length - 1;
      const isSelected = selectedGroup?.key === group.key;
      const bgColor = isSelected ? '#ff7900' : '#6B7280';

      if (extraCount > 0) {
        content.innerHTML = `
          <div style="
            background: ${bgColor};
            color: white;
            padding: 8px 12px;
            border-radius: 18px;
            font-size: 13px;
            font-weight: bold;
            font-family: Arial, sans-serif;
            white-space: nowrap;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          ">${formattedPrice} · ${extraCount} more stays</div>
        `;
      } else {
        content.innerHTML = `
          <div style="
            background: ${bgColor};
            color: white;
            padding: 8px 16px;
            border-radius: 18px;
            font-size: 13px;
            font-weight: bold;
            font-family: Arial, sans-serif;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          ">${formattedPrice}</div>
        `;
      }

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: mapRef.current,
        position: { lat: group.lat, lng: group.lng },
        content,
      });

      marker.addListener('click', () => handleMarkerClick(group));
      markersRef.current.push(marker);
    });

    // Cleanup on unmount
    return () => {
      markersRef.current.forEach((marker) => {
        marker.map = null;
      });
      markersRef.current = [];
    };
  }, [isLoaded, markerGroups, selectedGroup?.key, format, handleMarkerClick]);

  const handleClose = () => {
    setSelectedGroup(null);
    setCurrentIndex(0);
    onRoomSelect?.(null);
    onGroupSelect?.([]);
  };

  const handleFavoriteClick = (e: React.MouseEvent, roomId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(roomId)) {
        next.delete(roomId);
      } else {
        next.add(roomId);
      }
      return next;
    });
  };

  // 스와이프 네비게이션
  const goToNext = () => {
    if (selectedGroup && currentIndex < selectedGroup.rooms.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      const room = selectedGroup.rooms[newIndex];
      if (room) onRoomSelect?.(room.id);
    }
  };

  const goToPrev = () => {
    if (selectedGroup && currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      const room = selectedGroup.rooms[newIndex];
      if (room) onRoomSelect?.(room.id);
    }
  };

  // 터치 스와이프 핸들러
  const minSwipeDistance = 30;
  const swipedRef = useRef(false);

  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.targetTouches[0];
    if (!touch) return;
    setTouchEnd(null);
    setTouchStart(touch.clientX);
    setIsSwiping(false);
    swipedRef.current = false;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const touch = e.targetTouches[0];
    if (!touch) return;
    setTouchEnd(touch.clientX);
    // 일정 거리 이상 움직이면 스와이프로 판단
    if (touchStart !== null) {
      const distance = Math.abs(touch.clientX - touchStart);
      if (distance > 10) {
        setIsSwiping(true);
        swipedRef.current = true;
      }
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setIsSwiping(false);
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
      swipedRef.current = true;
    } else if (isRightSwipe) {
      goToPrev();
      swipedRef.current = true;
    }

    // 스와이프 상태 리셋 (딜레이 후)
    setTimeout(() => {
      setIsSwiping(false);
      swipedRef.current = false;
    }, 300);
  };

  // 카드 클릭 핸들러 (스와이프/마커클릭 직후가 아닐 때만 이동)
  const handleCardClick = useCallback(
    (e: React.MouseEvent, roomId: string) => {
      // 스와이프 중이거나 방금 스와이프했으면 클릭 무시
      if (isSwiping || swipedRef.current) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      // 마커 클릭 직후면 클릭 무시 (터치 이벤트 중복 방지)
      if (markerClickedRef.current) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      router.push(`/room/${roomId}`);
    },
    [isSwiping, router],
  );

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

  const currentRoom = selectedGroup?.rooms[currentIndex];
  const totalInGroup = selectedGroup?.rooms.length || 0;

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={initialCenter || defaultCenter}
        zoom={DEFAULT_ZOOM}
        options={{
          ...mapOptions,
          mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID',
        }}
        onLoad={onMapLoad}
        onClick={onMapClick}
      />
      {/* Markers are created programmatically via AdvancedMarkerElement in useEffect */}

      {/* Selected Room Cards - Mobile Carousel with peek effect */}
      {selectedGroup && currentRoom && (
        <div className="absolute bottom-0 left-0 right-0 z-10 md:hidden">
          {/* Header: Close + Pagination */}
          <div className="flex justify-between items-center px-4 pb-3">
            {/* Pagination indicator */}
            {totalInGroup > 1 && (
              <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full">
                <span className="text-white text-xs font-medium">
                  {currentIndex + 1} / {totalInGroup}
                </span>
              </div>
            )}
            <div className={totalInGroup <= 1 ? 'ml-auto' : ''}>
              <button
                type="button"
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-md"
              >
                <X className="w-4 h-4 text-[hsl(var(--snug-text-primary))] drop-shadow-sm" />
              </button>
            </div>
          </div>

          {/*
            Carousel 계산:
            - 카드 너비: 82vw
            - 카드 간 gap: 12px
            - 중앙 정렬 패딩: (100vw - 82vw) / 2 = 9vw
            - 이동 거리: 82vw + 12px per card
          */}
          <div className="relative mb-4 overflow-hidden">
            {/* Cards Track */}
            <div
              ref={cardContainerRef}
              className="flex transition-transform duration-300 ease-out"
              style={{
                paddingLeft: '9vw',
                paddingRight: '9vw',
                gap: '12px',
                transform: `translateX(calc(-${currentIndex} * (82vw + 12px)))`,
              }}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {selectedGroup.rooms.map((room, idx) => (
                <div key={room.id} className="flex-shrink-0" style={{ width: '82vw' }}>
                  {/* Room Card */}
                  <div
                    onClick={(e) => handleCardClick(e, room.id)}
                    className={`block bg-white rounded-2xl shadow-xl overflow-hidden cursor-pointer transition-all duration-300 ${
                      idx === currentIndex ? 'opacity-100 scale-100' : 'opacity-60 scale-[0.97]'
                    }`}
                  >
                    {/* Image */}
                    <div className="relative aspect-[16/10]">
                      {room.imageUrl ? (
                        <Image
                          src={room.imageUrl}
                          alt={room.title}
                          fill
                          sizes="82vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--snug-light-gray))] to-[hsl(var(--snug-border))] flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-[hsl(var(--snug-gray))]/30" />
                        </div>
                      )}

                      {/* Tags */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        {room.tags.map((tag, tagIndex) => (
                          <span
                            key={tag.label}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-full ${
                              tagIndex === 0
                                ? tagFirstColors[tag.color]
                                : tagSecondColors[tag.color]
                            }`}
                          >
                            {tag.label}
                          </span>
                        ))}
                      </div>

                      {/* Favorite Button */}
                      <button
                        type="button"
                        onClick={(e) => handleFavoriteClick(e, room.id)}
                        className="absolute top-3 right-3 p-2"
                      >
                        <HeartIcon
                          className={`w-6 h-6 ${favorites.has(room.id) ? 'text-red-500' : 'text-white drop-shadow-md'}`}
                          filled={favorites.has(room.id)}
                        />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      {/* Title */}
                      <h3 className="text-[15px] font-semibold text-[hsl(var(--snug-text-primary))] mb-1.5 truncate">
                        {room.title}
                      </h3>

                      {/* Location */}
                      <p className="text-[13px] text-[hsl(var(--snug-gray))] mb-1">
                        {room.location}, {room.district}
                      </p>

                      {/* Room Info */}
                      <div className="flex items-center gap-1.5 text-[13px] text-[hsl(var(--snug-gray))] mb-0.5">
                        <HotelIcon className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>
                          {room.rooms} Rooms · {room.bathrooms} Bathroom · {room.beds} Bed
                        </span>
                      </div>

                      {/* Guests */}
                      <div className="flex items-center gap-1.5 text-[13px] text-[hsl(var(--snug-gray))] mb-2.5">
                        <UserIcon className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{room.guests} Guests</span>
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
                          for {room.nights} nights
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Dot indicators */}
            {totalInGroup > 1 && (
              <div className="flex justify-center gap-1.5 mt-3">
                {selectedGroup.rooms.map((room, idx) => (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => {
                      setCurrentIndex(idx);
                      onRoomSelect?.(room.id);
                    }}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      idx === currentIndex ? 'bg-[hsl(var(--snug-orange))]' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
