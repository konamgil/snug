'use client';

import { useState } from 'react';
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

const EMPTY_FILTERS: FilterTab[] = [
  { id: 'all', label: '전체', count: 0 },
  { id: 'pending', label: '계약 신청', count: 0 },
  { id: 'checkin', label: '체크인 예정', count: 0 },
  { id: 'checkout', label: '체크아웃 예정', count: 0 },
  { id: 'scheduled', label: '입주 예정', count: 0 },
  { id: 'staying', label: '입주 중', count: 0 },
  { id: 'completed', label: '퇴실 완료', count: 0 },
  { id: 'rejected', label: '거절', count: 0 },
  { id: 'cancelled', label: '취소/환불', count: 0 },
];

export function ContractEmptySection() {
  const [activeFilter, setActiveFilter] = useState<ContractFilter>('all');

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
        {EMPTY_FILTERS.map((filter) => (
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

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center h-[180px] text-center">
        <p className="text-sm text-[hsl(var(--snug-gray))]">아직 계약 내역이 없습니다.</p>
        <p className="text-sm text-[hsl(var(--snug-gray))]">
          계약이 완료되면 이곳에서 확인할 수 있습니다.
        </p>
      </div>
    </section>
  );
}
