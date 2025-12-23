'use client';

import { useState } from 'react';
import { X, Trash2, GripVertical, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import type { PhotoCategory } from './types';
import { DEFAULT_PHOTO_GROUPS } from './types';

interface PhotoGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: PhotoCategory[];
  onSave: (categories: PhotoCategory[]) => void;
}

export function PhotoGalleryModal({ isOpen, onClose, categories, onSave }: PhotoGalleryModalProps) {
  const [localCategories, setLocalCategories] = useState<PhotoCategory[]>(() => {
    if (categories.length === 0) {
      return DEFAULT_PHOTO_GROUPS.map((g) => ({
        id: g.id,
        name: g.name,
        photos: [],
        order: g.order,
      }));
    }
    return [...categories];
  });
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('main');
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(new Set());
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  if (!isOpen) return null;

  const selectedCategory = localCategories.find((c) => c.id === selectedCategoryId);

  const allPhotos = localCategories.flatMap((c) => c.photos);
  const totalPhotoCount = allPhotos.length;

  const handleTogglePhoto = (photoId: string) => {
    const newSelected = new Set(selectedPhotoIds);
    if (newSelected.has(photoId)) {
      newSelected.delete(photoId);
    } else {
      newSelected.add(photoId);
    }
    setSelectedPhotoIds(newSelected);
  };

  const handleSelectAll = () => {
    if (!selectedCategory) return;
    const allCategoryPhotoIds = new Set(selectedCategory.photos.map((p) => p.id));
    setSelectedPhotoIds(allCategoryPhotoIds);
  };

  const handleDeselectAll = () => {
    setSelectedPhotoIds(new Set());
  };

  const handleDeleteSelected = () => {
    setLocalCategories(
      localCategories.map((cat) => ({
        ...cat,
        photos: cat.photos.filter((p) => !selectedPhotoIds.has(p.id)),
      })),
    );
    setSelectedPhotoIds(new Set());
  };

  const handleMoveToCategory = (targetCategoryId: string) => {
    if (!selectedCategory || targetCategoryId === selectedCategoryId) return;

    const photosToMove = selectedCategory.photos.filter((p) => selectedPhotoIds.has(p.id));

    setLocalCategories(
      localCategories.map((cat) => {
        if (cat.id === selectedCategoryId) {
          return {
            ...cat,
            photos: cat.photos.filter((p) => !selectedPhotoIds.has(p.id)),
          };
        }
        if (cat.id === targetCategoryId) {
          return {
            ...cat,
            photos: [
              ...cat.photos,
              ...photosToMove.map((p, i) => ({
                ...p,
                order: cat.photos.length + i,
              })),
            ],
          };
        }
        return cat;
      }),
    );
    setSelectedPhotoIds(new Set());
  };

  const handleDeletePhoto = (photoId: string) => {
    setLocalCategories(
      localCategories.map((cat) => ({
        ...cat,
        photos: cat.photos.filter((p) => p.id !== photoId),
      })),
    );
    selectedPhotoIds.delete(photoId);
    setSelectedPhotoIds(new Set(selectedPhotoIds));
  };

  const handleSave = () => {
    onSave(localCategories);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--snug-border))]">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-bold text-[hsl(var(--snug-text-primary))]">
              사진 전체보기
            </h3>
            <span className="text-sm text-[hsl(var(--snug-gray))]">총 {totalPhotoCount}장</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-[hsl(var(--snug-light-gray))] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[hsl(var(--snug-text-primary))]" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-[hsl(var(--snug-border))] overflow-x-auto">
          {localCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategoryId(cat.id);
                setSelectedPhotoIds(new Set());
              }}
              className={`px-4 py-2 text-sm rounded-lg whitespace-nowrap transition-colors ${
                selectedCategoryId === cat.id
                  ? 'bg-[hsl(var(--snug-orange))] text-white font-medium'
                  : 'text-[hsl(var(--snug-text-primary))] hover:bg-[hsl(var(--snug-light-gray))]'
              }`}
            >
              {cat.name} ({cat.photos.length})
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 bg-[hsl(var(--snug-light-gray))]">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={
                  selectedCategory
                    ? selectedPhotoIds.size === selectedCategory.photos.length &&
                      selectedCategory.photos.length > 0
                    : false
                }
                onChange={(e) => (e.target.checked ? handleSelectAll() : handleDeselectAll())}
                className="w-5 h-5 rounded border-[hsl(var(--snug-border))] text-[hsl(var(--snug-orange))] focus:ring-[hsl(var(--snug-orange))]"
              />
              <span className="text-sm text-[hsl(var(--snug-text-primary))]">전체 선택</span>
            </label>
            {selectedPhotoIds.size > 0 && (
              <span className="text-sm text-[hsl(var(--snug-gray))]">
                {selectedPhotoIds.size}개 선택됨
              </span>
            )}
          </div>

          {selectedPhotoIds.size > 0 && (
            <div className="flex items-center gap-2">
              {/* Move to category dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-[hsl(var(--snug-text-primary))] border border-[hsl(var(--snug-border))] rounded-lg hover:bg-white transition-colors"
                >
                  그룹 이동
                  <ChevronDown className="w-4 h-4" />
                </button>
                {isCategoryDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsCategoryDropdownOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-1 bg-white border border-[hsl(var(--snug-border))] rounded-lg shadow-lg z-20 min-w-[120px]">
                      {localCategories
                        .filter((c) => c.id !== selectedCategoryId)
                        .map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              handleMoveToCategory(cat.id);
                              setIsCategoryDropdownOpen(false);
                            }}
                            className="block w-full px-4 py-2 text-sm text-left text-[hsl(var(--snug-text-primary))] hover:bg-[hsl(var(--snug-light-gray))]"
                          >
                            {cat.name}
                          </button>
                        ))}
                    </div>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={handleDeleteSelected}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-500 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                삭제
              </button>
            </div>
          )}
        </div>

        {/* Content - Photo Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedCategory && selectedCategory.photos.length > 0 ? (
            <div className="grid grid-cols-4 gap-4">
              {selectedCategory.photos.map((photo, index) => (
                <div
                  key={photo.id}
                  className={`relative group aspect-square rounded-lg overflow-hidden ${
                    selectedPhotoIds.has(photo.id) ? 'ring-2 ring-[hsl(var(--snug-orange))]' : ''
                  }`}
                >
                  <Image
                    src={photo.url}
                    alt={`${selectedCategory.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors">
                    {/* Checkbox */}
                    <div className="absolute top-2 left-2">
                      <input
                        type="checkbox"
                        checked={selectedPhotoIds.has(photo.id)}
                        onChange={() => handleTogglePhoto(photo.id)}
                        className="w-5 h-5 rounded border-[hsl(var(--snug-border))] text-[hsl(var(--snug-orange))] focus:ring-[hsl(var(--snug-orange))] bg-white"
                      />
                    </div>

                    {/* Drag handle (for future drag-and-drop) */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical className="w-5 h-5 text-white cursor-move" />
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="absolute bottom-2 right-2 p-1.5 bg-white/90 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>

                    {/* Photo number */}
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 rounded text-xs text-white">
                      {index + 1}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-sm text-[hsl(var(--snug-gray))]">
                이 그룹에 등록된 사진이 없습니다.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[hsl(var(--snug-border))]">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-sm font-medium text-[hsl(var(--snug-text-primary))] border border-[hsl(var(--snug-border))] rounded-lg hover:bg-[hsl(var(--snug-light-gray))] transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-3 text-sm font-bold text-white bg-[hsl(var(--snug-orange))] rounded-lg hover:opacity-90 transition-opacity"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
