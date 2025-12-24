'use client';

import { useState } from 'react';
import { ImagePlus, Pencil } from 'lucide-react';
import Image from 'next/image';
import type { PhotoCategory } from './types';
import { DEFAULT_PHOTO_GROUPS } from './types';

type HoveredButton = 'gallery' | 'edit' | null;

interface PhotoUploadSectionProps {
  categories: PhotoCategory[];
  onChange?: (categories: PhotoCategory[]) => void;
  onAddPhotos?: () => void;
  onViewAll?: () => void;
  onViewGallery?: () => void;
}

export function PhotoUploadSection({
  categories,
  onAddPhotos,
  onViewAll: _onViewAll,
  onViewGallery,
}: PhotoUploadSectionProps) {
  const [hoveredButton, setHoveredButton] = useState<HoveredButton>(null);
  const hasPhotos = categories.some((cat) => cat.photos.length > 0);

  // Get display categories (use defaults if empty)
  const displayCategories =
    categories.length > 0
      ? categories
      : DEFAULT_PHOTO_GROUPS.map((g) => ({
          id: g.id,
          name: g.name,
          photos: [],
          order: g.order,
        }));

  // Get thumbnail for a category (first photo or null)
  const getCategoryThumbnail = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.photos[0]?.url ?? null;
  };

  // Get photo count for a category
  const getCategoryPhotoCount = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.photos.length ?? 0;
  };

  if (!hasPhotos) {
    // Empty state - entire section is clickable
    return (
      <button
        type="button"
        onClick={onAddPhotos}
        className="w-full border border-dashed border-[hsl(var(--snug-border))] rounded-lg py-16 px-8 hover:bg-[hsl(var(--snug-light-gray))] hover:border-[hsl(var(--snug-gray))] transition-colors cursor-pointer"
      >
        <div className="flex flex-col items-center justify-center text-center">
          <p className="text-sm text-[hsl(var(--snug-gray))] mb-2">사진 등록을 해주세요.</p>
          <ImagePlus className="w-8 h-8 text-[hsl(var(--snug-gray))]" />
        </div>
      </button>
    );
  }

  // With photos - grid gallery view (3 columns, 2 rows)
  return (
    <div className="relative group">
      {/* Photo Grid */}
      <div className="grid grid-cols-3 gap-2">
        {displayCategories.slice(0, 5).map((category) => {
          const thumbnail = getCategoryThumbnail(category.id);
          const count = getCategoryPhotoCount(category.id);

          return (
            <div key={category.id} className="flex flex-col">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-[hsl(var(--snug-light-gray))]">
                {thumbnail ? (
                  <Image src={thumbnail} alt={category.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImagePlus className="w-5 h-5 text-[hsl(var(--snug-gray))]" />
                  </div>
                )}
              </div>
              <span className="text-xs text-[hsl(var(--snug-text-primary))] text-center mt-1">
                {category.name} {count}
              </span>
            </div>
          );
        })}
      </div>

      {/* Full section dim overlay + centered buttons (appears on hover) */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="relative flex flex-col items-center">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onViewGallery}
              onMouseEnter={() => setHoveredButton('gallery')}
              onMouseLeave={() => setHoveredButton(null)}
              className="p-2.5 rounded-full bg-white hover:bg-gray-100 transition-colors shadow-md"
            >
              <ImagePlus className="w-5 h-5 text-[hsl(var(--snug-gray))]" />
            </button>
            <button
              type="button"
              onClick={onAddPhotos}
              onMouseEnter={() => setHoveredButton('edit')}
              onMouseLeave={() => setHoveredButton(null)}
              className="p-2.5 rounded-full bg-white hover:bg-gray-100 transition-colors shadow-md"
            >
              <Pencil className="w-5 h-5 text-[hsl(var(--snug-gray))]" />
            </button>
          </div>
          {hoveredButton && (
            <button
              type="button"
              onClick={hoveredButton === 'edit' ? onAddPhotos : onViewGallery}
              className="absolute top-full mt-1 px-3 py-1.5 bg-[hsl(var(--snug-text-primary))]/80 rounded-full text-xs text-white hover:bg-[hsl(var(--snug-text-primary))] transition-colors whitespace-nowrap"
            >
              {hoveredButton === 'edit' ? '수정' : '사진 전체보기'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Preview photo carousel for right panel
interface PhotoPreviewProps {
  photos: PhotoCategory[];
}

export function PhotoPreview({ photos }: PhotoPreviewProps) {
  const allPhotos = photos.flatMap((cat) => cat.photos);
  const mainPhoto = allPhotos[0];

  if (!mainPhoto) {
    return (
      <div className="aspect-video bg-[hsl(var(--snug-light-gray))] rounded-lg flex flex-col items-center justify-center">
        <p className="text-sm text-[hsl(var(--snug-gray))]">등록된 사진이 없습니다.</p>
        <ImagePlus className="w-8 h-8 text-[hsl(var(--snug-gray))] mt-2" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Main image */}
      <div className="relative aspect-video rounded-lg overflow-hidden">
        <Image src={mainPhoto.url} alt="Main photo" fill className="object-cover" />
      </div>

      {/* Thumbnail row */}
      {allPhotos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {allPhotos.slice(0, 4).map((photo, index) => (
            <div
              key={photo.id}
              className="relative w-16 h-12 rounded overflow-hidden flex-shrink-0"
            >
              <Image src={photo.url} alt={`Photo ${index + 1}`} fill className="object-cover" />
            </div>
          ))}
          {allPhotos.length > 4 && (
            <div className="w-16 h-12 rounded bg-[hsl(var(--snug-light-gray))] flex items-center justify-center flex-shrink-0">
              <span className="text-xs text-[hsl(var(--snug-gray))]">+{allPhotos.length - 4}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
