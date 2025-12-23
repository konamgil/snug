'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import type { OperationDetailData } from './operation-detail-drawer';

type OperationFilter = 'all' | 'received' | 'in_progress' | 'completed';

interface FilterTab {
  id: OperationFilter;
  label: string;
}

interface OperationRequest {
  id: string;
  title: string;
  description: string;
  hostName: string;
  timeAgo: string;
}

interface OperationSectionProps {
  onItemClick?: (data: OperationDetailData) => void;
}

const FILTERS: FilterTab[] = [
  { id: 'all', label: '전체' },
  { id: 'received', label: '요청 접수' },
  { id: 'in_progress', label: '요청 진행중' },
  { id: 'completed', label: '요청 완료' },
];

const MOCK_REQUESTS: OperationRequest[] = [
  {
    id: '1',
    title: '침구 청소와 방문 손잡이 수리 요청',
    description: '베개 얼룩, 이불 등 침구 청소를 요청, 방문 손잡이 잠금 장치 고장...',
    hostName: '김러그',
    timeAgo: '1시간 전',
  },
  {
    id: '2',
    title: '침구 청소와 방문 손잡이 수리 요청',
    description: '베개 얼룩, 이불 등 침구 청소를 요청, 방문 손잡이 잠금 장치 고장...',
    hostName: '김러그',
    timeAgo: '5시간 전',
  },
  {
    id: '3',
    title: '301호 침구 교체 요청드려요!',
    description: '침구 교체',
    hostName: '김러그',
    timeAgo: '3일 전',
  },
  {
    id: '4',
    title: '301호 침구 교체 요청드려요!',
    description: '침구 교체',
    hostName: '김러그',
    timeAgo: '1주일 전',
  },
];

// Mock data converter - transforms list item to detail data
function getDetailData(request: OperationRequest): OperationDetailData {
  return {
    id: request.id,
    customerName: request.hostName,
    inquiryDate: '2025.09.10 15:30',
    title: request.title,
    details: [request.description],
    preferredDate: '2025.09.12',
    preferredTime: '10:00',
    location: '서울시 강남구 역삼동 123-45',
    keywords: ['침구', '청소', '수리'],
  };
}

export function OperationSection({ onItemClick }: OperationSectionProps) {
  const [activeFilter, setActiveFilter] = useState<OperationFilter>('all');

  return (
    <section className="bg-white rounded-xl p-4 md:p-5 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[hsl(var(--snug-text-primary))]">하우스 운영 관리</h2>
        <Link
          href="/host/operations"
          className="text-sm text-[hsl(var(--snug-orange))] hover:underline"
        >
          모든 관리목록 보기
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => setActiveFilter(filter.id)}
            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
              activeFilter === filter.id
                ? 'border-[hsl(var(--snug-orange))] text-[hsl(var(--snug-orange))]'
                : 'border-[hsl(var(--snug-border))] text-[hsl(var(--snug-gray))] hover:border-[hsl(var(--snug-gray))]'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Request List */}
      <div className="space-y-3">
        {MOCK_REQUESTS.map((request) => (
          <div
            key={request.id}
            onClick={() => onItemClick?.(getDetailData(request))}
            className="flex items-start justify-between py-2 border-b border-[hsl(var(--snug-border))] last:border-b-0 cursor-pointer hover:bg-[hsl(var(--snug-light-gray))]/50 -mx-2 px-2 rounded transition-colors"
          >
            <div className="flex-1 min-w-0 mr-4">
              <p className="text-sm font-medium text-[hsl(var(--snug-text-primary))] truncate">
                {request.title}
              </p>
              <p className="text-xs text-[hsl(var(--snug-gray))] truncate">{request.description}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm text-[hsl(var(--snug-text-primary))]">{request.hostName}</p>
              <p className="text-xs text-[hsl(var(--snug-gray))]">{request.timeAgo}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function OperationEmptySection() {
  const [activeFilter, setActiveFilter] = useState<OperationFilter>('all');

  return (
    <section className="bg-white rounded-xl p-4 md:p-5 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[hsl(var(--snug-text-primary))]">하우스 운영 관리</h2>
        <Link
          href="/host/operations"
          className="text-sm text-[hsl(var(--snug-orange))] hover:underline"
        >
          모든 관리목록 보기
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => setActiveFilter(filter.id)}
            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
              activeFilter === filter.id
                ? 'border-[hsl(var(--snug-orange))] text-[hsl(var(--snug-orange))]'
                : 'border-[hsl(var(--snug-border))] text-[hsl(var(--snug-gray))] hover:border-[hsl(var(--snug-gray))]'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center h-[160px] text-center">
        <p className="text-sm text-[hsl(var(--snug-gray))]">현재 게스트 문의 내역이 없습니다.</p>
        <p className="text-sm text-[hsl(var(--snug-gray))]">
          게스트가 숙소 관련 문의를 남기면 이곳에서 확인할 수 있습니다.
        </p>
      </div>
    </section>
  );
}
