'use client';

interface PriceSkeletonProps {
  variant?: 'inline' | 'card' | 'bottom-bar';
  className?: string;
}

/**
 * 가격 로딩 스켈레톤 컴포넌트
 * - inline: 한 줄 가격 표시 (검색 결과 등)
 * - card: 카드 형태의 가격 상세 (예약 패널)
 * - bottom-bar: 모바일 하단 바
 */
export function PriceSkeleton({ variant = 'inline', className = '' }: PriceSkeletonProps) {
  if (variant === 'inline') {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-5 w-20 bg-gray-200 rounded" />
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`animate-pulse space-y-3.5 ${className}`}>
        {/* Rent per night */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="h-3 w-24 bg-gray-200 rounded" />
            <div className="h-3 w-28 bg-gray-200 rounded" />
          </div>
          <div className="h-4 w-16 bg-gray-200 rounded" />
        </div>
        <div className="h-px bg-[#f0f0f0]" />
        {/* Calculations */}
        <div className="flex items-center justify-between">
          <div className="h-3 w-32 bg-gray-200 rounded" />
          <div className="h-3 w-16 bg-gray-200 rounded" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-3 w-20 bg-gray-200 rounded" />
          <div className="h-3 w-12 bg-gray-200 rounded" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-3 w-24 bg-gray-200 rounded" />
          <div className="h-3 w-12 bg-gray-200 rounded" />
        </div>
        <div className="h-px bg-[#f0f0f0]" />
        {/* Total */}
        <div className="flex items-center justify-between">
          <div className="h-4 w-12 bg-gray-200 rounded" />
          <div className="h-4 w-20 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  // bottom-bar
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="flex items-center justify-between">
        <div className="h-5 w-12 bg-gray-200 rounded" />
        <div className="h-5 w-24 bg-gray-200 rounded" />
      </div>
    </div>
  );
}
