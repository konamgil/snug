'use client';

interface RoomCardSkeletonProps {
  viewMode?: 'list' | 'grid' | 'mobile';
}

export function RoomCardSkeleton({ viewMode = 'list' }: RoomCardSkeletonProps) {
  // Mobile View Skeleton
  if (viewMode === 'mobile') {
    return (
      <div className="animate-pulse">
        {/* Image Skeleton */}
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[hsl(var(--snug-light-gray))]">
          {/* Tags Skeleton */}
          <div className="absolute top-3 left-3 flex gap-2">
            <div className="w-16 h-6 bg-gray-200 rounded-full" />
            <div className="w-14 h-6 bg-gray-200 rounded-full" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="pt-2.5">
          {/* Location */}
          <div className="h-5 w-3/4 bg-[hsl(var(--snug-light-gray))] rounded mb-2" />

          {/* Room Info */}
          <div className="h-4 w-2/3 bg-[hsl(var(--snug-light-gray))] rounded mb-1" />

          {/* Guests */}
          <div className="h-4 w-1/3 bg-[hsl(var(--snug-light-gray))] rounded mb-3" />

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <div className="h-5 w-16 bg-[hsl(var(--snug-light-gray))] rounded" />
            <div className="h-4 w-20 bg-[hsl(var(--snug-light-gray))] rounded" />
          </div>
        </div>
      </div>
    );
  }

  // Grid View Skeleton
  if (viewMode === 'grid') {
    return (
      <div className="animate-pulse">
        {/* Image Skeleton */}
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[hsl(var(--snug-light-gray))]">
          {/* Tags Skeleton */}
          <div className="absolute top-2.5 left-2.5 flex gap-1.5">
            <div className="w-14 h-5 bg-gray-200 rounded-full" />
            <div className="w-12 h-5 bg-gray-200 rounded-full" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="pt-2.5">
          {/* Location */}
          <div className="h-4 w-3/4 bg-[hsl(var(--snug-light-gray))] rounded mb-1.5" />

          {/* Room Info */}
          <div className="h-3.5 w-full bg-[hsl(var(--snug-light-gray))] rounded mb-1" />

          {/* Guests */}
          <div className="h-3.5 w-1/3 bg-[hsl(var(--snug-light-gray))] rounded mb-2" />

          {/* Price */}
          <div className="flex items-baseline gap-1.5">
            <div className="h-4 w-14 bg-[hsl(var(--snug-light-gray))] rounded" />
            <div className="h-3 w-16 bg-[hsl(var(--snug-light-gray))] rounded" />
          </div>
        </div>
      </div>
    );
  }

  // List View Skeleton (default)
  return (
    <div className="flex gap-3 py-3 animate-pulse">
      {/* Image Skeleton */}
      <div className="w-[120px] h-[90px] flex-shrink-0 rounded-lg bg-[hsl(var(--snug-light-gray))]" />

      {/* Content Skeleton */}
      <div className="flex-1 min-w-0">
        {/* Location & Tags Row */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="h-4 w-1/2 bg-[hsl(var(--snug-light-gray))] rounded" />
          <div className="flex gap-1 flex-shrink-0">
            <div className="w-12 h-4 bg-[hsl(var(--snug-light-gray))] rounded-full" />
            <div className="w-10 h-4 bg-[hsl(var(--snug-light-gray))] rounded-full" />
          </div>
        </div>

        {/* Room Info */}
        <div className="h-3 w-2/3 bg-[hsl(var(--snug-light-gray))] rounded mb-1" />

        {/* Price */}
        <div className="flex items-baseline gap-1.5 mt-2">
          <div className="h-4 w-12 bg-[hsl(var(--snug-light-gray))] rounded" />
          <div className="h-3 w-16 bg-[hsl(var(--snug-light-gray))] rounded" />
        </div>
      </div>
    </div>
  );
}

// Helper component to render multiple skeletons
interface RoomCardSkeletonListProps {
  count?: number;
  viewMode?: 'list' | 'grid' | 'mobile';
}

export function RoomCardSkeletonList({ count = 6, viewMode = 'list' }: RoomCardSkeletonListProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <RoomCardSkeleton key={index} viewMode={viewMode} />
      ))}
    </>
  );
}
