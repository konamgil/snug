'use client';

import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';

type ContractFilter =
  | 'all'
  | 'pending'
  | 'checkin'
  | 'checkout'
  | 'scheduled'
  | 'staying'
  | 'completed'
  | 'rejected'
  | 'cancelled';

interface FilterTab {
  id: ContractFilter;
  label: string;
  count: number;
}

interface RoomCard {
  id: string;
  type: 'Shared Room' | 'Shared House' | 'House';
  subType: string;
  isNew?: boolean;
  daysUntil?: number;
  imageUrl?: string;
  hostName: string;
  propertyName: string;
  guestCount: number;
  dateRange: string;
  price: number;
  nights: number;
}

const MOCK_FILTERS: FilterTab[] = [
  { id: 'all', label: '전체', count: 376 },
  { id: 'pending', label: '계약 신청', count: 999 },
  { id: 'checkin', label: '체크인 예정', count: 999 },
  { id: 'checkout', label: '체크아웃 예정', count: 999 },
  { id: 'scheduled', label: '입주 예정', count: 999 },
  { id: 'staying', label: '입주 중', count: 999 },
  { id: 'completed', label: '퇴실 완료', count: 999 },
  { id: 'rejected', label: '거절', count: 999 },
  { id: 'cancelled', label: '취소/환불', count: 999 },
];

const MOCK_ROOMS: RoomCard[] = [
  {
    id: '1',
    type: 'Shared Room',
    subType: '아파트/빌라',
    isNew: true,
    hostName: '김러그',
    propertyName: 'Snug Stay 101호 (강남빌라)',
    guestCount: 1,
    dateRange: '25.12.25 - 26.01.24',
    price: 1222460,
    nights: 30,
  },
  {
    id: '2',
    type: 'House',
    subType: '아파트/빌라',
    isNew: true,
    hostName: '김러그',
    propertyName: 'Snug Stay 101호 (강남빌라)',
    guestCount: 5,
    dateRange: '25.10.16 - 25.10.26',
    price: 1142756,
    nights: 10,
  },
  {
    id: '3',
    type: 'Shared Room',
    subType: '아파트/빌라',
    daysUntil: 1,
    hostName: '김러그',
    propertyName: 'Korea Stay 101호',
    guestCount: 2,
    dateRange: '25.10.16 - 25.10.20',
    price: 311540,
    nights: 4,
  },
  {
    id: '4',
    type: 'Shared House',
    subType: '주택/단독주택',
    daysUntil: 3,
    hostName: '김러그',
    propertyName: 'Korea Stay 101호',
    guestCount: 3,
    dateRange: '25.10.18 - 25.11.03',
    price: 888856,
    nights: 16,
  },
  {
    id: '5',
    type: 'Shared House',
    subType: '로컬',
    daysUntil: 10,
    hostName: '김러그',
    propertyName: 'Korea Stay 101호',
    guestCount: 1,
    dateRange: '25.10.01 - 25.10.03',
    price: 72261,
    nights: 2,
  },
  {
    id: '6',
    type: 'House',
    subType: '로컬',
    daysUntil: 9,
    hostName: '김러그',
    propertyName: 'Korea Stay 101호',
    guestCount: 2,
    dateRange: '25.09.30 - 25.10.17',
    price: 910005,
    nights: 17,
  },
];

function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR') + '원';
}

function getRoomTypeBadgeColor(type: string): string {
  switch (type) {
    case 'Shared Room':
      return 'bg-[hsl(var(--snug-orange))] text-white';
    case 'Shared House':
      return 'bg-[hsl(var(--snug-orange))] text-white';
    case 'House':
      return 'bg-[hsl(var(--snug-orange))] text-white';
    default:
      return 'bg-gray-500 text-white';
  }
}

