'use client';

import { useState } from 'react';
import { X, RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
}

export interface FilterState {
  roomTypes: string[];
  propertyTypes: string[];
  budgetMin: number;
  budgetMax: number;
  apartmentSize: string | null;
  houseRules: string[];
  facilities: string[];
  amenities: string[];
}

const APARTMENT_SIZES = ['≥58㎡', '≥82㎡', '≥92㎡'];

const DEFAULT_FILTERS: FilterState = {
  roomTypes: [],
  propertyTypes: [],
  budgetMin: 210,
  budgetMax: 920,
  apartmentSize: null,
  houseRules: [],
  facilities: [],
  amenities: [],
};

export function FilterModal({ isOpen, onClose, onApply }: FilterModalProps) {
  const t = useTranslations('search.filters');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  // Translated filter options
  const ROOM_TYPES = [
    { key: 'house', label: t('roomTypes.house') },
    { key: 'sharedHouse', label: t('roomTypes.sharedHouse') },
    { key: 'sharedRoom', label: t('roomTypes.sharedRoom') },
  ];
  const PROPERTY_TYPES = [
    { key: 'apartment', label: t('propertyTypes.apartment') },
    { key: 'villa', label: t('propertyTypes.villa') },
    { key: 'house', label: t('propertyTypes.house') },
    { key: 'officetel', label: t('propertyTypes.officetel') },
  ];
  const HOUSE_RULES = [
    { key: 'womenOnly', label: t('womenOnly') },
    { key: 'menOnly', label: t('menOnly') },
    { key: 'petsAllowed', label: t('petsAllowed') },
  ];
  const FACILITIES = [
    { key: 'all', label: t('facilitiesOptions.all') },
    { key: 'parkingLot', label: t('facilitiesOptions.parkingLot') },
    { key: 'lift', label: t('facilitiesOptions.lift') },
    { key: 'wifi', label: t('facilitiesOptions.wifi') },
    { key: 'publicGate', label: t('facilitiesOptions.publicGate') },
    { key: 'fullyFurnished', label: t('facilitiesOptions.fullyFurnished') },
    { key: 'privateBathroom', label: t('facilitiesOptions.privateBathroom') },
    { key: 'washingMachine', label: t('facilitiesOptions.washingMachine') },
    { key: 'balcony', label: t('facilitiesOptions.balcony') },
  ];
  const AMENITIES = [
    { key: 'all', label: t('amenitiesOptions.all') },
    { key: 'queenBed', label: t('amenitiesOptions.queenBed') },
    { key: 'airConditioning', label: t('amenitiesOptions.airConditioning') },
    { key: 'dryer', label: t('amenitiesOptions.dryer') },
  ];

  const toggleArrayItem = (array: string[], item: string): string[] => {
    return array.includes(item) ? array.filter((i) => i !== item) : [...array, item];
  };

  const handleRoomTypeToggle = (type: string) => {
    setFilters((prev) => ({
      ...prev,
      roomTypes: toggleArrayItem(prev.roomTypes, type),
    }));
  };

  const handlePropertyTypeToggle = (type: string) => {
    setFilters((prev) => ({
      ...prev,
      propertyTypes: toggleArrayItem(prev.propertyTypes, type),
    }));
  };

  const handleHouseRuleToggle = (rule: string) => {
    setFilters((prev) => ({
      ...prev,
      houseRules: toggleArrayItem(prev.houseRules, rule),
    }));
  };

  const handleFacilityToggle = (facility: string) => {
    setFilters((prev) => ({
      ...prev,
      facilities: toggleArrayItem(prev.facilities, facility),
    }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFilters((prev) => ({
      ...prev,
      amenities: toggleArrayItem(prev.amenities, amenity),
    }));
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  if (!isOpen) return null;

  const filterContent = (
    <div className="space-y-8">
      {/* Room Type */}
      <div>
        <h3 className="text-sm font-bold text-[hsl(var(--snug-text-primary))] mb-3">
          {t('roomType')}
        </h3>
        <div className="flex flex-wrap gap-2">
          {ROOM_TYPES.map((type) => (
            <button
              key={type.key}
              type="button"
              onClick={() => handleRoomTypeToggle(type.key)}
              className={`px-4 py-2 text-sm border rounded-full transition-colors ${
                filters.roomTypes.includes(type.key)
                  ? 'border-[hsl(var(--snug-orange))] text-[hsl(var(--snug-orange))]'
                  : 'border-[hsl(var(--snug-border))] text-[hsl(var(--snug-text-primary))]'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Property Type */}
      <div>
        <h3 className="text-sm font-bold text-[hsl(var(--snug-text-primary))] mb-3">
          {t('propertyType')}
        </h3>
        <div className="flex flex-wrap gap-2">
          {PROPERTY_TYPES.map((type) => (
            <button
              key={type.key}
              type="button"
              onClick={() => handlePropertyTypeToggle(type.key)}
              className={`px-4 py-2 text-sm border rounded-full transition-colors ${
                filters.propertyTypes.includes(type.key)
                  ? 'border-[hsl(var(--snug-orange))] text-[hsl(var(--snug-orange))]'
                  : 'border-[hsl(var(--snug-border))] text-[hsl(var(--snug-text-primary))]'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div>
        <h3 className="text-sm font-bold text-[hsl(var(--snug-text-primary))]">
          {t('budget')}{' '}
          <span className="font-normal text-[hsl(var(--snug-gray))]">· {t('monthlyPayment')}</span>
        </h3>

        {/* Range Slider */}
        <div className="relative h-1 bg-[hsl(var(--snug-border))] rounded-full mt-6 mb-6">
          <div
            className="absolute h-full bg-[hsl(var(--snug-orange))] rounded-full"
            style={{
              left: `${(filters.budgetMin / 1000) * 100}%`,
              right: `${100 - (filters.budgetMax / 1000) * 100}%`,
            }}
          />
          <input
            type="range"
            min="0"
            max="1000"
            value={filters.budgetMin}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                budgetMin: Math.min(Number(e.target.value), prev.budgetMax - 50),
              }))
            }
            className="absolute w-full h-1 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[hsl(var(--snug-orange))] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:pointer-events-auto"
          />
          <input
            type="range"
            min="0"
            max="1000"
            value={filters.budgetMax}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                budgetMax: Math.max(Number(e.target.value), prev.budgetMin + 50),
              }))
            }
            className="absolute w-full h-1 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[hsl(var(--snug-orange))] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:pointer-events-auto"
          />
        </div>

        {/* Min/Max Inputs */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-xs text-[hsl(var(--snug-gray))] mb-1 block">
              {t('minimum')}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[hsl(var(--snug-text-primary))]">
                $
              </span>
              <input
                type="number"
                value={filters.budgetMin}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, budgetMin: Number(e.target.value) }))
                }
                className="w-full pl-7 pr-3 py-2.5 text-sm border border-[hsl(var(--snug-border))] rounded-lg focus:outline-none focus:border-[hsl(var(--snug-orange))]"
              />
            </div>
          </div>
          <span className="text-[hsl(var(--snug-gray))] mt-5">–</span>
          <div className="flex-1">
            <label className="text-xs text-[hsl(var(--snug-gray))] mb-1 block">
              {t('maximum')}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[hsl(var(--snug-text-primary))]">
                $
              </span>
              <input
                type="number"
                value={filters.budgetMax}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, budgetMax: Number(e.target.value) }))
                }
                className="w-full pl-7 pr-3 py-2.5 text-sm border border-[hsl(var(--snug-border))] rounded-lg focus:outline-none focus:border-[hsl(var(--snug-orange))]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Apartment Size */}
      <div>
        <h3 className="text-sm font-bold text-[hsl(var(--snug-text-primary))] mb-3">
          {t('apartmentSize')}
        </h3>
        <div className="flex items-center gap-6">
          {APARTMENT_SIZES.map((size) => (
            <label key={size} className="flex items-center gap-2 cursor-pointer">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  filters.apartmentSize === size
                    ? 'border-[hsl(var(--snug-text-primary))]'
                    : 'border-[hsl(var(--snug-border))]'
                }`}
                onClick={() => setFilters((prev) => ({ ...prev, apartmentSize: size }))}
              >
                {filters.apartmentSize === size && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--snug-text-primary))]" />
                )}
              </div>
              <span className="text-sm text-[hsl(var(--snug-text-primary))]">{size}</span>
            </label>
          ))}
        </div>
      </div>

      {/* House Rules */}
      <div>
        <h3 className="text-sm font-bold text-[hsl(var(--snug-text-primary))] mb-3">
          {t('houseRules')}
        </h3>
        <div className="space-y-3">
          {HOUSE_RULES.map((rule) => (
            <label key={rule.key} className="flex items-center gap-3 cursor-pointer">
              <div
                className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                  filters.houseRules.includes(rule.key)
                    ? 'bg-[hsl(var(--snug-orange))]'
                    : 'border-2 border-[hsl(var(--snug-border))]'
                }`}
                onClick={() => handleHouseRuleToggle(rule.key)}
              >
                {filters.houseRules.includes(rule.key) && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <span className="text-sm text-[hsl(var(--snug-text-primary))]">{rule.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Facilities */}
      <div>
        <h3 className="text-sm font-bold text-[hsl(var(--snug-text-primary))] mb-3">
          {t('facilities')}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {FACILITIES.map((facility) => (
            <label key={facility.key} className="flex items-center gap-3 cursor-pointer">
              <div
                className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                  filters.facilities.includes(facility.key)
                    ? 'bg-[hsl(var(--snug-orange))]'
                    : 'border-2 border-[hsl(var(--snug-border))]'
                }`}
                onClick={() => handleFacilityToggle(facility.key)}
              >
                {filters.facilities.includes(facility.key) && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <span className="text-sm text-[hsl(var(--snug-text-primary))]">{facility.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* House amenities */}
      <div>
        <h3 className="text-sm font-bold text-[hsl(var(--snug-text-primary))] mb-3">
          {t('amenities')}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {AMENITIES.map((amenity) => (
            <label key={amenity.key} className="flex items-center gap-3 cursor-pointer">
              <div
                className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                  filters.amenities.includes(amenity.key)
                    ? 'bg-[hsl(var(--snug-orange))]'
                    : 'border-2 border-[hsl(var(--snug-border))]'
                }`}
                onClick={() => handleAmenityToggle(amenity.key)}
              >
                {filters.amenities.includes(amenity.key) && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <span className="text-sm text-[hsl(var(--snug-text-primary))]">{amenity.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const footerContent = (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={handleReset}
        className="flex items-center gap-2 text-sm text-[hsl(var(--snug-text-primary))] hover:opacity-70 transition-opacity"
      >
        <RotateCcw className="w-4 h-4" />
        {t('reset')}
      </button>
      <button
        type="button"
        onClick={handleApply}
        className="flex-1 py-3 bg-[hsl(var(--snug-orange))] text-white text-sm font-semibold rounded-full hover:opacity-90 transition-opacity"
      >
        {t('showResults')}
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile: Full Screen */}
      <div className="lg:hidden fixed inset-0 z-[100] bg-white flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--snug-border))]">
          <h2 className="text-lg font-bold text-[hsl(var(--snug-text-primary))]">{t('filters')}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-[hsl(var(--snug-light-gray))] rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-[hsl(var(--snug-text-primary))]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 px-5 py-6 overflow-y-auto no-scrollbar">{filterContent}</div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[hsl(var(--snug-border))]">{footerContent}</div>
      </div>

      {/* Desktop: Center Modal */}
      <div className="hidden lg:block fixed inset-0 z-[100]">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/30" onClick={onClose} />

        {/* Modal */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-xl flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--snug-border))]">
            <h2 className="text-lg font-bold text-[hsl(var(--snug-text-primary))]">
              {t('filters')}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1 hover:bg-[hsl(var(--snug-light-gray))] rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-[hsl(var(--snug-text-primary))]" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 px-5 py-6 overflow-y-auto no-scrollbar">{filterContent}</div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-[hsl(var(--snug-border))]">{footerContent}</div>
        </div>
      </div>
    </>
  );
}
