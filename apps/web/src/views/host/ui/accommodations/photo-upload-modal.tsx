'use client';

import { useState, useRef } from 'react';
import { ImagePlus, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import type { PhotoCategory, PhotoItem } from './types';
import { DEFAULT_PHOTO_GROUPS } from './types';
import { GroupManagementModal, type GroupItem } from './group-management-modal';
import {
  uploadFiles,
  validateImageFile,
  compressImage,
  type UploadProgress,
} from '@/shared/lib/storage';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: PhotoCategory[];
  onSave: (categories: PhotoCategory[]) => void;
  onViewGallery?: (categoryId: string, currentCategories: PhotoCategory[]) => void;
  /** 숙소 ID (수정 시 사용, 신규 등록 시 null) */
  accommodationId?: string | null;
}

export function PhotoUploadModal({
  isOpen,
  onClose,
  categories,
  onSave,
  onViewGallery,
  accommodationId = null,
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

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !activeGroupId) return;

    const targetGroupId = activeGroupId;
    setUploadError(null);

    // Validate files
    const fileArray = Array.from(files);
    const validationErrors: string[] = [];

    for (const file of fileArray) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        validationErrors.push(`${file.name}: ${validation.error}`);
      }
    }

    if (validationErrors.length > 0) {
      setUploadError(validationErrors.join('\n'));
      e.target.value = '';
      setActiveGroupId(null);
      return;
    }

    setIsUploading(true);

    try {
      // Compress images before upload
      const compressedFiles = await Promise.all(
        fileArray.map((file) => compressImage(file, 1920, 0.85))
      );

      // Upload to Supabase Storage
      const results = await uploadFiles(
        compressedFiles,
        accommodationId,
        targetGroupId,
        (progress) => setUploadProgress(progress)
      );

      // Filter successful uploads and create photo items
      const targetGroup = localCategories.find((g) => g.id === targetGroupId);
      const successfulUploads = results.filter((r) => r.success && r.url);

      if (successfulUploads.length === 0) {
        setUploadError('모든 파일 업로드에 실패했습니다.');
        return;
      }

      const newPhotos: PhotoItem[] = successfulUploads.map((result, index) => ({
        id: `photo_${Date.now()}_${index}`,
        url: result.url!,
        order: (targetGroup?.photos.length ?? 0) + index,
      }));

      setLocalCategories(
        localCategories.map((g) =>
          g.id === targetGroupId ? { ...g, photos: [...g.photos, ...newPhotos] } : g
        )
      );

      // Show partial success message if some failed
      const failedCount = results.filter((r) => !r.success).length;
      if (failedCount > 0) {
        setUploadError(`${successfulUploads.length}개 업로드 완료, ${failedCount}개 실패`);
      }
    } catch (error) {
      console.error('[PhotoUpload] Error:', error);
      setUploadError('업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
      setUploadProgress([]);
      e.target.value = '';
      setActiveGroupId(null);
    }
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

  const handleDrop = async (e: React.DragEvent, groupId: string) => {
    e.preventDefault();
    setDragOverGroupId(null);

    const files = e.dataTransfer.files;
    if (!files.length) return;

    const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (!imageFiles.length) return;

    setUploadError(null);

    // Validate files
    const validationErrors: string[] = [];
    for (const file of imageFiles) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        validationErrors.push(`${file.name}: ${validation.error}`);
      }
    }

    if (validationErrors.length > 0) {
      setUploadError(validationErrors.join('\n'));
      return;
    }

    setIsUploading(true);

    try {
      // Compress images before upload
      const compressedFiles = await Promise.all(
        imageFiles.map((file) => compressImage(file, 1920, 0.85))
      );

      // Upload to Supabase Storage
      const results = await uploadFiles(
        compressedFiles,
        accommodationId,
        groupId,
        (progress) => setUploadProgress(progress)
      );

      // Filter successful uploads and create photo items
      const targetGroup = localCategories.find((g) => g.id === groupId);
      const successfulUploads = results.filter((r) => r.success && r.url);

      if (successfulUploads.length === 0) {
        setUploadError('모든 파일 업로드에 실패했습니다.');
        return;
      }

      const newPhotos: PhotoItem[] = successfulUploads.map((result, index) => ({
        id: `photo_${Date.now()}_${index}`,
        url: result.url!,
        order: (targetGroup?.photos.length ?? 0) + index,
      }));

      setLocalCategories(
        localCategories.map((g) =>
          g.id === groupId ? { ...g, photos: [...g.photos, ...newPhotos] } : g
        )
      );

      // Show partial success message if some failed
      const failedCount = results.filter((r) => !r.success).length;
      if (failedCount > 0) {
        setUploadError(`${successfulUploads.length}개 업로드 완료, ${failedCount}개 실패`);
      }
    } catch (error) {
      console.error('[PhotoUpload] Drop error:', error);
      setUploadError('업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
      setUploadProgress([]);
    }
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

        {/* Upload Progress Overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-white/90 z-10 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--snug-orange))] mb-4" />
            <p className="text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-2">
              업로드 중...
            </p>
            {uploadProgress.length > 0 && (
              <div className="w-64 space-y-2">
                {uploadProgress.map((item, index) => (
                  <div key={index} className="text-xs">
                    <div className="flex justify-between mb-1">
                      <span className="truncate max-w-[180px]">{item.fileName}</span>
                      <span>{item.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#e0e0e0] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          item.status === 'error'
                            ? 'bg-red-500'
                            : item.status === 'completed'
                              ? 'bg-green-500'
                              : 'bg-[hsl(var(--snug-orange))]'
                        }`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {uploadError && (
          <div className="mx-5 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-600 whitespace-pre-line">{uploadError}</p>
            <button
              type="button"
              onClick={() => setUploadError(null)}
              className="text-xs text-red-500 underline mt-1"
            >
              닫기
            </button>
          </div>
        )}

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
            disabled={isUploading}
            className="w-[140px] h-10 text-sm text-[hsl(var(--snug-text-primary))] bg-[#f3f3f3] hover:bg-[#e8e8e8] transition-colors disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasAnyPhotos || isUploading}
            className={`flex-1 h-10 text-sm text-white transition-colors ${
              hasAnyPhotos && !isUploading
                ? 'bg-[hsl(var(--snug-orange))] hover:opacity-90'
                : 'bg-[#c6c6c6] cursor-not-allowed'
            }`}
          >
            {isUploading ? '업로드 중...' : '사진 저장'}
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
