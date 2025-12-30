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
    // 주차
    { id: 'free_parking_on_premises', label: tFacilities('freeParkingOnPremises') },
    { id: 'paid_parking_on_premises', label: tFacilities('paidParkingOnPremises') },
    { id: 'paid_parking_off_premises', label: tFacilities('paidParkingOffPremises') },
    { id: 'free_street_parking', label: tFacilities('freeStreetParking') },
    { id: 'permit_parking', label: tFacilities('permitParking') },
    { id: 'ev_charger', label: tFacilities('evCharger') },
    // 건물 시설
    { id: 'elevator', label: tFacilities('elevator') },
    { id: 'pool', label: tFacilities('pool') },
    { id: 'private_pool', label: tFacilities('privatePool') },
    { id: 'shared_pool', label: tFacilities('sharedPool') },
    { id: 'game_room', label: tFacilities('gameRoom') },
    { id: 'hot_tub', label: tFacilities('hotTub') },
    { id: 'private_hot_tub', label: tFacilities('privateHotTub') },
    { id: 'shared_hot_tub', label: tFacilities('sharedHotTub') },
    { id: 'gym', label: tFacilities('gym') },
    { id: 'sauna', label: tFacilities('sauna') },
    { id: 'steam_room', label: tFacilities('steamRoom') },
    { id: 'turkish_bath', label: tFacilities('turkishBath') },
    // 야외 공간
    { id: 'patio_or_balcony', label: tFacilities('patioOrBalcony') },
    { id: 'terrace', label: tFacilities('terrace') },
    { id: 'balcony', label: tFacilities('balcony') },
    { id: 'rooftop_terrace', label: tFacilities('rooftopTerrace') },
    { id: 'garden', label: tFacilities('garden') },
    { id: 'bbq_grill', label: tFacilities('bbqGrill') },
    { id: 'fire_pit', label: tFacilities('firePit') },
    { id: 'outdoor_dining_area', label: tFacilities('outdoorDiningArea') },
    { id: 'playground', label: tFacilities('playground') },
    { id: 'bicycle_storage', label: tFacilities('bicycleStorage') },
    // 스포츠/레저
    { id: 'tennis_court', label: tFacilities('tennisCourt') },
    { id: 'basketball_court', label: tFacilities('basketballCourt') },
    { id: 'volleyball_court', label: tFacilities('volleyballCourt') },
    { id: 'golf', label: tFacilities('golf') },
    // 자연환경
    { id: 'waterfront', label: tFacilities('waterfront') },
    { id: 'beachfront', label: tFacilities('beachfront') },
    { id: 'lake_access', label: tFacilities('lakeAccess') },
    { id: 'ski_in_out', label: tFacilities('skiInOut') },
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
    // 기본
    { id: 'wifi', label: tAmenities('wifi') },
    { id: 'streaming', label: tAmenities('streaming') },
    { id: 'tv', label: tAmenities('tv') },
    { id: 'air_conditioning', label: tAmenities('airConditioning') },
    { id: 'heating', label: tAmenities('heating') },
    { id: 'heated_floors', label: tAmenities('heatedFloors') },
    { id: 'cleaning_products', label: tAmenities('cleaningProducts') },
    { id: 'dedicated_workspace', label: tAmenities('dedicatedWorkspace') },
    // 욕실
    { id: 'bathtub', label: tAmenities('bathtub') },
    { id: 'bidet', label: tAmenities('bidet') },
    { id: 'handheld_shower_head', label: tAmenities('handheldShowerHead') },
    { id: 'hot_water', label: tAmenities('hotWater') },
    { id: 'shower_gel', label: tAmenities('showerGel') },
    { id: 'body_soap', label: tAmenities('bodySoap') },
    { id: 'hand_soap', label: tAmenities('handSoap') },
    { id: 'shampoo', label: tAmenities('shampoo') },
    { id: 'conditioner', label: tAmenities('conditioner') },
    { id: 'toilet_paper', label: tAmenities('toiletPaper') },
    { id: 'bath_towel', label: tAmenities('bathTowel') },
    // 세탁/의류
    { id: 'dryer', label: tAmenities('dryer') },
    { id: 'washer', label: tAmenities('washer') },
    { id: 'bed_linens', label: tAmenities('bedLinens') },
    { id: 'room_darkening_shades', label: tAmenities('roomDarkeningShades') },
    { id: 'clothing_storage', label: tAmenities('clothingStorage') },
    { id: 'hangers', label: tAmenities('hangers') },
    { id: 'drying_rack', label: tAmenities('dryingRack') },
    { id: 'iron', label: tAmenities('iron') },
    { id: 'hair_dryer', label: tAmenities('hairDryer') },
    // 주방/다이닝
    { id: 'refrigerator', label: tAmenities('refrigerator') },
    { id: 'dining_table', label: tAmenities('diningTable') },
    { id: 'wine_glasses', label: tAmenities('wineGlasses') },
    { id: 'microwave', label: tAmenities('microwave') },
    { id: 'oven', label: tAmenities('oven') },
    { id: 'stove', label: tAmenities('stove') },
    { id: 'dishwasher', label: tAmenities('dishwasher') },
    { id: 'coffee', label: tAmenities('coffee') },
    { id: 'tea', label: tAmenities('tea') },
    { id: 'cooking_basics', label: tAmenities('cookingBasics') },
    { id: 'dishes', label: tAmenities('dishes') },
    { id: 'silverware', label: tAmenities('silverware') },
    { id: 'rice_cooker', label: tAmenities('riceCooker') },
    { id: 'coffee_maker', label: tAmenities('coffeeMaker') },
    { id: 'toaster', label: tAmenities('toaster') },
    { id: 'hot_water_kettle', label: tAmenities('hotWaterKettle') },
    { id: 'blender', label: tAmenities('blender') },
    { id: 'baking_sheet', label: tAmenities('bakingSheet') },
    { id: 'bbq_utensils', label: tAmenities('bbqUtensils') },
    // 기타 편의시설
    { id: 'safe', label: tAmenities('safe') },
    { id: 'outdoor_furniture', label: tAmenities('outdoorFurniture') },
    { id: 'hammock', label: tAmenities('hammock') },
    { id: 'sun_loungers', label: tAmenities('sunLoungers') },
    { id: 'beach_essentials', label: tAmenities('beachEssentials') },
    // 안전
    { id: 'smoke_alarm', label: tAmenities('smokeAlarm') },
    { id: 'carbon_monoxide_alarm', label: tAmenities('carbonMonoxideAlarm') },
    { id: 'fire_extinguisher', label: tAmenities('fireExtinguisher') },
    { id: 'security_cameras', label: tAmenities('securityCameras') },
    // 아이/유아
    { id: 'crib', label: tAmenities('crib') },
    { id: 'high_chair', label: tAmenities('highChair') },
    { id: 'changing_table', label: tAmenities('changingTable') },
    { id: 'baby_bath', label: tAmenities('babyBath') },
    { id: 'baby_monitor', label: tAmenities('babyMonitor') },
    { id: 'baby_safety_gates', label: tAmenities('babySafetyGates') },
    { id: 'children_books_toys', label: tAmenities('childrenBooksToys') },
    { id: 'children_dinnerware', label: tAmenities('childrenDinnerware') },
    // 출입/보안
    { id: 'private_entrance', label: tAmenities('privateEntrance') },
    { id: 'bedroom_lock', label: tAmenities('bedroomLock') },
    { id: 'luggage_dropoff', label: tAmenities('luggageDropoff') },
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
