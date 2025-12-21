'use client';

import { useState } from 'react';
import { ChevronLeft, ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Header } from '@/widgets/header';

interface ImageCategory {
  id: string;
  name: string;
  count: number;
  images: string[];
}

interface ImageGalleryPageProps {
  roomId: string;
  categories?: ImageCategory[];
}

// Mock categories data
const defaultCategories: ImageCategory[] = [
  {
    id: 'main',
    name: 'Main Photo',
    count: 6,
    images: Array.from({ length: 6 }, (_, i) => `/images/rooms/main-${i + 1}.jpg`),
  },
  {
    id: 'bedroom',
    name: 'Bedroom',
    count: 10,
    images: Array.from({ length: 10 }, (_, i) => `/images/rooms/bedroom-${i + 1}.jpg`),
  },
  {
    id: 'living',
    name: 'Living Room',
    count: 8,
    images: Array.from({ length: 8 }, (_, i) => `/images/rooms/living-${i + 1}.jpg`),
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    count: 3,
    images: Array.from({ length: 3 }, (_, i) => `/images/rooms/kitchen-${i + 1}.jpg`),
  },
  {
    id: 'bathroom',
    name: 'Bathroom',
    count: 6,
    images: Array.from({ length: 6 }, (_, i) => `/images/rooms/bathroom-${i + 1}.jpg`),
  },
];

export function ImageGalleryPage({
  roomId: _roomId,
  categories = defaultCategories,
}: ImageGalleryPageProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]?.id || 'main');

  const currentCategory = categories.find((c) => c.id === selectedCategory) || categories[0];
  const currentImages = currentCategory?.images || [];

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* PC Header */}
      <Header variant="with-search" showSearch={false} onBack={handleBack} />

      {/* Mobile Header with Back Button */}
      <div className="md:hidden sticky top-0 z-10 bg-white border-b border-[hsl(var(--snug-border))]">
        <div className="max-w-7xl mx-auto px-4">
          <button
            type="button"
            onClick={handleBack}
            className="py-4 flex items-center gap-2 text-[hsl(var(--snug-text-primary))] hover:opacity-70 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="sticky top-[57px] md:top-20 z-10 bg-white border-b border-[hsl(var(--snug-border))]">
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
                  <div className="w-full h-full bg-gradient-to-br from-[hsl(var(--snug-light-gray))] to-[hsl(var(--snug-border))] flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-[hsl(var(--snug-gray))]/30" />
                  </div>
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
          {currentImages.map((image, index) => {
            // Vary heights for masonry effect
            const heightClass =
              index % 3 === 0 ? 'h-[400px]' : index % 3 === 1 ? 'h-[300px]' : 'h-[250px]';

            return (
              <div
                key={`${selectedCategory}-${index}`}
                className={`relative ${heightClass} rounded-xl overflow-hidden break-inside-avoid mb-4`}
              >
                {/* Placeholder */}
                <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--snug-light-gray))] to-[hsl(var(--snug-border))] flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-[hsl(var(--snug-gray))]/30" />
                </div>
                {/* Uncomment when actual images are available */}
                {/* <Image
                  src={image}
                  alt={`${currentCategory?.name} ${index + 1}`}
                  fill
                  className="object-cover"
                /> */}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
