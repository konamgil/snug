'use client';

// Shimmer effect component for elegant loading animation
function Shimmer({ className }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
}

// Single skeleton row for the inquiry table
function InquiryRowSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className="flex items-center py-3 px-0.5 border-b border-[#f0f0f0]"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Received Date */}
      <div className="w-[60px]">
        <Shimmer className="h-4 w-14 bg-[#e8e8e8] rounded" />
      </div>

      {/* Questioner */}
      <div className="w-[70px]">
        <Shimmer className="h-4 w-12 bg-[#e8e8e8] rounded" />
      </div>

      {/* Content */}
      <div className="flex-1 pr-4 space-y-1.5">
        <Shimmer className="h-3.5 w-full bg-[#e8e8e8] rounded" />
        <Shimmer className="h-3.5 w-3/4 bg-[#e8e8e8] rounded" />
      </div>

      {/* Inquiry Type Badge */}
      <div className="w-[70px] flex justify-center">
        <Shimmer className="h-5 w-12 bg-[#e0e0e0] rounded-full" />
      </div>

      {/* Processed Date */}
      <div className="w-[60px] flex justify-center">
        <Shimmer className="h-4 w-14 bg-[#e8e8e8] rounded" />
      </div>
    </div>
  );
}

export function OperationsSkeleton() {
  return (
    <div className="p-5 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Shimmer className="h-6 w-24 bg-[#e0e0e0] rounded" />
          <Shimmer className="h-6 w-6 bg-[hsl(var(--snug-orange)/0.3)] rounded" />
        </div>
        <Shimmer className="h-8 w-8 bg-[#e8e8e8] rounded-lg" />
      </div>

      {/* Filter Tabs Skeleton */}
      <div className="flex items-center gap-3.5 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Shimmer
            key={i}
            className={`h-7 rounded-full ${i === 1 ? 'w-14 bg-[hsl(var(--snug-orange)/0.2)]' : 'w-16 bg-[#e8e8e8]'}`}
          />
        ))}
      </div>

      {/* Table Header Skeleton */}
      <div className="flex items-center mb-2 px-0.5">
        <Shimmer className="h-3.5 w-12 bg-[#d0d0d0] rounded mr-[48px]" />
        <Shimmer className="h-3.5 w-10 bg-[#d0d0d0] rounded mr-[60px]" />
        <div className="flex-1">
          <Shimmer className="h-3.5 w-16 bg-[#d0d0d0] rounded" />
        </div>
        <Shimmer className="h-3.5 w-12 bg-[#d0d0d0] rounded mr-[58px]" />
        <Shimmer className="h-3.5 w-12 bg-[#d0d0d0] rounded" />
      </div>
      <div className="border-t border-[#c0c0c0] mb-2" />

      {/* Table Rows Skeleton with staggered animation */}
      <div className="space-y-0">
        {Array.from({ length: 8 }).map((_, index) => (
          <InquiryRowSkeleton key={index} delay={index * 50} />
        ))}
      </div>
    </div>
  );
}

// Skeleton for the detail panel
export function DetailPanelSkeleton() {
  return (
    <div className="p-5 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Shimmer className="h-5 w-20 bg-[#e0e0e0] rounded" />
        <Shimmer className="h-6 w-6 bg-[#e8e8e8] rounded" />
      </div>

      {/* Guest Info */}
      <div className="mb-6">
        <Shimmer className="h-4 w-16 bg-[#e8e8e8] rounded mb-2" />
        <Shimmer className="h-5 w-24 bg-[#e0e0e0] rounded" />
      </div>

      {/* Request Type */}
      <div className="mb-6">
        <Shimmer className="h-4 w-20 bg-[#e8e8e8] rounded mb-2" />
        <Shimmer className="h-6 w-28 bg-[#d0e2ff] rounded-full" />
      </div>

      {/* Request Details */}
      <div className="mb-6">
        <Shimmer className="h-4 w-24 bg-[#e8e8e8] rounded mb-2" />
        <div className="space-y-2">
          <Shimmer className="h-4 w-full bg-[#e8e8e8] rounded" />
          <Shimmer className="h-4 w-3/4 bg-[#e8e8e8] rounded" />
        </div>
      </div>

      {/* Date/Time */}
      <div className="mb-6">
        <Shimmer className="h-4 w-28 bg-[#e8e8e8] rounded mb-2" />
        <Shimmer className="h-5 w-32 bg-[#e0e0e0] rounded" />
      </div>

      {/* Action Button */}
      <Shimmer className="h-10 w-full bg-[hsl(var(--snug-orange)/0.3)] rounded-lg" />
    </div>
  );
}
