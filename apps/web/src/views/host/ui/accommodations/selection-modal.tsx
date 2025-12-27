'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
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
  const tCommon = useTranslations('common');
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
            {tCommon('cancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-6 py-3 text-sm font-bold text-white bg-[hsl(var(--snug-orange))] rounded-lg hover:opacity-90 transition-opacity"
          >
            {tCommon('done')}
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
  const t = useTranslations('host.accommodation.modal');
  const tFacilities = useTranslations('host.facilities');

  const FACILITY_OPTIONS = [
    { id: 'digital_lock', label: tFacilities('digitalLock') },
    { id: 'refrigerator', label: tFacilities('refrigerator') },
    { id: 'air_conditioner', label: tFacilities('airConditioner') },
    { id: 'coffee_maker', label: tFacilities('coffeeMaker') },
    { id: 'washer', label: tFacilities('washingMachine') },
    { id: 'closet', label: tFacilities('clothRack') },
    { id: 'tv', label: 'TV' },
    { id: 'wifi', label: tFacilities('wifi') },
    { id: 'cctv', label: 'CCTV' },
  ];

  return (
    <SelectionModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t('addFacilities')}
      subtitle={t('selectFacilitiesToAdd')}
      options={FACILITY_OPTIONS}
      initialSelected={initialSelected}
      sectionTitle={t('facilities')}
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
  const t = useTranslations('host.accommodation.modal');
  const tAmenities = useTranslations('host.amenities');

  const AMENITY_OPTIONS = [
    { id: 'hair_dryer', label: tAmenities('hairDryer') },
    { id: 'shampoo', label: tAmenities('shampoo') },
    { id: 'conditioner', label: tAmenities('conditioner') },
    { id: 'body_wash', label: tAmenities('bodyWash') },
    { id: 'soap', label: tAmenities('soap') },
    { id: 'towel', label: tAmenities('towel') },
    { id: 'toothbrush', label: tAmenities('toothbrush') },
    { id: 'toothpaste', label: tAmenities('toothpaste') },
  ];

  return (
    <SelectionModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t('addAmenities')}
      subtitle={t('selectAmenitiesToAdd')}
      options={AMENITY_OPTIONS}
      initialSelected={initialSelected}
      sectionTitle={t('amenities')}
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
  const t = useTranslations('host.accommodation.modal');
  const tCommon = useTranslations('common');
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
                {t('addManager')}
              </h2>
              <p className="text-sm text-[hsl(var(--snug-gray))] mt-1">{t('enterManagerInfo')}</p>
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
            <label className="block text-sm text-[hsl(var(--snug-gray))] mb-1">
              {t('manager')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('managerNamePlaceholder')}
              className="w-full px-4 py-3 border border-[hsl(var(--snug-border))] rounded-lg text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
            />
          </div>

          <div>
            <label className="block text-sm text-[hsl(var(--snug-gray))] mb-1">
              {t('contact')}
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t('contactPlaceholder')}
              className="w-full px-4 py-3 border border-[hsl(var(--snug-border))] rounded-lg text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
            />
          </div>

          <div>
            <label className="block text-sm text-[hsl(var(--snug-gray))] mb-1">
              {t('additionalInfo')}
            </label>
            <textarea
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder={t('additionalInfoPlaceholder')}
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
            {tCommon('cancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!name.trim()}
            className="px-6 py-3 text-sm font-bold text-white bg-[hsl(var(--snug-orange))] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {tCommon('done')}
          </button>
        </div>
      </div>
    </div>
  );
}
