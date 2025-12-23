'use client';

import { useState } from 'react';
import { X, Check } from 'lucide-react';

interface SelectionOption {
  id: string;
  label: string;
}

interface SelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selected: string[]) => void;
  title: string;
  subtitle: string;
  options: SelectionOption[];
  initialSelected: string[];
  sectionTitle?: string;
}

export function SelectionModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  subtitle,
  options,
  initialSelected,
  sectionTitle,
}: SelectionModalProps) {
  // Use initialSelected as initial state - parent should use key prop to reset if needed
  const [selected, setSelected] = useState<string[]>(initialSelected);

  if (!isOpen) return null;

  const toggleOption = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleConfirm = () => {
    onConfirm(selected);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[hsl(var(--snug-border))]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[hsl(var(--snug-text-primary))]">{title}</h2>
              <p className="text-sm text-[hsl(var(--snug-gray))] mt-1">{subtitle}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-[hsl(var(--snug-light-gray))] rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-[hsl(var(--snug-gray))]" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {sectionTitle && (
            <p className="text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-4">
              {sectionTitle}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            {options.map((option) => {
              const isSelected = selected.includes(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => toggleOption(option.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors text-left ${
                    isSelected
                      ? 'border-[hsl(var(--snug-orange))] bg-orange-50'
                      : 'border-[hsl(var(--snug-border))] hover:bg-[hsl(var(--snug-light-gray))]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? 'bg-[hsl(var(--snug-orange))]'
                        : 'border border-[hsl(var(--snug-border))]'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span
                    className={`text-sm ${
                      isSelected
                        ? 'text-[hsl(var(--snug-orange))] font-medium'
                        : 'text-[hsl(var(--snug-text-primary))]'
                    }`}
                  >
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[hsl(var(--snug-border))] flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-sm font-medium text-[hsl(var(--snug-text-primary))] border border-[hsl(var(--snug-border))] rounded-lg hover:bg-[hsl(var(--snug-light-gray))] transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-6 py-3 text-sm font-bold text-white bg-[hsl(var(--snug-orange))] rounded-lg hover:opacity-90 transition-opacity"
          >
            완료
          </button>
        </div>
      </div>
    </div>
  );
}

// Facility Modal
interface FacilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selected: string[]) => void;
  initialSelected: string[];
}

export function FacilityModal({ isOpen, onClose, onConfirm, initialSelected }: FacilityModalProps) {
  const FACILITY_OPTIONS = [
    { id: 'digital_lock', label: '디지털 도어락' },
    { id: 'refrigerator', label: '냉장고' },
    { id: 'air_conditioner', label: '컨디셔너' },
    { id: 'coffee_maker', label: '커피 메이커' },
    { id: 'washer', label: '세탁기' },
    { id: 'closet', label: '옷걸이' },
    { id: 'tv', label: 'TV' },
    { id: 'wifi', label: '와이파이' },
    { id: 'cctv', label: 'CCTV' },
  ];

  return (
    <SelectionModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="시설 추가"
      subtitle="추가하실 시설을 선택해주세요."
      options={FACILITY_OPTIONS}
      initialSelected={initialSelected}
      sectionTitle="시설"
    />
  );
}

// Amenity Modal
interface AmenityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selected: string[]) => void;
  initialSelected: string[];
}

export function AmenityModal({ isOpen, onClose, onConfirm, initialSelected }: AmenityModalProps) {
  const AMENITY_OPTIONS = [
    { id: 'hair_dryer', label: '헤어 드라이어' },
    { id: 'shampoo', label: '샴푸' },
    { id: 'conditioner', label: '컨디셔너' },
    { id: 'body_wash', label: '바디워셔' },
    { id: 'soap', label: '비누' },
    { id: 'towel', label: '수건' },
    { id: 'toothbrush', label: '칫솔' },
    { id: 'toothpaste', label: '치약' },
  ];

  return (
    <SelectionModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="어메니티 추가"
      subtitle="추가하실 어메니티를 선택해주세요."
      options={AMENITY_OPTIONS}
      initialSelected={initialSelected}
      sectionTitle="어메니티"
    />
  );
}

// Manager Modal
interface ManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (manager: { name: string; phone: string; additionalInfo?: string }) => void;
}

export function ManagerModal({ isOpen, onClose, onConfirm }: ManagerModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (name.trim()) {
      onConfirm({
        name: name.trim(),
        phone: phone.trim(),
        additionalInfo: additionalInfo.trim() || undefined,
      });
      setName('');
      setPhone('');
      setAdditionalInfo('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[hsl(var(--snug-border))]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[hsl(var(--snug-text-primary))]">
                관리자 추가
              </h2>
              <p className="text-sm text-[hsl(var(--snug-gray))] mt-1">
                관리자 정보를 입력해주세요.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-[hsl(var(--snug-light-gray))] rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-[hsl(var(--snug-gray))]" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm text-[hsl(var(--snug-gray))] mb-1">관리자</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="관리자명"
              className="w-full px-4 py-3 border border-[hsl(var(--snug-border))] rounded-lg text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
            />
          </div>

          <div>
            <label className="block text-sm text-[hsl(var(--snug-gray))] mb-1">연락처</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010 - 0000 - 0000"
              className="w-full px-4 py-3 border border-[hsl(var(--snug-border))] rounded-lg text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
            />
          </div>

          <div>
            <label className="block text-sm text-[hsl(var(--snug-gray))] mb-1">추가 정보</label>
            <textarea
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="추가 정보가 있는 경우 입력해주세요."
              rows={3}
              className="w-full px-4 py-3 border border-[hsl(var(--snug-border))] rounded-lg text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))] resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[hsl(var(--snug-border))] flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-sm font-medium text-[hsl(var(--snug-text-primary))] border border-[hsl(var(--snug-border))] rounded-lg hover:bg-[hsl(var(--snug-light-gray))] transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!name.trim()}
            className="px-6 py-3 text-sm font-bold text-white bg-[hsl(var(--snug-orange))] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            완료
          </button>
        </div>
      </div>
    </div>
  );
}
