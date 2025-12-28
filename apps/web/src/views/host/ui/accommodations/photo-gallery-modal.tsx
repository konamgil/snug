'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { PhotoCategory, PhotoItem } from './types';
import { DEFAULT_PHOTO_GROUPS } from './types';

// Extended photo type with category info for combined view
interface DisplayPhoto extends PhotoItem {
  categoryId: string;
  categoryName: string;
}

// Sortable photo component for drag and drop
interface SortablePhotoProps {
  photo: DisplayPhoto;
  index: number;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  onDelete: (photoId: string, categoryId: string) => void;
  getPhotoHeight: (photo: PhotoItem, index: number) => number;
  showCategoryLabel: boolean;
}

function SortablePhoto({
  photo,
  index,
  isHovered,
  onHover,
  onDelete,
  getPhotoHeight,
  showCategoryLabel,
}: SortablePhotoProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: photo.id,
  });

  const height = getPhotoHeight(photo, index);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    height: `${height}px`,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative w-[230px] overflow-hidden touch-none"
      onMouseEnter={() => onHover(photo.id)}
      onMouseLeave={() => onHover(null)}
      {...attributes}
      {...listeners}
    >
      <Image
        src={photo.url}
        alt={`${photo.categoryName} ${index + 1}`}
        fill
        className="object-cover pointer-events-none"
      />

      {/* Category label - only show in combined view (no tabs) */}
      {showCategoryLabel && (
        <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 rounded pointer-events-none">
          <span className="text-[10px] text-white">{photo.categoryName}</span>
        </div>
      )}

      {/* Hover Overlay with Delete Button */}
      {isHovered && !isDragging && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(photo.id, photo.categoryId);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="w-8 h-8 rounded-full bg-[#f0f0f0] flex items-center justify-center hover:bg-[#e0e0e0] transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-[#da1e28]" />
          </button>
        </div>
      )}
    </div>
  );
}

interface PhotoGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: PhotoCategory[];
  initialCategoryId?: string;
  onSave: (categories: PhotoCategory[]) => void;
  onAddPhotos?: (categoryId: string) => void;
}