export function ContractSection() {
  const [activeFilter, setActiveFilter] = useState<ContractFilter>('all');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="bg-white rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[hsl(var(--snug-text-primary))]">입주/계약 관리</h2>
        <Link
          href="/host/contracts"
          className="text-sm text-[hsl(var(--snug-orange))] hover:underline"
        >
          모든 계약목록 보기
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar pb-1">
        {MOCK_FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => setActiveFilter(filter.id)}
            className={`flex-shrink-0 px-3 py-1.5 text-sm rounded-full border transition-colors ${
              activeFilter === filter.id
                ? 'border-[hsl(var(--snug-orange))] text-[hsl(var(--snug-orange))]'
                : 'border-[hsl(var(--snug-border))] text-[hsl(var(--snug-gray))] hover:border-[hsl(var(--snug-gray))]'
            }`}
          >
            {filter.label} {filter.count}
          </button>
        ))}
      </div>

      {/* Room Cards Carousel */}
      <div className="relative">
        {/* Left Arrow */}
        <button
          type="button"
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white border border-[hsl(var(--snug-border))] rounded-full flex items-center justify-center shadow-sm hover:bg-[hsl(var(--snug-light-gray))] transition-colors"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4 text-[hsl(var(--snug-text-primary))]" />
        </button>

        {/* Cards Container */}
        <div ref={scrollContainerRef} className="flex gap-4 overflow-x-auto no-scrollbar px-4">
          {MOCK_ROOMS.map((room) => (
            <div
              key={room.id}
              className="flex-shrink-0 w-[160px] cursor-pointer hover:opacity-90 transition-opacity"
            >
              {/* Image */}
              <div className="relative w-full h-[120px] rounded-lg overflow-hidden bg-[hsl(var(--snug-light-gray))] mb-2">
                {/* Room Type Badge */}
                <div className="absolute top-2 left-2 flex items-center gap-1">
                  <span
                    className={`px-1.5 py-0.5 text-[10px] rounded ${getRoomTypeBadgeColor(room.type)}`}
                  >
                    {room.type}
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] bg-[hsl(var(--snug-orange))]/80 text-white rounded">
                    {room.subType}
                  </span>
                </div>

                {/* New or Days Badge */}
                {room.isNew && (
                  <div className="absolute top-2 right-2">
                    <span className="px-1.5 py-0.5 text-[10px] bg-red-500 text-white rounded">
                      New
                    </span>
                  </div>
                )}
                {room.daysUntil !== undefined && (
                  <div className="absolute top-2 right-2">
                    <span className="px-1.5 py-0.5 text-[10px] bg-[hsl(var(--snug-gray))] text-white rounded">
                      {room.daysUntil === 1
                        ? '1일전'
                        : `${room.daysUntil.toString().padStart(2, '0')}.${room.daysUntil < 10 ? '0' + room.daysUntil : room.daysUntil}`}
                    </span>
                  </div>
                )}

                {/* Placeholder Image */}
                <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
                  <span className="text-xs text-[hsl(var(--snug-gray))]">Room</span>
                </div>
              </div>

              {/* Info */}
              <div>
                <p className="text-sm font-medium text-[hsl(var(--snug-text-primary))] truncate">
                  {room.hostName}
                </p>
                <p className="text-xs text-[hsl(var(--snug-gray))] truncate">
                  {room.propertyName} · {room.guestCount}명
                </p>
                <p className="text-xs text-[hsl(var(--snug-gray))]">{room.dateRange}</p>
                <p className="text-sm mt-1">
                  <span className="font-bold text-[hsl(var(--snug-orange))]">
                    {formatPrice(room.price)}
                  </span>
                  <span className="text-xs text-[hsl(var(--snug-gray))]"> · {room.nights}박</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          type="button"
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white border border-[hsl(var(--snug-border))] rounded-full flex items-center justify-center shadow-sm hover:bg-[hsl(var(--snug-light-gray))] transition-colors"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4 text-[hsl(var(--snug-text-primary))]" />
        </button>
      </div>
    </section>
  );
}
