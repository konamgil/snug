'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Check, Plus, Trash2, Edit3, ChevronLeft, ChevronRight } from 'lucide-react';
import { DEFAULT_PHOTO_GROUPS } from './types';

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
  const tabsRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (tabsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsRef.current) {
      const scrollAmount = 150;
      tabsRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [localGroups]);

  useEffect(() => {
    if (isAddingGroup && newGroupInputRef.current) {
      newGroupInputRef.current.focus();
    }
  }, [isAddingGroup]);

  useEffect(() => {
    if (editingGroupId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingGroupId]);

  if (!isOpen) return null;

  const selectedGroup = localGroups.find((g) => g.id === selectedGroupId);
  const isDefaultGroup = selectedGroupId ? DEFAULT_GROUP_IDS.includes(selectedGroupId) : false;

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

  const handleStartEdit = () => {
    if (!selectedGroup || isDefaultGroup) return;
    setEditingGroupId(selectedGroup.id);
    setEditingGroupName(selectedGroup.name);
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

  const handleDeleteGroup = () => {
    if (!selectedGroupId || isDefaultGroup) return;
    const newGroups = localGroups.filter((g) => g.id !== selectedGroupId);
    setLocalGroups(newGroups);
    setSelectedGroupId(newGroups.length > 0 ? (newGroups[0]?.id ?? null) : null);
  };

  const handleToggleAccommodation = (accommodationId: string) => {
    if (!selectedGroupId) return;
    setLocalGroups((groups) => {
      const targetGroup = groups.find((g) => g.id === selectedGroupId);
      const isCurrentlyInGroup = targetGroup?.accommodationIds.includes(accommodationId);
      return groups.map((g) => {
        if (g.id === selectedGroupId) {
          const ids = isCurrentlyInGroup
            ? g.accommodationIds.filter((id) => id !== accommodationId)
            : [...g.accommodationIds, accommodationId];
          return { ...g, accommodationIds: ids };
        }
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

  const getAccommodationGroup = (accId: string): GroupItem | undefined => {
    return localGroups.find((g) => g.accommodationIds.includes(accId));
  };

  const handleSave = () => {
    onSave(localGroups);
    onClose();
  };

  const sortedAccommodations = selectedGroup
    ? [...accommodations].sort((a, b) => {
        const aIn = selectedGroup.accommodationIds.includes(a.id) ? 0 : 1;
        const bIn = selectedGroup.accommodationIds.includes(b.id) ? 0 : 1;
        return aIn - bIn;
      })
    : accommodations;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full sm:w-[400px] mx-4 sm:mx-0 max-h-[90vh] sm:max-h-[85vh] bg-white rounded-xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#eee]">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[hsl(var(--snug-text-primary))]">그룹 관리</h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 -mr-1.5 hover:bg-[#f5f5f5] rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
            </button>
          </div>
        </div>

        {/* Group Tabs */}
        <div className="relative group/tabs px-4 py-3 bg-[#fafafa]">
          {/* 왼쪽 화살표 - 데스크톱만 */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollTabs('left')}
              className="hidden sm:flex absolute left-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 items-center justify-center rounded-full bg-white shadow-md border border-[#eee] opacity-0 group-hover/tabs:opacity-100 transition-opacity hover:bg-[#f5f5f5]"
            >
              <ChevronLeft className="w-4 h-4 text-[#666]" />
            </button>
          )}

          {/* 오른쪽 화살표 - 데스크톱만 */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scrollTabs('right')}
              className="hidden sm:flex absolute right-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 items-center justify-center rounded-full bg-white shadow-md border border-[#eee] opacity-0 group-hover/tabs:opacity-100 transition-opacity hover:bg-[#f5f5f5]"
            >
              <ChevronRight className="w-4 h-4 text-[#666]" />
            </button>
          )}

          <div
            ref={tabsRef}
            onScroll={checkScroll}
            onWheel={(e) => {
              if (tabsRef.current) {
                e.preventDefault();
                tabsRef.current.scrollLeft += e.deltaY;
              }
            }}
            className="flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {localGroups.map((group) => {
              const isActive = selectedGroupId === group.id;
              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => setSelectedGroupId(group.id)}
                  className={`h-9 px-4 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 flex-shrink-0 ${
                    isActive
                      ? 'bg-[hsl(var(--snug-orange))] text-white'
                      : 'bg-white border border-[#ddd] text-[hsl(var(--snug-text-primary))] hover:border-[hsl(var(--snug-orange))]'
                  }`}
                >
                  <span>{group.name}</span>
                  <span className={`text-xs ${isActive ? 'text-white/70' : 'text-[#999]'}`}>
                    {group.accommodationIds.length}
                  </span>
                </button>
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
                placeholder="그룹명 입력"
                className="h-9 px-3 min-w-[100px] bg-white border-2 border-[hsl(var(--snug-orange))] rounded-lg text-sm placeholder:text-[#bbb] focus:outline-none flex-shrink-0"
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingGroup(true)}
                className="h-9 px-3 flex-shrink-0 flex items-center gap-1 rounded-lg border border-dashed border-[#ccc] text-[#888] text-sm hover:border-[hsl(var(--snug-orange))] hover:text-[hsl(var(--snug-orange))] transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>추가</span>
              </button>
            )}
          </div>
        </div>

        {/* Selected Group Info & Actions */}
        {selectedGroup && (
          <div className="px-4 py-3 border-y border-[#eee] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            {editingGroupId === selectedGroup.id ? (
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
                className="flex-1 h-10 px-3 border-2 border-[hsl(var(--snug-orange))] rounded-lg text-sm font-medium focus:outline-none"
              />
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[hsl(var(--snug-text-primary))]">
                  {selectedGroup.name}
                </span>
                <span className="text-xs text-[#999] bg-[#f0f0f0] px-2 py-0.5 rounded-full">
                  {selectedGroup.accommodationIds.length}개 숙소
                </span>
              </div>
            )}

            {!isDefaultGroup && editingGroupId !== selectedGroup.id && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="h-9 px-4 flex items-center gap-1.5 text-sm text-[#666] bg-[#f5f5f5] hover:bg-[#eee] rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>수정</span>
                </button>
                <button
                  type="button"
                  onClick={handleDeleteGroup}
                  className="h-9 px-4 flex items-center gap-1.5 text-sm text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>삭제</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Accommodations List */}
        <div className="flex-1 overflow-y-auto">
          {selectedGroup ? (
            accommodations.length > 0 ? (
              <div className="py-1">
                {sortedAccommodations.map((acc, index) => {
                  const isSelected = selectedGroup.accommodationIds.includes(acc.id);
                  const otherGroup = getAccommodationGroup(acc.id);
                  const isInOther = otherGroup && otherGroup.id !== selectedGroupId;

                  const prevAcc = index > 0 ? sortedAccommodations[index - 1] : null;
                  const prevSelected =
                    prevAcc && selectedGroup.accommodationIds.includes(prevAcc.id);
                  const showDivider = !isSelected && prevSelected;

                  return (
                    <div key={acc.id}>
                      {showDivider && (
                        <div className="flex items-center gap-2 px-4 py-2">
                          <div className="flex-1 h-px bg-[#eee]" />
                          <span className="text-[10px] text-[#bbb]">미할당 숙소</span>
                          <div className="flex-1 h-px bg-[#eee]" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleToggleAccommodation(acc.id)}
                        className={`w-full flex items-center justify-between px-4 py-3.5 sm:py-3 transition-colors active:bg-[#f0f0f0] ${
                          isSelected ? 'bg-[hsl(var(--snug-orange))]/8' : 'hover:bg-[#f8f8f8]'
                        }`}
                      >
                        <div className="text-left">
                          <span
                            className={`text-sm ${isSelected ? 'font-medium text-[hsl(var(--snug-text-primary))]' : 'text-[#555]'}`}
                          >
                            {acc.name}
                          </span>
                          {isInOther && (
                            <span className="block text-[11px] text-[#aaa] mt-0.5">
                              현재: {otherGroup.name}
                            </span>
                          )}
                        </div>
                        <div
                          className={`w-6 h-6 sm:w-5 sm:h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'bg-[hsl(var(--snug-orange))]' : 'border border-[#ddd]'
                          }`}
                        >
                          {isSelected && (
                            <Check
                              className="w-3.5 h-3.5 sm:w-3 sm:h-3 text-white"
                              strokeWidth={3}
                            />
                          )}
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-sm text-[#aaa]">등록된 숙소가 없습니다</div>
            )
          ) : (
            <div className="py-12 text-center text-sm text-[#aaa]">그룹을 선택하세요</div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-[#eee]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 text-sm font-medium text-[#666] bg-[#f5f5f5] hover:bg-[#eee] rounded-lg transition-colors"
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
