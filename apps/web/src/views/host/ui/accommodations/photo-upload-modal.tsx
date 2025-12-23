'use client';

import { useState, useRef } from 'react';
import { ImagePlus, Pencil, Trash2, MoreVertical } from 'lucide-react';
import Image from 'next/image';
import type { PhotoCategory, PhotoItem } from './types';
import { DEFAULT_PHOTO_GROUPS } from './types';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: PhotoCategory[];
  onSave: (categories: PhotoCategory[]) => void;
  onViewAll: () => void;
}

export function PhotoUploadModal({
  isOpen,
  onClose,
  categories,
  onSave,
  onViewAll,
}: PhotoUploadModalProps) {
  const [localCategories, setLocalCategories] = useState<PhotoCategory[]>(() => {
    // Initialize with default groups if empty
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
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddGroup = () => {
    if (!newGroupName.trim()) return;
    const newGroup: PhotoCategory = {
      id: `custom_${Date.now()}`,
      name: newGroupName.trim(),
      photos: [],
      order: localCategories.length,
    };
    setLocalCategories([...localCategories, newGroup]);
    setNewGroupName('');
    setIsAddGroupOpen(false);
  };

  const handleDeleteGroup = (groupId: string) => {
    // Don't delete default "main" group
    if (groupId === 'main') return;
    setLocalCategories(localCategories.filter((g) => g.id !== groupId));
  };

  const handleFileSelect = (groupId: string) => {
    setActiveGroupId(groupId);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !activeGroupId) return;

    const newPhotos: PhotoItem[] = Array.from(files).map((file, index) => ({
      id: `photo_${Date.now()}_${index}`,
      url: URL.createObjectURL(file),
      order: localCategories.find((g) => g.id === activeGroupId)?.photos.length ?? 0 + index,
    }));

    setLocalCategories(
      localCategories.map((g) =>
        g.id === activeGroupId ? { ...g, photos: [...g.photos, ...newPhotos] } : g,
      ),
    );

    e.target.value = '';
    setActiveGroupId(null);
  };

  const handleSave = () => {
    onSave(localCategories);
    onClose();
  };

  const getGroupThumbnails = (photos: PhotoItem[]) => {
    return photos.slice(0, 4);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--snug-border))]">
          <div>
            <h3 className="text-lg font-bold text-[hsl(var(--snug-text-primary))]">사진 등록</h3>
            <p className="text-sm text-[hsl(var(--snug-gray))] mt-1">숙소의 사진을 등록해주세요.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddGroupOpen(true)}
              className="text-sm text-[hsl(var(--snug-text-primary))] hover:underline"
            >
              + 그룹 추가
            </button>
            <button
              type="button"
              className="p-2 hover:bg-[hsl(var(--snug-light-gray))] rounded-lg transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-[hsl(var(--snug-text-primary))]" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Add Group Input */}
          {isAddGroupOpen && (
            <div className="mb-4 p-4 bg-[hsl(var(--snug-light-gray))] rounded-lg">
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="그룹명 입력"
                className="w-full px-3 py-2 border border-[hsl(var(--snug-border))] rounded-lg text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                autoFocus
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setIsAddGroupOpen(false)}
                  className="px-3 py-1.5 text-sm text-[hsl(var(--snug-gray))]"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleAddGroup}
                  className="px-3 py-1.5 text-sm text-white bg-[hsl(var(--snug-orange))] rounded-lg"
                >
                  추가
                </button>
              </div>
            </div>
          )}

          {/* Photo Groups Grid */}
          <div className="grid grid-cols-2 gap-4">
            {localCategories.map((group) => {
              const thumbnails = getGroupThumbnails(group.photos);
              const hasPhotos = group.photos.length > 0;
              const isHovered = hoveredGroup === group.id;

              return (
                <div
                  key={group.id}
                  className="relative"
                  onMouseEnter={() => setHoveredGroup(group.id)}
                  onMouseLeave={() => setHoveredGroup(null)}
                >
                  {/* Photo Preview Area */}
                  <div
                    className={`aspect-square rounded-lg overflow-hidden ${
                      hasPhotos ? 'bg-white' : 'bg-[hsl(40,30%,93%)]'
                    }`}
                  >
                    {hasPhotos ? (
                      <div className="grid grid-cols-2 gap-0.5 h-full">
                        {thumbnails.map((photo, index) => (
                          <div
                            key={photo.id}
                            className={`relative overflow-hidden ${
                              thumbnails.length === 1
                                ? 'col-span-2 row-span-2'
                                : thumbnails.length === 2
                                  ? 'row-span-2'
                                  : thumbnails.length === 3 && index === 0
                                    ? 'row-span-2'
                                    : ''
                            }`}
                          >
                            <Image
                              src={photo.url}
                              alt={`${group.name} ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImagePlus className="w-8 h-8 text-[hsl(var(--snug-gray))]" />
                      </div>
                    )}

                    {/* Hover Actions */}
                    {isHovered && (
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={onViewAll}
                            onMouseEnter={() => setHoveredButton('view')}
                            onMouseLeave={() => setHoveredButton(null)}
                            className="p-3 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-md"
                          >
                            <ImagePlus className="w-5 h-5 text-[hsl(var(--snug-gray))]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFileSelect(group.id)}
                            onMouseEnter={() => setHoveredButton('edit')}
                            onMouseLeave={() => setHoveredButton(null)}
                            className="p-3 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-md"
                          >
                            <Pencil className="w-5 h-5 text-[hsl(var(--snug-gray))]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteGroup(group.id)}
                            onMouseEnter={() => setHoveredButton('delete')}
                            onMouseLeave={() => setHoveredButton(null)}
                            className="p-3 bg-white rounded-full hover:bg-red-50 transition-colors shadow-md"
                            disabled={group.id === 'main'}
                          >
                            <Trash2
                              className={`w-5 h-5 ${group.id === 'main' ? 'text-gray-300' : 'text-red-500'}`}
                            />
                          </button>
                        </div>
                        <span className="text-sm text-white">
                          {hoveredButton === 'view' && `${group.name} 전체보기`}
                          {hoveredButton === 'edit' && `${group.name} 수정`}
                          {hoveredButton === 'delete' && `${group.name} 삭제`}
                          {!hoveredButton && `${group.name} 전체보기`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Group Label */}
                  <div className="text-center mt-2">
                    <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                      {group.name}{' '}
                      <span className="text-[hsl(var(--snug-gray))]">{group.photos.length}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
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
            사진 저장
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
