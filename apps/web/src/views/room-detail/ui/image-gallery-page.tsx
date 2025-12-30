'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { ArrowLeft, ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Header } from '@/widgets/header';
import { useAccommodationPublic } from '@/shared/api/accommodation';
import type { AccommodationPhoto } from '@snug/types';

interface ImageCategory {
  id: string;
  count: number;
  images: string[];
}

interface ImageGalleryPageProps {
  roomId: string;
}

// Category order for consistent display
const CATEGORY_ORDER = ['main', 'room', 'living_room', 'kitchen', 'bathroom'];

// Transform API photos to categories
function photosToCategories(photos: AccommodationPhoto[]): ImageCategory[] {
  const categoryMap = new Map<string, string[]>();

  // Group photos by category
  photos.forEach((photo) => {
    const category = photo.category || 'other';
    if (!categoryMap.has(category)) {
      categoryMap.set(category, []);
    }
    categoryMap.get(category)!.push(photo.url);
  });

  // Convert to ImageCategory array
  const categories: ImageCategory[] = [];

  // Add individual categories in order
  CATEGORY_ORDER.forEach((categoryId) => {
    const images = categoryMap.get(categoryId);
    if (images && images.length > 0) {
      categories.push({
        id: categoryId,
        count: images.length,
        images,
      });
      categoryMap.delete(categoryId);
    }
  });

  // Add any remaining categories not in CATEGORY_ORDER (custom groups)
  categoryMap.forEach((images, categoryId) => {
    categories.push({
      id: categoryId,
      count: images.length,
      images,
    });
  });

  return categories;
}

export function ImageGalleryPage({ roomId }: ImageGalleryPageProps) {
  const router = useRouter();
  const t = useTranslations('host.accommodation.photoGroups');
  const tGallery = useTranslations('gallery');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Use React Query hook for caching - data shared with detail page
  const { data: accommodation, isLoading } = useAccommodationPublic(roomId);

  // Get category label with translation
  const getCategoryLabel = (categoryId: string): string => {
    // Default groups use translations
    if (['main', 'room', 'living_room', 'kitchen', 'bathroom'].includes(categoryId)) {
      return t(categoryId);
    }
    // Custom groups (group_XXX) - show as generic name
    return tGallery('customGroup');
  };

  // Memoize categories transformation
  const categories = useMemo(() => {
    if (!accommodation?.photos || accommodation.photos.length === 0) {
      return [];
    }
    return photosToCategories(accommodation.photos);
  }, [accommodation?.photos]);

  const currentCategory = categories.find((c) => c.id === selectedCategory) || categories[0];
  const currentImages = currentCategory?.images || [];

  // 카테고리 중 2개 이상 사진이 있는 그룹이 있는지 체크
  const hasMultiplePhotosInAnyCategory = categories.some((c) => c.count > 1);

  const handleBack = () => {
    router.back();
  };

  // Loading state with skeleton UI
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header variant="with-search" onBack={handleBack} />

        {/* PC Back Button Skeleton */}
        <div className="hidden md:block max-w-7xl mx-auto px-4 pt-4">
          <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Category Tabs Skeleton */}
        <div className="sticky top-14 md:top-20 z-10 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-4 py-4 overflow-x-auto no-scrollbar">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2">
                  <div className="w-28 h-28 rounded-lg bg-gray-200 animate-pulse" />
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-12 h-3 bg-gray-200 rounded animate-pulse" />
                    <div className="w-6 h-3 bg-gray-100 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Image Grid Skeleton */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="columns-2 gap-4 space-y-4">
            {[400, 300, 250, 400, 300, 250].map((height, i) => (
              <div
                key={i}
                className={`bg-gray-200 rounded-xl animate-pulse break-inside-avoid mb-4`}
                style={{ height: `${height}px` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // No photos state
  if (categories.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Header variant="with-search" onBack={handleBack} />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <ImageIcon className="w-16 h-16 text-[hsl(var(--snug-gray))]/30" />
          <p className="text-[hsl(var(--snug-gray))]">No photos available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Search */}
      <Header variant="with-search" onBack={handleBack} />

      {/* PC Back Button */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 pt-4">
        <button
          type="button"
          onClick={handleBack}
          className="p-1 hover:opacity-70 transition-opacity"
        >
          <ArrowLeft className="w-5 h-5 text-[hsl(var(--snug-text-primary))]" />
        </button>
      </div>

      {/* Category Tabs - 그룹별 2개 이상 사진이 있을 때만 표시 */}
      {hasMultiplePhotosInAnyCategory && (
        <div className="sticky top-14 md:top-20 z-10 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-4 py-4 overflow-x-auto no-scrollbar">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex-shrink-0 flex flex-col items-center gap-2 transition-opacity ${
                    selectedCategory === category.id ? 'opacity-100' : 'opacity-50 hover:opacity-75'
                  }`}
                >
                  {/* Thumbnail */}
                  <div
                    className={`relative w-28 h-28 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedCategory === category.id
                        ? 'border-[hsl(var(--snug-orange))]'
                        : 'border-transparent'
                    }`}
                  >
                    {category.images[0] ? (
                      <Image
                        src={category.images[0]}
                        alt={getCategoryLabel(category.id)}
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[hsl(var(--snug-light-gray))] to-[hsl(var(--snug-border))] flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-[hsl(var(--snug-gray))]/30" />
                      </div>
                    )}
                  </div>
                  {/* Label */}
                  <div className="text-center">
                    <span className="text-xs font-medium text-[hsl(var(--snug-text-primary))]">
                      {getCategoryLabel(category.id)}
                    </span>
                    <span className="text-xs text-[hsl(var(--snug-gray))] ml-1">
                      {category.count}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Masonry Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="columns-2 gap-4 space-y-4">
          {currentImages.map((imageUrl, index) => {
            // Vary heights for masonry effect
            const heightClass =
              index % 3 === 0 ? 'h-[400px]' : index % 3 === 1 ? 'h-[300px]' : 'h-[250px]';

            return (
              <div
                key={`${selectedCategory}-${index}`}
                className={`relative ${heightClass} rounded-xl overflow-hidden break-inside-avoid mb-4`}
              >
                <Image
                  src={imageUrl}
                  alt={`${getCategoryLabel(currentCategory?.id || 'all')} ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