export function PhotoGalleryModal({
  isOpen,
  onClose,
  categories,
  initialCategoryId,
  onSave,
  onAddPhotos,
}: PhotoGalleryModalProps) {
  const tPhotoGroups = useTranslations('host.accommodation.photoGroups');

  // Initialize with categories prop (evaluated on mount)
  const [localCategories, setLocalCategories] = useState<PhotoCategory[]>(() => {
    if (categories.length === 0) {
      return DEFAULT_PHOTO_GROUPS.map((g) => ({
        id: g.id,
        name: tPhotoGroups(g.id),
        photos: [],
        order: g.order,
      }));
    }
    return [...categories];
  });
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(initialCategoryId || 'main');
  const [hoveredPhotoId, setHoveredPhotoId] = useState<string | null>(null);
  const [isGroupSelectOpen, setIsGroupSelectOpen] = useState(false);
  const [addTargetGroupId, setAddTargetGroupId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag and drop sensors for PC (pointer) and mobile (touch)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
  );

  if (!isOpen) return null;

  const selectedCategory = localCategories.find((c) => c.id === selectedCategoryId);

  // Check if any group has 2+ photos - determines if thumbnail tabs are shown
  const shouldShowThumbnailTabs = localCategories.some((cat) => cat.photos.length >= 2);

  // Get categories with photos for thumbnail tabs
  const categoriesWithPhotos = localCategories.filter((cat) => cat.photos.length > 0);

  // Combine all photos from all groups with category info
  const allPhotosWithCategory: DisplayPhoto[] = localCategories.flatMap((cat) =>
    cat.photos.map((photo) => ({
      ...photo,
      categoryId: cat.id,
      categoryName: cat.name,
    })),
  );

  // Determine which photos to display
  const photosToDisplay: DisplayPhoto[] = shouldShowThumbnailTabs
    ? selectedCategory?.photos.map((photo) => ({
        ...photo,
        categoryId: selectedCategory.id,
        categoryName: selectedCategory.name,
      })) || []
    : allPhotosWithCategory;

  const handleDeletePhoto = (photoId: string, categoryId: string) => {
    setLocalCategories(
      localCategories.map((cat) =>
        cat.id === categoryId
          ? { ...cat, photos: cat.photos.filter((p) => p.id !== photoId) }
          : cat,
      ),
    );
  };

  const handleAddPhotosClick = () => {
    // If tabs are shown, add to selected category directly
    // If no tabs (combined view), show group selection dropdown
    if (shouldShowThumbnailTabs) {
      if (onAddPhotos) {
        onAddPhotos(selectedCategoryId);
      } else {
        setAddTargetGroupId(selectedCategoryId);
        fileInputRef.current?.click();
      }
    } else {
      setIsGroupSelectOpen(true);
    }
  };

  const handleSelectGroupForAdd = (groupId: string) => {
    setIsGroupSelectOpen(false);
    if (onAddPhotos) {
      onAddPhotos(groupId);
    } else {
      setAddTargetGroupId(groupId);
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const targetGroupId = addTargetGroupId || selectedCategoryId;
    const targetCategory = localCategories.find((c) => c.id === targetGroupId);

    const newPhotos: PhotoItem[] = Array.from(files).map((file, index) => ({
      id: `photo_${Date.now()}_${index}`,
      url: URL.createObjectURL(file),
      order: (targetCategory?.photos.length ?? 0) + index,
    }));

    setLocalCategories(
      localCategories.map((cat) =>
        cat.id === targetGroupId ? { ...cat, photos: [...cat.photos, ...newPhotos] } : cat,
      ),
    );

    e.target.value = '';
    setAddTargetGroupId(null);
  };

  const handleSave = () => {
    onSave(localCategories);
    onClose();
  };

  // Determine photo orientation (placeholder logic - in real app would check actual image dimensions)
  const getPhotoHeight = (_photo: PhotoItem, index: number): number => {
    // Alternate between landscape (153px) and portrait (326px) for demo
    // In production, this would be based on actual image aspect ratio
    return index % 3 === 0 ? 326 : 153;
  };

  // Handle drag end - reorder photos within category
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Find which category the dragged photo belongs to
    const draggedPhoto = photosToDisplay.find((p) => p.id === active.id);
    if (!draggedPhoto) return;

    const categoryId = draggedPhoto.categoryId;

    setLocalCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;

        const oldIndex = cat.photos.findIndex((p) => p.id === active.id);
        const newIndex = cat.photos.findIndex((p) => p.id === over.id);

        if (oldIndex === -1 || newIndex === -1) return cat;

        const reordered = arrayMove(cat.photos, oldIndex, newIndex);
        return {
          ...cat,
          photos: reordered.map((p, i) => ({ ...p, order: i })),
        };
      }),
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal - 520px width */}
      <div className="relative w-[520px] max-h-[90vh] bg-white shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-14 bg-white border-b border-[#e0e0e0]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1 hover:bg-[hsl(var(--snug-light-gray))] rounded transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-[hsl(var(--snug-text-primary))]" />
            </button>
            <h3 className="text-base font-bold text-[hsl(var(--snug-text-primary))]">
              사진 전체보기
            </h3>
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={handleAddPhotosClick}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-[hsl(var(--snug-text-primary))] hover:bg-[hsl(var(--snug-light-gray))] rounded transition-colors"
            >
              <Plus className="w-4 h-4" />
              사진 추가
            </button>

            {/* Group Selection Dropdown - shown when no tabs */}
            {isGroupSelectOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsGroupSelectOpen(false)} />
                <div className="absolute top-full right-0 mt-1 bg-white border border-[#e0e0e0] rounded-lg shadow-lg z-20 min-w-[140px] py-1">
                  {localCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleSelectGroupForAdd(cat.id)}
                      className="block w-full px-4 py-3 text-sm text-left text-[hsl(var(--snug-text-primary))] hover:bg-[hsl(var(--snug-light-gray))] transition-colors"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Thumbnail Tabs - only show if any group has 2+ photos */}
        {shouldShowThumbnailTabs && categoriesWithPhotos.length > 0 && (
          <div className="flex items-center gap-2.5 px-5 py-4 bg-white border-b border-[#e0e0e0] overflow-x-auto no-scrollbar">
            {categoriesWithPhotos.map((cat) => {
              const firstPhoto = cat.photos[0];
              const isSelected = selectedCategoryId === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`relative flex-shrink-0 w-[100px] h-[100px] overflow-hidden ${
                    isSelected ? 'ring-2 ring-[#ff7900]' : ''
                  }`}
                >
                  {firstPhoto && (
                    <Image src={firstPhoto.url} alt={cat.name} fill className="object-cover" />
                  )}
                  {/* Category name overlay */}
                  <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-black/50">
                    <span className="text-[10px] text-white">{cat.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Content - Photo Grid with Drag and Drop */}
        <div className="flex-1 overflow-y-auto px-5 py-5 no-scrollbar">
          {photosToDisplay.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={photosToDisplay.map((p) => p.id)}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-2 gap-5">
                  {photosToDisplay.map((photo, index) => (
                    <SortablePhoto
                      key={photo.id}
                      photo={photo}
                      index={index}
                      isHovered={hoveredPhotoId === photo.id}
                      onHover={setHoveredPhotoId}
                      onDelete={handleDeletePhoto}
                      getPhotoHeight={getPhotoHeight}
                      showCategoryLabel={!shouldShowThumbnailTabs}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-sm text-[hsl(var(--snug-gray))]">등록된 사진이 없습니다.</p>
            </div>
          )}
        </div>

        {/* Footer - 80px height */}
        <div className="flex items-center gap-3 px-5 h-20 bg-white border-t border-[#e0e0e0]">
          <button
            type="button"
            onClick={onClose}
            className="w-[140px] h-10 text-sm text-[hsl(var(--snug-text-primary))] bg-[#f3f3f3] hover:bg-[#e8e8e8] transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 h-10 text-sm text-white bg-[hsl(var(--snug-orange))] hover:opacity-90 transition-opacity"
          >
            저장
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
