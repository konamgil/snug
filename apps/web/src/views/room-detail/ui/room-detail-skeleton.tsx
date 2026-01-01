/**
 * 숙소 상세 페이지 스켈레톤 UI
 * 로딩 중 콘텐츠 레이아웃을 미리 보여주어 CLS 방지 및 UX 개선
 */
export function RoomDetailSkeleton() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      {/* Mobile Image Gallery Skeleton */}
      <div className="lg:hidden">
        <div className="relative aspect-[4/3] bg-gray-200">
          {/* Back button placeholder */}
          <div className="absolute top-4 left-4 w-9 h-9 bg-white/90 rounded-full" />
          {/* Heart button placeholder */}
          <div className="absolute top-4 right-4 w-9 h-9 bg-white/90 rounded-full" />
          {/* Tags placeholder */}
          <div className="absolute bottom-4 left-4 flex gap-2">
            <div className="w-20 h-7 bg-white/80 rounded-full" />
            <div className="w-16 h-7 bg-white/80 rounded-full" />
          </div>
          {/* Image counter placeholder */}
          <div className="absolute bottom-4 right-4 w-24 h-7 bg-black/40 rounded-full" />
        </div>
      </div>

      {/* Desktop Header Skeleton */}
      <div className="hidden lg:block h-16 border-b border-gray-100" />

      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-6 pb-32 lg:pb-6">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Desktop Image Gallery Skeleton */}
            <div className="hidden lg:block relative aspect-[16/10] rounded-2xl overflow-hidden mb-6 bg-gray-200">
              {/* Tags placeholder */}
              <div className="absolute top-4 left-4 flex gap-2">
                <div className="w-20 h-7 bg-white/80 rounded-full" />
                <div className="w-16 h-7 bg-white/80 rounded-full" />
              </div>
              {/* Navigation arrows */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full" />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full" />
              {/* Image counter */}
              <div className="absolute bottom-4 right-4 w-28 h-8 bg-black/40 rounded-full" />
            </div>

            {/* Thumbnail Grid Skeleton - Desktop */}
            <div className="hidden lg:grid grid-cols-6 gap-2 mb-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-square rounded-lg bg-gray-200" />
              ))}
            </div>

            {/* Title & Location Skeleton */}
            <div className="mb-4">
              {/* Title */}
              <div className="h-7 lg:h-8 bg-gray-200 rounded-lg w-3/4 mb-2" />
              {/* Location */}
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>

            {/* Room Info Skeleton - Mobile */}
            <div className="lg:hidden flex items-center gap-4 pb-6">
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 bg-gray-300 rounded" />
                <div className="h-3 w-24 bg-gray-200 rounded" />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 bg-gray-300 rounded" />
                <div className="h-3 w-16 bg-gray-200 rounded" />
              </div>
            </div>

            {/* Room Info Skeleton - Desktop */}
            <div className="hidden lg:block pb-6">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-4 h-4 bg-gray-300 rounded" />
                <div className="h-4 w-32 bg-gray-200 rounded" />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 bg-gray-300 rounded" />
                <div className="h-4 w-20 bg-gray-200 rounded" />
              </div>
            </div>

            {/* Mobile Room Type Card Skeleton */}
            <div className="lg:hidden py-6">
              <div className="p-5 border border-gray-200 rounded-full">
                <div className="h-5 bg-gray-200 rounded w-1/3 mx-auto mb-2" />
                <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto" />
              </div>
            </div>

            {/* Section Skeletons */}
            {[...Array(4)].map((_, i) => (
              <div key={i} className="py-6 border-t border-gray-100">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="h-5 bg-gray-200 rounded w-32" />
                  <div className="w-5 h-5 bg-gray-200 rounded" />
                </div>
                {/* Section Content */}
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                  <div className="h-4 bg-gray-200 rounded w-4/6" />
                </div>
              </div>
            ))}

            {/* Facilities Grid Skeleton */}
            <div className="py-6 border-t border-gray-100">
              <div className="h-5 bg-gray-200 rounded w-24 mb-4" />
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                    <div className="h-4 bg-gray-200 rounded w-24" />
                  </div>
                ))}
              </div>
            </div>

            {/* Map Skeleton */}
            <div className="py-6 border-t border-gray-100">
              <div className="h-5 bg-gray-200 rounded w-20 mb-4" />
              <div className="h-3 bg-gray-200 rounded w-48 mb-3" />
              <div className="h-[200px] lg:h-[300px] bg-gray-200 rounded-2xl" />
            </div>

            {/* Similar Rooms Skeleton */}
            <div className="py-6 border-t border-gray-100">
              <div className="h-5 bg-gray-200 rounded w-32 mb-4" />
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="aspect-[4/3] bg-gray-200 rounded-xl" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Sidebar Skeleton */}
          <div className="hidden lg:block w-[340px] flex-shrink-0">
            <div className="sticky top-24">
              {/* Date & Guest Selector */}
              <div className="border border-gray-200 rounded-[20px] p-4 mb-4">
                <div className="flex items-center h-11">
                  <div className="flex items-center gap-1.5 flex-1">
                    <div className="w-3 h-3 bg-gray-300 rounded" />
                    <div className="h-3 w-24 bg-gray-200 rounded" />
                  </div>
                  <div className="w-px h-4 bg-gray-200 mx-3" />
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-gray-300 rounded" />
                    <div className="h-3 w-16 bg-gray-200 rounded" />
                  </div>
                  <div className="w-8 h-8 ml-3 bg-gray-300 rounded-full" />
                </div>
              </div>

              {/* Price Breakdown Skeleton */}
              <div className="border border-gray-200 rounded-[20px] p-5 mb-4">
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="h-3 w-24 bg-gray-200 rounded" />
                      <div className="h-3 w-28 bg-gray-200 rounded" />
                    </div>
                    <div className="h-4 w-16 bg-gray-200 rounded" />
                  </div>
                  <div className="h-px bg-gray-100" />
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
                  <div className="h-px bg-gray-100" />
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-12 bg-gray-200 rounded" />
                    <div className="h-4 w-20 bg-gray-200 rounded" />
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="flex items-center gap-2.5 mt-4">
                  <div className="h-8 w-28 bg-gray-200 rounded" />
                  <div className="flex-1 h-8 bg-gray-300 rounded-full" />
                </div>
              </div>

              {/* Room Type Card Skeleton */}
              <div className="border border-gray-200 rounded-full py-4 px-6">
                <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto mb-2" />
                <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Bar Skeleton */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-5 w-20 bg-gray-200 rounded" />
            <div className="h-3 w-12 bg-gray-200 rounded" />
          </div>
          <div className="h-10 w-24 bg-gray-300 rounded-full" />
        </div>
      </div>
    </div>
  );
}
