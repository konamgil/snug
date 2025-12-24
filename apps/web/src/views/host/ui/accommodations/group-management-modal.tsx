'use client';

import { useState } from 'react';
import { X, ChevronDown, ChevronUp, Check } from 'lucide-react';

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
  const [newGroupName, setNewGroupName] = useState('');
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddGroup = () => {
    if (!newGroupName.trim()) return;

    const newGroup: GroupItem = {
      id: `group_${Date.now()}`,
      name: newGroupName.trim(),
      isSelected: false,
      accommodationIds: [],
    };

    setLocalGroups([...localGroups, newGroup]);
    setNewGroupName('');
  };

  const handleToggleGroup = (groupId: string) => {
    setLocalGroups(
      localGroups.map((group) =>
        group.id === groupId ? { ...group, isSelected: !group.isSelected } : group,
      ),
    );
  };

  const handleToggleExpand = (groupId: string) => {
    setExpandedGroupId((prev) => (prev === groupId ? null : groupId));
  };

  const handleToggleAccommodation = (groupId: string, accommodationId: string) => {
    setLocalGroups((groups) =>
      groups.map((g) => {
        if (g.id !== groupId) return g;
        const ids = g.accommodationIds.includes(accommodationId)
          ? g.accommodationIds.filter((id) => id !== accommodationId)
          : [...g.accommodationIds, accommodationId];
        return { ...g, accommodationIds: ids };
      }),
    );
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
      <div className="relative w-[370px] max-h-[90vh] bg-white shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative px-5 pt-5 pb-4 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-6 right-4 p-2 hover:bg-[hsl(var(--snug-light-gray))] rounded transition-colors"
          >
            <X className="w-4 h-4 text-[hsl(var(--snug-text-primary))]" />
          </button>

          <h3 className="text-lg font-bold text-[hsl(var(--snug-text-primary))]">그룹관리</h3>
          <p className="text-xs text-[hsl(var(--snug-gray))] mt-3 leading-relaxed">
            숙소를 그룹으로 묶어 한 번에 관리할 수 있습니다.
            <br />
            여러 숙소를 효율적으로 운영해 보세요.
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-5">
          {/* Add Group Input */}
          <div className="flex items-center gap-2 mb-4">
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="그룹명을 입력해주세요"
              className="flex-1 h-8 px-4 bg-[#f4f4f4] border-b border-[#8d8d8d] text-sm text-[hsl(var(--snug-text-primary))] placeholder:text-[#a8a8a8] focus:outline-none focus:border-[hsl(var(--snug-orange))]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddGroup();
              }}
            />
            <button
              type="button"
              onClick={handleAddGroup}
              className="h-8 px-3 text-sm font-medium text-[hsl(var(--snug-text-primary))] hover:bg-[hsl(var(--snug-light-gray))] transition-colors"
            >
              추가
            </button>
          </div>

          {/* Group List */}
          <div className="space-y-0">
            {localGroups.map((group) => (
              <div key={group.id}>
                {/* Group Header */}
                <div className="flex items-center justify-between py-3 border-b border-[#e0e0e0]">
                  <div className="flex items-center gap-3">
                    {/* Custom Checkbox */}
                    <button
                      type="button"
                      onClick={() => handleToggleGroup(group.id)}
                      className={`w-5 h-5 flex items-center justify-center rounded-sm transition-colors ${
                        group.isSelected
                          ? 'bg-[hsl(var(--snug-orange))]'
                          : 'border border-[hsl(var(--snug-text-primary))]'
                      }`}
                    >
                      {group.isSelected && (
                        <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                      )}
                    </button>

                    <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                      {group.name}
                    </span>
                    <span className="text-xs text-[hsl(var(--snug-gray))]">
                      ({group.accommodationIds.length})
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleExpand(group.id)}
                    className="p-1 hover:bg-[hsl(var(--snug-light-gray))] rounded transition-colors"
                  >
                    {expandedGroupId === group.id ? (
                      <ChevronUp className="w-4 h-4 text-[hsl(var(--snug-text-primary))]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[hsl(var(--snug-text-primary))]" />
                    )}
                  </button>
                </div>

                {/* Accordion Content - Accommodations List */}
                {expandedGroupId === group.id && (
                  <div className="pl-8 py-3 space-y-2 bg-[hsl(var(--snug-light-gray))]/50">
                    {accommodations.length > 0 ? (
                      accommodations.map((acc) => (
                        <label key={acc.id} className="flex items-center gap-2 cursor-pointer">
                          <button
                            type="button"
                            onClick={() => handleToggleAccommodation(group.id, acc.id)}
                            className={`w-4 h-4 flex items-center justify-center rounded-sm transition-colors ${
                              group.accommodationIds.includes(acc.id)
                                ? 'bg-[hsl(var(--snug-orange))]'
                                : 'border border-[hsl(var(--snug-gray))]'
                            }`}
                          >
                            {group.accommodationIds.includes(acc.id) && (
                              <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            )}
                          </button>
                          <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                            {acc.name}
                          </span>
                        </label>
                      ))
                    ) : (
                      <p className="text-xs text-[hsl(var(--snug-gray))]">
                        등록된 숙소가 없습니다.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {localGroups.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-sm text-[hsl(var(--snug-gray))]">등록된 그룹이 없습니다.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-5 h-20 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="w-[126px] h-10 text-sm font-medium text-[hsl(var(--snug-text-primary))] bg-[#f4f4f4] hover:bg-[#e8e8e8] transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 h-10 text-sm font-medium text-white bg-[hsl(var(--snug-orange))] hover:opacity-90 transition-opacity"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
