'use client';

import { useState } from 'react';
import { Search, ChevronDown, Star } from 'lucide-react';
import Image from 'next/image';

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

type SortOption = 'latest' | 'oldest' | 'name';
type ResponseFilter = 'all' | 'responded' | 'unresponded';

interface FilterTab {
  id: ContractFilter;
  label: string;
  count: number;
}

export interface ContractListItem {
  id: string;
  guestName: string;
  dateRange: string;
  propertyName: string;
  roomNumber: string;
  thumbnailUrl: string;
  isOnline: boolean;
  isFavorite: boolean;
  date: string;
}

interface ContractsListProps {
  selectedId?: string;
  onSelect: (item: ContractListItem) => void;
  compact?: boolean;
}

const FILTERS: FilterTab[] = [
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

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'latest', label: '최신순' },
  { id: 'oldest', label: '오래된순' },
  { id: 'name', label: '이름순' },
];

const RESPONSE_OPTIONS: { id: ResponseFilter; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'responded', label: '응답 완료' },
  { id: 'unresponded', label: '미응답' },
];

const MOCK_CONTRACTS: ContractListItem[] = [
  {
    id: '1',
    guestName: '김러그',
    dateRange: '25.08.26 - 25.09.02',
    propertyName: 'Korea Stay',
    roomNumber: '101호',
    thumbnailUrl: '',
    isOnline: true,
    isFavorite: true,
    date: '6월 1일',
  },
  {
    id: '2',
    guestName: '김러그',
    dateRange: '25.08.26 - 25.09.26',
    propertyName: '강남',
    roomNumber: '압구정 1nd #304',
    thumbnailUrl: '',
    isOnline: false,
    isFavorite: true,
    date: '6월 1일',
  },
  {
    id: '3',
    guestName: '김러그',
    dateRange: '25.08.26 - 25.09.26',
    propertyName: 'Korea Stay',
    roomNumber: '101호',
    thumbnailUrl: '',
    isOnline: true,
    isFavorite: false,
    date: '6월 1일',
  },
  {
    id: '4',
    guestName: '김러그',
    dateRange: '25.08.26 - 25.09.26',
    propertyName: 'Korea Stay',
    roomNumber: '101호',
    thumbnailUrl: '',
    isOnline: true,
    isFavorite: false,
    date: '6월 1일',
  },
  {
    id: '5',
    guestName: '김러그',
    dateRange: '25.08.26 - 25.09.26',
    propertyName: 'Korea Stay',
    roomNumber: '101호',
    thumbnailUrl: '',
    isOnline: true,
    isFavorite: true,
    date: '6월 1일',
  },
  {
    id: '6',
    guestName: '김러그',
    dateRange: '25.08.26 - 25.09.26',
    propertyName: 'Korea Stay',
    roomNumber: '101호',
    thumbnailUrl: '',
    isOnline: true,
    isFavorite: true,
    date: '6월 1일',
  },
];

export function ContractsList({ selectedId, onSelect, compact = false }: ContractsListProps) {
  const [activeFilter, setActiveFilter] = useState<ContractFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('latest');
  const [responseFilter, setResponseFilter] = useState<ResponseFilter>('all');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isResponseDropdownOpen, setIsResponseDropdownOpen] = useState(false);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[hsl(var(--snug-text-primary))]">
            계약 목록 <span className="text-[hsl(var(--snug-orange))]">999+</span>
          </h2>
          <button
            type="button"
            className="p-2 hover:bg-[hsl(var(--snug-light-gray))] rounded-lg transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-[hsl(var(--snug-text-primary))]" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {FILTERS.slice(0, compact ? 3 : FILTERS.length).map((filter) => (
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
          {compact && FILTERS.length > 3 && (
            <button
              type="button"
              className="flex-shrink-0 px-3 py-1.5 text-sm rounded-full border border-[hsl(var(--snug-border))] text-[hsl(var(--snug-gray))]"
            >
              체크...
            </button>
          )}
        </div>

        {/* Sort & Response Filter */}
        <div className="flex items-center gap-4 mt-3">
          {/* Sort Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsSortDropdownOpen(!isSortDropdownOpen);
                setIsResponseDropdownOpen(false);
              }}
              className="flex items-center gap-1 text-sm text-[hsl(var(--snug-text-primary))]"
            >
              {SORT_OPTIONS.find((s) => s.id === sortOption)?.label}
              <ChevronDown className="w-4 h-4" />
            </button>
            {isSortDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsSortDropdownOpen(false)} />
                <div className="absolute top-full left-0 mt-1 bg-white border border-[hsl(var(--snug-border))] rounded-lg shadow-lg z-20 min-w-[100px]">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setSortOption(option.id);
                        setIsSortDropdownOpen(false);
                      }}
                      className={`block w-full px-4 py-2 text-sm text-left hover:bg-[hsl(var(--snug-light-gray))] ${
                        sortOption === option.id
                          ? 'text-[hsl(var(--snug-orange))]'
                          : 'text-[hsl(var(--snug-text-primary))]'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Response Filter Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsResponseDropdownOpen(!isResponseDropdownOpen);
                setIsSortDropdownOpen(false);
              }}
              className="flex items-center gap-1 text-sm text-[hsl(var(--snug-text-primary))]"
            >
              {RESPONSE_OPTIONS.find((r) => r.id === responseFilter)?.label}
              <ChevronDown className="w-4 h-4" />
            </button>
            {isResponseDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsResponseDropdownOpen(false)}
                />
                <div className="absolute top-full left-0 mt-1 bg-white border border-[hsl(var(--snug-border))] rounded-lg shadow-lg z-20 min-w-[100px]">
                  {RESPONSE_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setResponseFilter(option.id);
                        setIsResponseDropdownOpen(false);
                      }}
                      className={`block w-full px-4 py-2 text-sm text-left hover:bg-[hsl(var(--snug-light-gray))] ${
                        responseFilter === option.id
                          ? 'text-[hsl(var(--snug-orange))]'
                          : 'text-[hsl(var(--snug-text-primary))]'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Contract List */}
      <div className="flex-1 overflow-y-auto">
        {MOCK_CONTRACTS.map((contract) => (
          <div
            key={contract.id}
            onClick={() => onSelect(contract)}
            className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-[hsl(var(--snug-border))] ${
              selectedId === contract.id
                ? 'bg-[hsl(var(--snug-light-gray))]'
                : 'hover:bg-[hsl(var(--snug-light-gray))]/50'
            }`}
          >
            {/* Thumbnail */}
            <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-[hsl(var(--snug-light-gray))]">
              {contract.thumbnailUrl ? (
                <Image
                  src={contract.thumbnailUrl}
                  alt={contract.propertyName}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-50" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-[hsl(var(--snug-text-primary))]">
                  {contract.guestName}
                </span>
                {contract.isOnline && (
                  <span className="w-2 h-2 bg-[hsl(var(--snug-orange))] rounded-full" />
                )}
              </div>
              <p className="text-xs text-[hsl(var(--snug-gray))]">{contract.dateRange}</p>
              <p className="text-xs text-[hsl(var(--snug-gray))]">{contract.propertyName}</p>
              <p className="text-sm font-bold text-[hsl(var(--snug-text-primary))]">
                {contract.roomNumber}
              </p>
            </div>

            {/* Right Side */}
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <Star
                className={`w-5 h-5 ${
                  contract.isFavorite
                    ? 'fill-[hsl(var(--snug-orange))] text-[hsl(var(--snug-orange))]'
                    : 'text-[hsl(var(--snug-gray))]'
                }`}
              />
              <span className="text-xs text-[hsl(var(--snug-gray))]">{contract.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
