'use client';

import { useState, useRef } from 'react';
import { ImagePlus, Plus, Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';
import type { PhotoCategory, PhotoItem } from './types';
import { DEFAULT_PHOTO_GROUPS } from './types';
import { GroupManagementModal, type GroupItem } from './group-management-modal';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: PhotoCategory[];
  onSave: (categories: PhotoCategory[]) => void;
  onViewGallery?: (categoryId: string, currentCategories: PhotoCategory[]) => void;
}

export function PhotoUploadModal({
  isOpen,
  onClose,
  categories,
  onSave,
  onViewGallery,
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
  const [isGroupManagementOpen, setIsGroupManagementOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [hoveredGroupId, setHoveredGroupId] = useState<string | null>(null);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [dragOverGroupId, setDragOverGroupId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Convert localCategories to GroupItem format for the modal
  const groupsForModal: GroupItem[] = localCategories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    isSelected: false,
    accommodationIds: [],
  }));

  // Handle save from group management modal
  const handleGroupManagementSave = (updatedGroups: GroupItem[]) => {
    // Add new groups that don't exist in localCategories
    const existingIds = localCategories.map((c) => c.id);
    const newGroups = updatedGroups.filter((g) => !existingIds.includes(g.id));

    if (newGroups.length > 0) {
      const newCategories: PhotoCategory[] = newGroups.map((g, index) => ({
        id: g.id,
        name: g.name,
        photos: [],
        order: localCategories.length + index,
      }));
      setLocalCategories([...localCategories, ...newCategories]);
    }
  };

  // Default group IDs that cannot be deleted
  const defaultGroupIds: string[] = DEFAULT_PHOTO_GROUPS.map((g) => g.id);

  const handleClearPhotos = (groupId: string) => {
    // Clear photos from the group, not delete the group itself
    setLocalCategories(localCategories.map((g) => (g.id === groupId ? { ...g, photos: [] } : g)));
  };

  const handleDeleteGroup = (groupId: string) => {
    // Only allow deleting custom groups (not default ones)
    if (defaultGroupIds.includes(groupId)) return;
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

  // Check if there are any photos
  const hasAnyPhotos = localCategories.some((g) => g.photos.length > 0);

  const getGroupThumbnails = (photos: PhotoItem[]) => {
    return photos.slice(0, 4);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent, groupId: string) => {
    e.preventDefault();
    setDragOverGroupId(groupId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverGroupId(null);
  };

  const handleDrop = (e: React.DragEvent, groupId: string) => {
    e.preventDefault();
    setDragOverGroupId(null);

    const files = e.dataTransfer.files;
    if (!files.length) return;

    const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (!imageFiles.length) return;

    const targetGroup = localCategories.find((g) => g.id === groupId);
    const newPhotos: PhotoItem[] = imageFiles.map((file, index) => ({
      id: `photo_${Date.now()}_${index}`,
      url: URL.createObjectURL(file),
      order: (targetGroup?.photos.length ?? 0) + index,
    }));

    setLocalCategories(
      localCategories.map((g) =>
        g.id === groupId ? { ...g, photos: [...g.photos, ...newPhotos] } : g,
      ),
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal - 520px width as per Figma */}
      <div className="relative w-[520px] max-h-[90vh] bg-white shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative px-5 pt-6 pb-4 bg-white">
          <h3 className="text-lg font-bold text-[hsl(var(--snug-text-primary))]">사진 등록</h3>
          <p className="text-xs text-[hsl(var(--snug-gray))] mt-2">숙소의 사진을 등록해주세요.</p>

          {/* Header Actions */}
          <div className="absolute top-6 right-5">
            <button
              type="button"
              onClick={() => setIsGroupManagementOpen(true)}
              className="flex items-center gap-0.5 px-2 py-2 text-xs text-[hsl(var(--snug-text-primary))] hover:bg-[hsl(var(--snug-light-gray))] rounded transition-colors"
            >
              <Plus className="w-4 h-4" />
              그룹 관리
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-5 no-scrollbar">
          {/* Photo Groups Grid - 2 columns, 230x230 items */}
          <div className="grid grid-cols-2 gap-5">
            {localCategories.map((group) => {
              const thumbnails = getGroupThumbnails(group.photos);
              const hasPhotos = group.photos.length > 0;

              return (
                <div key={group.id} className="flex flex-col">
                  {/* Photo Preview Area - 230x230 */}
                  <div
                    className={`relative w-[230px] h-[230px] overflow-hidden cursor-pointer transition-colors ${
                      dragOverGroupId === group.id
                        ? 'bg-orange-50 ring-2 ring-[hsl(var(--snug-orange))]'
                        : 'bg-[#f4f4f4]'
                    }`}
                    onMouseEnter={() => setHoveredGroupId(group.id)}
                    onMouseLeave={() => {
                      setHoveredGroupId(null);
                      setHoveredButton(null);
                    }}
                    onClick={() => !hasPhotos && handleFileSelect(group.id)}
                    onDragOver={handleDragOver}
                    onDragEnter={(e) => handleDragEnter(e, group.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, group.id)}
                  >
                    {hasPhotos ? (
                      <div className="grid grid-cols-2 gap-2.5 p-2.5 h-full">
                        {/* 4 thumbnail slots - 100x100 each */}
                        {[0, 1, 2, 3].map((slotIndex) => {
                          const photo = thumbnails[slotIndex];
                          return (
                            <div
                              key={slotIndex}
                              className={`w-[100px] h-[100px] overflow-hidden ${photo ? 'bg-black' : ''}`}
                            >
                              {photo && (
                                <div className="relative w-full h-full">
                                  <Image
                                    src={photo.url}
                                    alt={`${group.name} ${slotIndex + 1}`}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center hover:bg-[#e8e8e8] transition-colors">
                        <ImagePlus className="w-5 h-5 text-[#525252]" />
                      </div>
                    )}

                    {/* Hover Overlay - only show when has photos */}
                    {hasPhotos && hoveredGroupId === group.id && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="flex items-center gap-3.5">
                          {/* View Gallery Button */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewGallery?.(group.id, localCategories);
                              }}
                              onMouseEnter={() => setHoveredButton(`view-${group.id}`)}
                              onMouseLeave={() => setHoveredButton(null)}
                              className="w-8 h-8 rounded-full bg-[#f0f0f0] flex items-center justify-center hover:bg-[#e0e0e0] transition-colors"
                            >
                              <ImagePlus className="w-3.5 h-3.5 text-[#161616]" />
                            </button>
                            {hoveredButton === `view-${group.id}` && (
                              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1.5 bg-[#393939] rounded-md whitespace-nowrap">
                                <span className="text-[10px] text-white">
                                  {group.name} 전체보기
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Edit Button */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFileSelect(group.id);
                              }}
                              onMouseEnter={() => setHoveredButton(`edit-${group.id}`)}
                              onMouseLeave={() => setHoveredButton(null)}
                              className="w-8 h-8 rounded-full bg-[#f0f0f0] flex items-center justify-center hover:bg-[#e0e0e0] transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5 text-[#161616]" />
                            </button>
                            {hoveredButton === `edit-${group.id}` && (
                              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1.5 bg-[#393939] rounded-md whitespace-nowrap">
                                <span className="text-[10px] text-white">수정</span>
                              </div>
                            )}
                          </div>

                          {/* Delete Button - clears photos for default groups, deletes group for custom */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (defaultGroupIds.includes(group.id)) {
                                  handleClearPhotos(group.id);
                                } else {
                                  handleDeleteGroup(group.id);
                                }
                              }}
                              onMouseEnter={() => setHoveredButton(`delete-${group.id}`)}
                              onMouseLeave={() => setHoveredButton(null)}
                              className="w-8 h-8 rounded-full bg-[#f0f0f0] flex items-center justify-center hover:bg-[#e0e0e0] transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-[#da1e28]" />
                            </button>
                            {hoveredButton === `delete-${group.id}` && (
                              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1.5 bg-[#393939] rounded-md whitespace-nowrap">
                                <span className="text-[10px] text-white">
                                  {defaultGroupIds.includes(group.id) ? '사진 삭제' : '그룹 삭제'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Group Label - centered */}
                  <div className="flex items-center justify-center gap-1.5 mt-2">
                    <span className="text-xs text-[hsl(var(--snug-text-primary))]">
                      {group.name}
                    </span>
                    <span className="text-xs text-[hsl(var(--snug-text-primary))]">
                      {group.photos.length}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer - 80px height */}
        <div className="flex items-center gap-3 px-5 h-20 bg-white">
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
            disabled={!hasAnyPhotos}
            className={`flex-1 h-10 text-sm text-white transition-colors ${
              hasAnyPhotos
                ? 'bg-[hsl(var(--snug-orange))] hover:opacity-90'
                : 'bg-[#c6c6c6] cursor-not-allowed'
            }`}
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

      {/* Group Management Modal */}
      <GroupManagementModal
        isOpen={isGroupManagementOpen}
        onClose={() => setIsGroupManagementOpen(false)}
        groups={groupsForModal}
        onSave={handleGroupManagementSave}
      />
    </div>
  );
}
