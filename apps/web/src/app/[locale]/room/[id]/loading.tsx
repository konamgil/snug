export default function RoomDetailLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Desktop Header Skeleton */}
      <div className="hidden md:block sticky top-0 z-50 bg-white border-b border-[hsl(var(--snug-border))]">
        <div className="h-20 flex items-center justify-between px-6">
          <div className="h-8 w-24 bg-[hsl(var(--snug-light-gray))] rounded animate-pulse" />
          <div className="h-11 w-[400px] bg-[hsl(var(--snug-light-gray))] rounded-full animate-pulse" />
          <div className="h-8 w-32 bg-[hsl(var(--snug-light-gray))] rounded animate-pulse" />
        </div>
      </div>

      {/* Mobile Image Skeleton */}
      <div className="lg:hidden">
        <div className="relative aspect-[4/3] bg-[hsl(var(--snug-light-gray))] animate-pulse">
          {/* Back button skeleton */}
          <div className="absolute top-4 left-4 w-9 h-9 bg-white/90 rounded-full" />
          {/* Heart button skeleton */}
          <div className="absolute top-4 right-4 w-9 h-9 bg-white/90 rounded-full" />
          {/* Tags skeleton */}
          <div className="absolute bottom-4 left-4 flex gap-2">
            <div className="h-7 w-20 bg-white/80 rounded-full" />
            <div className="h-7 w-16 bg-white/80 rounded-full" />
          </div>
          {/* Image counter skeleton */}
          <div className="absolute bottom-4 right-4 h-6 w-12 bg-black/30 rounded-full" />
        </div>

        {/* Mobile Content Skeleton */}
        <div className="px-4 pt-4 pb-24">
          {/* Title */}
          <div className="h-6 w-3/4 bg-[hsl(var(--snug-light-gray))] rounded animate-pulse mb-2" />
          {/* Location */}
          <div className="h-4 w-1/2 bg-[hsl(var(--snug-light-gray))] rounded animate-pulse mb-4" />

          {/* Room info */}
          <div className="flex gap-4 mb-6">
            <div className="h-4 w-16 bg-[hsl(var(--snug-light-gray))] rounded animate-pulse" />
            <div className="h-4 w-16 bg-[hsl(var(--snug-light-gray))] rounded animate-pulse" />
            <div className="h-4 w-16 bg-[hsl(var(--snug-light-gray))] rounded animate-pulse" />
          </div>

          {/* Description skeleton */}
          <div className="space-y-2 mb-6">
            <div className="h-4 w-full bg-[hsl(var(--snug-light-gray))] rounded animate-pulse" />
            <div className="h-4 w-full bg-[hsl(var(--snug-light-gray))] rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-[hsl(var(--snug-light-gray))] rounded animate-pulse" />
          </div>

          {/* Facilities skeleton */}
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-5 h-5 bg-[hsl(var(--snug-light-gray))] rounded animate-pulse" />
                <div className="h-4 w-20 bg-[hsl(var(--snug-light-gray))] rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Bottom Bar Skeleton */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[hsl(var(--snug-border))] px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-5 w-24 bg-[hsl(var(--snug-light-gray))] rounded animate-pulse mb-1" />
              <div className="h-3 w-16 bg-[hsl(var(--snug-light-gray))] rounded animate-pulse" />
            </div>
            <div className="h-11 w-28 bg-[hsl(var(--snug-orange))]/30 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>

      {/* Desktop Layout Skeleton */}
      <div className="hidden lg:block max-w-7xl mx-auto px-6 py-6">
        {/* Image Grid Skeleton */}
        <div className="grid grid-cols-4 gap-2 mb-8 rounded-xl overflow-hidden">
          <div className="col-span-2 row-span-2 aspect-[4/3] bg-[hsl(var(--snug-light-gray))] animate-pulse" />
          <div className="aspect-[4/3] bg-[hsl(var(--snug-light-gray))] animate-pulse" />
          <div className="aspect-[4/3] bg-[hsl(var(--snug-light-gray))] animate-pulse" />
          <div className="aspect-[4/3] bg-[hsl(var(--snug-light-gray))] animate-pulse" />
          <div className="aspect-[4/3] bg-[hsl(var(--snug-light-gray))] animate-pulse" />
        </div>

        <div className="flex gap-12">
          {/* Left Content Skeleton */}
          <div className="flex-1">
            {/* Title & Tags */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="h-8 w-96 bg-[hsl(var(--snug-light-gray))] rounded animate-pulse mb-2" />
                <div className="h-5 w-48 bg-[hsl(var(--snug-light-gray))] rounded animate-pulse" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-24 bg-[hsl(var(--snug-light-gray))] rounded-full animate-pulse" />
                <div className="h-8 w-20 bg-[hsl(var(--snug-light-gray))] rounded-full animate-pulse" />
              </div>
            </div>

            {/* Room info */}
            <div className="flex gap-6 mb-6 pb-6 border-b border-[hsl(var(--snug-border))]">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-4 w-20 bg-[hsl(var(--snug-light-gray))] rounded animate-pulse"
                />
              ))}
            </div>

            {/* Description */}
            <div className="space-y-2 mb-8">
              <div className="h-4 w-full bg-[hsl(var(--snug-light-gray))] rounded animate-pulse" />
              <div className="h-4 w-full bg-[hsl(var(--snug-light-gray))] rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-[hsl(var(--snug-light-gray))] rounded animate-pulse" />
            </div>

            {/* Facilities grid */}
            <div className="grid grid-cols-3 gap-4">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-[hsl(var(--snug-light-gray))] rounded animate-pulse" />
                  <div className="h-4 w-24 bg-[hsl(var(--snug-light-gray))] rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Side Panel Skeleton */}
          <div className="w-[380px] flex-shrink-0">
            <div className="sticky top-28 border border-[hsl(var(--snug-border))] rounded-xl p-6">
              {/* Price */}
              <div className="h-8 w-32 bg-[hsl(var(--snug-light-gray))] rounded animate-pulse mb-6" />

              {/* Date picker */}
              <div className="h-14 w-full bg-[hsl(var(--snug-light-gray))] rounded-lg animate-pulse mb-4" />

              {/* Guests */}
              <div className="h-14 w-full bg-[hsl(var(--snug-light-gray))] rounded-lg animate-pulse mb-6" />

              {/* Price breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <div className="h-4 w-24 bg-[hsl(var(--snug-light-gray))] rounded animate-pulse" />
                  <div className="h-4 w-16 bg-[hsl(var(--snug-light-gray))] rounded animate-pulse" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-20 bg-[hsl(var(--snug-light-gray))] rounded animate-pulse" />
                  <div className="h-4 w-16 bg-[hsl(var(--snug-light-gray))] rounded animate-pulse" />
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between pt-4 border-t border-[hsl(var(--snug-border))]">
                <div className="h-5 w-16 bg-[hsl(var(--snug-light-gray))] rounded animate-pulse" />
                <div className="h-5 w-20 bg-[hsl(var(--snug-light-gray))] rounded animate-pulse" />
              </div>

              {/* Book button */}
              <div className="h-12 w-full bg-[hsl(var(--snug-orange))]/30 rounded-lg animate-pulse mt-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
