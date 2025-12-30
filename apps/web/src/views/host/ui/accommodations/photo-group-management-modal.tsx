'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { DEFAULT_PHOTO_GROUPS } from './types';

const DEFAULT_GROUP_IDS: string[] = DEFAULT_PHOTO_GROUPS.map((g) => g.id);

export interface PhotoGroupItem {
  id: string;
  name: string;
  photoCount?: number;
}

interface PhotoGroupManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: PhotoGroupItem[];
  onSave: (groups: PhotoGroupItem[]) => void;
}

export function PhotoGroupManagementModal({
  isOpen,
  onClose,
  groups,
  onSave,
}: PhotoGroupManagementModalProps) {
  const [localGroups, setLocalGroups] = useState<PhotoGroupItem[]>(() => [...groups]);
  const [newGroupName, setNewGroupName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const editRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && editRef.current) {
      editRef.current.focus();
      editRef.current.select();
    }
  }, [editingId]);

  if (!isOpen) return null;

  const handleAddGroup = () => {
    if (!newGroupName.trim()) return;
    const newGroup: PhotoGroupItem = {
      id: `photo_group_${Date.now()}`,
      name: newGroupName.trim(),
      photoCount: 0,
    };
    setLocalGroups([...localGroups, newGroup]);
    setNewGroupName('');
    inputRef.current?.focus();
  };

  const handleDeleteGroup = (id: string) => {
    if (DEFAULT_GROUP_IDS.includes(id)) return;
    setLocalGroups(localGroups.filter((g) => g.id !== id));
  };

  const handleStartEdit = (group: PhotoGroupItem) => {
    if (DEFAULT_GROUP_IDS.includes(group.id)) return;
    setEditingId(group.id);
    setEditingName(group.name);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editingName.trim()) {
      setEditingId(null);
      return;
    }
    setLocalGroups(
      localGroups.map((g) => (g.id === editingId ? { ...g, name: editingName.trim() } : g)),
    );
    setEditingId(null);
    setEditingName('');
  };

  const handleSave = () => {
    onSave(localGroups);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full sm:w-[360px] mx-4 sm:mx-0 max-h-[80vh] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#f0f0f0]">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[hsl(var(--snug-text-primary))]">
              사진 그룹 관리
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 -mr-1.5 hover:bg-[#f5f5f5] rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-[#999]" />
            </button>
          </div>
          <p className="text-xs text-[#999] mt-1">사진을 분류할 그룹을 관리하세요</p>
        </div>

        {/* Add New Group */}
        <div className="px-5 py-4 bg-[#fafafa] border-b border-[#f0f0f0]">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddGroup();
              }}
              placeholder="새 그룹명 입력"
              className="flex-1 h-10 px-4 bg-white border border-[#e0e0e0] rounded-lg text-sm placeholder:text-[#bbb] focus:outline-none focus:border-[hsl(var(--snug-orange))]"
            />
            <button
              type="button"
              onClick={handleAddGroup}
              disabled={!newGroupName.trim()}
              className="h-10 px-4 flex items-center gap-1.5 bg-[hsl(var(--snug-orange))] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 whitespace-nowrap"
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              <span>추가</span>
            </button>
          </div>
        </div>

        {/* Group List */}
        <div className="flex-1 overflow-y-auto">
          <div className="py-2">
            {localGroups.map((group) => {
              const isDefault = DEFAULT_GROUP_IDS.includes(group.id);
              const isEditing = editingId === group.id;

              return (
                <div
                  key={group.id}
                  className="flex items-center gap-3 px-5 py-3.5 sm:py-3 hover:bg-[#fafafa] active:bg-[#f5f5f5] transition-colors group"
                >
                  {/* Group Name */}
                  {isEditing ? (
                    <input
                      ref={editRef}
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit();
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      onBlur={handleSaveEdit}
                      className="flex-1 h-10 sm:h-8 px-3 border-2 border-[hsl(var(--snug-orange))] rounded-lg text-sm focus:outline-none"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleStartEdit(group)}
                      disabled={isDefault}
                      className={`flex-1 text-left text-sm ${
                        isDefault
                          ? 'text-[hsl(var(--snug-text-primary))]'
                          : 'text-[hsl(var(--snug-text-primary))] hover:text-[hsl(var(--snug-orange))] cursor-pointer'
                      }`}
                    >
                      {group.name}
                      {isDefault && (
                        <span className="ml-2 text-[10px] text-[#aaa] bg-[#f0f0f0] px-1.5 py-0.5 rounded">
                          기본
                        </span>
                      )}
                    </button>
                  )}

                  {/* Photo Count */}
                  {group.photoCount !== undefined && group.photoCount > 0 && (
                    <span className="text-xs text-[#999] flex-shrink-0">{group.photoCount}장</span>
                  )}

                  {/* Delete Button - 모바일: 항상 표시, 데스크톱: hover 시 표시 */}
                  {!isDefault && !isEditing && (
                    <button
                      type="button"
                      onClick={() => handleDeleteGroup(group.id)}
                      className="p-2 sm:p-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
                    >
                      <Trash2 className="w-5 h-5 sm:w-4 sm:h-4 text-red-400" />
                    </button>
                  )}
                </div>
              );
            })}

            {localGroups.length === 0 && (
              <div className="py-10 text-center text-sm text-[#aaa]">등록된 그룹이 없습니다</div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-[#f0f0f0]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 text-sm font-medium text-[#666] bg-[#f5f5f5] hover:bg-[#eee] rounded-xl transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 h-11 text-sm font-medium text-white bg-[hsl(var(--snug-orange))] hover:opacity-90 rounded-xl transition-opacity"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
