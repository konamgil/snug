'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Check, Pencil, Plus } from 'lucide-react';
import { DEFAULT_PHOTO_GROUPS } from './types';

// 기본 그룹 ID (삭제 불가)
const DEFAULT_GROUP_IDS: string[] = DEFAULT_PHOTO_GROUPS.map((g) => g.id);

export interface GroupItem {
  id: string;
  name: string;
  isSelected: boolean;
  accommodationIds: string[];
}

export interface AccommodationSimple {
  id: string;
  name: string;
  thumbnailUrl?: string;
}

interface GroupManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: GroupItem[];
  accommodations?: AccommodationSimple[];
  onSave: (groups: GroupItem[]) => void;
}

export function GroupManagementModal({
  isOpen,
  onClose,
  groups,
  accommodations = [],
  onSave,
}: GroupManagementModalProps) {
  const [localGroups, setLocalGroups] = useState<GroupItem[]>(() => [...groups]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(
    groups.length > 0 ? (groups[0]?.id ?? null) : null,
  );
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState('');
  const newGroupInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // 새 그룹 추가 모드 진입 시 input에 포커스
  useEffect(() => {
    if (isAddingGroup && newGroupInputRef.current) {
      newGroupInputRef.current.focus();
    }
  }, [isAddingGroup]);

  // 수정 모드 진입 시 input에 포커스
  useEffect(() => {
    if (editingGroupId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingGroupId]);

  if (!isOpen) return null;

  const selectedGroup = localGroups.find((g) => g.id === selectedGroupId);

  const handleAddGroup = () => {
    if (!newGroupName.trim()) {
      setIsAddingGroup(false);
      return;
    }

    const newGroup: GroupItem = {
      id: `group_${Date.now()}`,
      name: newGroupName.trim(),
      isSelected: false,
      accommodationIds: [],
    };

    setLocalGroups([...localGroups, newGroup]);
    setSelectedGroupId(newGroup.id);
    setNewGroupName('');
    setIsAddingGroup(false);
  };

  const handleStartEdit = (group: GroupItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (DEFAULT_GROUP_IDS.includes(group.id)) return;
    setEditingGroupId(group.id);
    setEditingGroupName(group.name);
  };

  const handleSaveEdit = () => {
    if (!editingGroupId || !editingGroupName.trim()) {
      setEditingGroupId(null);
      setEditingGroupName('');
      return;
    }

    setLocalGroups(
      localGroups.map((g) =>
        g.id === editingGroupId ? { ...g, name: editingGroupName.trim() } : g,
      ),
    );
    setEditingGroupId(null);
    setEditingGroupName('');
  };

  const handleCancelEdit = () => {
    setEditingGroupId(null);
    setEditingGroupName('');
  };

  const handleDeleteGroup = (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (DEFAULT_GROUP_IDS.includes(groupId)) return;

    const newGroups = localGroups.filter((g) => g.id !== groupId);
    setLocalGroups(newGroups);

    // 삭제된 그룹이 선택된 상태였다면 첫 번째 그룹 선택
    if (selectedGroupId === groupId) {
      setSelectedGroupId(newGroups.length > 0 ? (newGroups[0]?.id ?? null) : null);
    }
  };

  const handleToggleAccommodation = (accommodationId: string) => {
    if (!selectedGroupId) return;

    setLocalGroups((groups) => {
      const targetGroup = groups.find((g) => g.id === selectedGroupId);
      const isCurrentlyInGroup = targetGroup?.accommodationIds.includes(accommodationId);

      return groups.map((g) => {
        if (g.id === selectedGroupId) {
          // Toggle in target group
          const ids = isCurrentlyInGroup
            ? g.accommodationIds.filter((id) => id !== accommodationId)
            : [...g.accommodationIds, accommodationId];
          return { ...g, accommodationIds: ids };
        }
        // Remove from other groups when adding to target group
        if (!isCurrentlyInGroup) {
          return {
            ...g,
            accommodationIds: g.accommodationIds.filter((id) => id !== accommodationId),
          };
        }
        return g;
      });
    });
  };

  // 숙소가 어떤 그룹에 속해있는지 찾기
  const getAccommodationGroup = (accId: string): GroupItem | undefined => {
    return localGroups.find((g) => g.accommodationIds.includes(accId));
  };

  const handleSave = () => {
    onSave(localGroups);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-[400px] max-h-[90vh] bg-white shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative px-5 pt-5 pb-4 bg-white border-b border-[#e0e0e0]">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-4 p-2 hover:bg-[hsl(var(--snug-light-gray))] rounded transition-colors"
          >
            <X className="w-4 h-4 text-[hsl(var(--snug-text-primary))]" />
          </button>

          <h3 className="text-lg font-bold text-[hsl(var(--snug-text-primary))]">그룹 관리</h3>
          <p className="text-xs text-[hsl(var(--snug-gray))] mt-2 leading-relaxed">
            그룹을 선택한 후 아래에서 숙소를 추가하세요.
          </p>
        </div>

        {/* Group Tabs */}
        <div className="px-5 py-3 bg-[hsl(var(--snug-light-gray))]/30 border-b border-[#e0e0e0]">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-minimal pb-1">
            {localGroups.map((group) => {
              const isActive = selectedGroupId === group.id;
              const isEditing = editingGroupId === group.id;

              return (
                <div key={group.id} className="flex-shrink-0 relative group/tab">
                  {isEditing ? (
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editingGroupName}
                      onChange={(e) => setEditingGroupName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit();
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      onBlur={handleSaveEdit}
                      className="h-8 px-3 min-w-[80px] bg-white border border-[hsl(var(--snug-orange))] rounded-full text-sm text-[hsl(var(--snug-text-primary))] focus:outline-none"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSelectedGroupId(group.id)}
                      className={`h-8 px-4 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-[hsl(var(--snug-orange))] text-white'
                          : 'bg-white border border-[#d0d0d0] text-[hsl(var(--snug-text-primary))] hover:border-[hsl(var(--snug-orange))]'
                      }`}
                    >
                      <span>{group.name}</span>
                      <span
                        className={`text-xs ${isActive ? 'text-white/80' : 'text-[hsl(var(--snug-gray))]'}`}
                      >
                        ({group.accommodationIds.length})
                      </span>
                    </button>
                  )}

                  {/* 그룹 옵션 (수정/삭제) - 기본 그룹 제외 */}
                  {!DEFAULT_GROUP_IDS.includes(group.id) && !isEditing && isActive && (
                    <div className="absolute -top-1 -right-1 flex gap-0.5">
                      <button
                        type="button"
                        onClick={(e) => handleStartEdit(group, e)}
                        className="w-5 h-5 flex items-center justify-center rounded-full bg-white border border-[#d0d0d0] hover:border-[hsl(var(--snug-orange))] transition-colors"
                      >
                        <Pencil className="w-2.5 h-2.5 text-[hsl(var(--snug-gray))]" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteGroup(group.id, e)}
                        className="w-5 h-5 flex items-center justify-center rounded-full bg-white border border-[#d0d0d0] hover:border-red-400 hover:bg-red-50 transition-colors"
                      >
                        <X className="w-2.5 h-2.5 text-[hsl(var(--snug-gray))]" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* 새 그룹 추가 */}
            {isAddingGroup ? (
              <input
                ref={newGroupInputRef}
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddGroup();
                  if (e.key === 'Escape') {
                    setIsAddingGroup(false);
                    setNewGroupName('');
                  }
                }}
                onBlur={handleAddGroup}
                placeholder="그룹명"
                className="h-8 px-3 min-w-[80px] bg-white border border-[hsl(var(--snug-orange))] rounded-full text-sm text-[hsl(var(--snug-text-primary))] placeholder:text-[#a8a8a8] focus:outline-none flex-shrink-0"
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingGroup(true)}
                className="h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-full border border-dashed border-[hsl(var(--snug-gray))] hover:border-[hsl(var(--snug-orange))] hover:bg-[hsl(var(--snug-orange))]/5 transition-colors"
              >
                <Plus className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
              </button>
            )}
          </div>
        </div>

        {/* Accommodations Pool */}
        <div className="flex-1 overflow-y-auto scrollbar-minimal">
          {selectedGroup ? (
            <div className="py-2">
              {accommodations.length > 0 ? (
                <>
                  {/* 선택된 그룹에 속한 숙소 먼저, 나머지 숙소 나중에 */}
                  {[...accommodations]
                    .sort((a, b) => {
                      const aInGroup = selectedGroup.accommodationIds.includes(a.id);
                      const bInGroup = selectedGroup.accommodationIds.includes(b.id);
                      if (aInGroup && !bInGroup) return -1;
                      if (!aInGroup && bInGroup) return 1;
                      return 0;
                    })
                    .map((acc, index, sortedArr) => {
                      const isInSelectedGroup = selectedGroup.accommodationIds.includes(acc.id);
                      const belongsToGroup = getAccommodationGroup(acc.id);
                      const isInOtherGroup =
                        belongsToGroup && belongsToGroup.id !== selectedGroupId;

                      // 구분선 표시 (선택된 숙소와 미선택 숙소 사이)
                      const prevItem = index > 0 ? sortedArr[index - 1] : null;
                      const prevInGroup =
                        prevItem && selectedGroup.accommodationIds.includes(prevItem.id);
                      const showDivider = !isInSelectedGroup && prevInGroup;

                      return (
                        <div key={acc.id}>
                          {showDivider && (
                            <div className="mx-4 my-3 flex items-center gap-2">
                              <div className="flex-1 border-t border-dashed border-[hsl(var(--snug-gray))]/30" />
                              <span className="text-[10px] text-[hsl(var(--snug-gray))]">
                                미할당 숙소
                              </span>
                              <div className="flex-1 border-t border-dashed border-[hsl(var(--snug-gray))]/30" />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => handleToggleAccommodation(acc.id)}
                            className={`w-full flex items-center gap-3 px-5 py-3 cursor-pointer transition-all ${
                              isInSelectedGroup
                                ? 'bg-[hsl(var(--snug-orange))]/10 border-l-3 border-l-[hsl(var(--snug-orange))]'
                                : 'hover:bg-[hsl(var(--snug-light-gray))]/50 border-l-3 border-l-transparent'
                            }`}
                          >
                            {/* 숙소 정보 */}
                            <div className="flex-1 text-left">
                              <span
                                className={`block text-sm ${
                                  isInSelectedGroup
                                    ? 'text-[hsl(var(--snug-text-primary))] font-medium'
                                    : 'text-[hsl(var(--snug-text-primary))]'
                                }`}
                              >
                                {acc.name}
                              </span>
                              {isInOtherGroup && (
                                <span className="text-xs text-[hsl(var(--snug-gray))]">
                                  현재: {belongsToGroup.name}
                                </span>
                              )}
                            </div>

                            {/* 체크 아이콘 */}
                            <div
                              className={`w-6 h-6 flex items-center justify-center rounded-full transition-colors flex-shrink-0 ${
                                isInSelectedGroup
                                  ? 'bg-[hsl(var(--snug-orange))]'
                                  : 'border-2 border-[hsl(var(--snug-gray))]/30'
                              }`}
                            >
                              {isInSelectedGroup && (
                                <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                              )}
                            </div>
                          </button>
                        </div>
                      );
                    })}
                </>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-sm text-[hsl(var(--snug-gray))]">등록된 숙소가 없습니다.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-sm text-[hsl(var(--snug-gray))]">그룹을 선택해주세요.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-5 py-4 bg-white border-t border-[#e0e0e0]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 text-sm font-medium text-[hsl(var(--snug-text-primary))] bg-[#f4f4f4] hover:bg-[#e8e8e8] rounded-lg transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 h-11 text-sm font-medium text-white bg-[hsl(var(--snug-orange))] hover:opacity-90 rounded-lg transition-opacity"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
