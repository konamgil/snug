'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowLeft, ImageIcon, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Header } from '@/widgets/header';
import { getAccommodationPublic } from '@/shared/api/accommodation';
import type { AccommodationPhoto } from '@snug/types';

interface ImageCategory {
  id: string;
  name: string;
  count: number;
  images: string[];
}

interface ImageGalleryPageProps {
  roomId: string;
}

// Category labels (Korean names matching DEFAULT_PHOTO_GROUPS)
const categoryLabels: Record<string, { ko: string; en: string }> = {
  all: { ko: '전체', en: 'All Photos' },
  main: { ko: '대표사진', en: 'Main Photo' },
  room: { ko: '방', en: 'Bedroom' },
  living_room: { ko: '거실', en: 'Living Room' },
  kitchen: { ko: '부엌', en: 'Kitchen' },
  bathroom: { ko: '화장실', en: 'Bathroom' },
  exterior: { ko: '외관', en: 'Exterior' },
  other: { ko: '기타', en: 'Other' },
};

// Get label based on locale
function getCategoryLabel(categoryId: string, locale: string): string {
  const labels = categoryLabels[categoryId];
  if (!labels) return categoryId;
  return locale === 'ko' ? labels.ko : labels.en;
}

// Category order for consistent display
const CATEGORY_ORDER = ['main', 'room', 'living_room', 'kitchen', 'bathroom', 'exterior', 'other'];

// Transform API photos to categories
function photosToCategories(photos: AccommodationPhoto[], locale: string): ImageCategory[] {
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

  // Add 'all' category first
  if (photos.length > 0) {
    categories.push({
      id: 'all',
      name: getCategoryLabel('all', locale),
      count: photos.length,
      images: photos.map((p) => p.url),
    });
  }

  // Add individual categories in order
  CATEGORY_ORDER.forEach((categoryId) => {
    const images = categoryMap.get(categoryId);
    if (images && images.length > 0) {
      categories.push({
        id: categoryId,
        name: getCategoryLabel(categoryId, locale),
        count: images.length,
        images,
      });
      categoryMap.delete(categoryId);
    }
  });

  // Add any remaining categories not in CATEGORY_ORDER
  categoryMap.forEach((images, categoryId) => {
    categories.push({
      id: categoryId,
      name: getCategoryLabel(categoryId, locale),
      count: images.length,
      images,
    });
  });

  return categories;
}

export function ImageGalleryPage({ roomId }: ImageGalleryPageProps) {
  const router = useRouter();
  const locale = useLocale();
  const [categories, setCategories] = useState<ImageCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPhotos() {
      setIsLoading(true);
      try {
        const data = await getAccommodationPublic(roomId);
        if (data?.photos && data.photos.length > 0) {
          const cats = photosToCategories(data.photos, locale);
          setCategories(cats);
          setSelectedCategory(cats[0]?.id || 'all');
        }
      } catch (error) {
        console.error('Failed to fetch photos:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPhotos();
  }, [roomId, locale]);

  const currentCategory = categories.find((c) => c.id === selectedCategory) || categories[0];
  const currentImages = currentCategory?.images || [];

  const handleBack = () => {
    router.back();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header variant="with-search" onBack={handleBack} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--snug-orange))]" />
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

      {/* Category Tabs */}
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
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedCategory === category.id
                      ? 'border-[hsl(var(--snug-orange))]'
                      : 'border-transparent'
                  }`}
                >
                  {category.images[0] ? (
                    <Image
                      src={category.images[0]}
                      alt={category.name}
                      fill
                      sizes="64px"
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
                    {category.name}
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
                  alt={`${currentCategory?.name} ${index + 1}`}
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
