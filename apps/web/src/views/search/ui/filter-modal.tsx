'use client';

import { useState } from 'react';
import { X, RotateCcw } from 'lucide-react';

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
}

const ROOM_TYPES = ['House', 'Shared House', 'Shared Room'];
const PROPERTY_TYPES = [
  'Apartment',
  'Small Apartment',
  'Attached House',
  'Hotel',
  'Motel',
  'Dormitory',
];
const APARTMENT_SIZES = ['≥58㎡', '≥82㎡', '≥92㎡'];
const HOUSE_RULES = ['Pets allowed', 'Smoking allowed', 'Events allowed'];

const DEFAULT_FILTERS: FilterState = {
  roomTypes: [],
  propertyTypes: [],
  budgetMin: 0,
  budgetMax: 1000,
  apartmentSize: null,
  houseRules: [],
};

export function FilterModal({ isOpen, onClose, onApply }: FilterModalProps) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

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

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl w-full max-w-[400px] max-h-[85vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--snug-border))]">
          <h2 className="text-base font-semibold text-[hsl(var(--snug-text-primary))]">Filters</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-[hsl(var(--snug-light-gray))] rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-[hsl(var(--snug-gray))]" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-4 overflow-y-auto max-h-[calc(85vh-130px)] space-y-6 scrollbar-minimal">
          {/* Room Type */}
          <div>
            <h3 className="text-sm font-semibold text-[hsl(var(--snug-text-primary))] mb-3">
              Room Type
            </h3>
            <div className="flex flex-wrap gap-2">
              {ROOM_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleRoomTypeToggle(type)}
                  className={`px-4 py-2 text-sm border rounded-full transition-colors ${
                    filters.roomTypes.includes(type)
                      ? 'border-[hsl(var(--snug-text-primary))] bg-[hsl(var(--snug-text-primary))] text-white'
                      : 'border-[hsl(var(--snug-border))] text-[hsl(var(--snug-text-primary))] hover:border-[hsl(var(--snug-gray))]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Property Type */}
          <div>
            <h3 className="text-sm font-semibold text-[hsl(var(--snug-text-primary))] mb-3">
              Property Type
            </h3>
            <div className="flex flex-wrap gap-2">
              {PROPERTY_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handlePropertyTypeToggle(type)}
                  className={`px-4 py-2 text-sm border rounded-full transition-colors ${
                    filters.propertyTypes.includes(type)
                      ? 'border-[hsl(var(--snug-text-primary))] bg-[hsl(var(--snug-text-primary))] text-white'
                      : 'border-[hsl(var(--snug-border))] text-[hsl(var(--snug-text-primary))] hover:border-[hsl(var(--snug-gray))]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div>
            <h3 className="text-sm font-semibold text-[hsl(var(--snug-text-primary))] mb-1">
              Budget
            </h3>
            <p className="text-xs text-[hsl(var(--snug-gray))] mb-3">Monthly payment</p>

            {/* Range Slider */}
            <div className="relative h-1 bg-[hsl(var(--snug-border))] rounded-full mb-4">
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
                className="absolute w-full h-1 appearance-none bg-transparent pointer-events-auto cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[hsl(var(--snug-orange))] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
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
                className="absolute w-full h-1 appearance-none bg-transparent pointer-events-auto cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[hsl(var(--snug-orange))] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
              />
            </div>

            {/* Min/Max Inputs */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-[10px] text-[hsl(var(--snug-gray))] mb-1 block">
                  Minimum
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[hsl(var(--snug-gray))]">
                    $
                  </span>
                  <input
                    type="number"
                    value={filters.budgetMin}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, budgetMin: Number(e.target.value) }))
                    }
                    className="w-full pl-7 pr-3 py-2 text-sm border border-[hsl(var(--snug-border))] rounded-lg focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                  />
                </div>
              </div>
              <span className="text-[hsl(var(--snug-gray))] mt-4">–</span>
              <div className="flex-1">
                <label className="text-[10px] text-[hsl(var(--snug-gray))] mb-1 block">
                  Maximum
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[hsl(var(--snug-gray))]">
                    $
                  </span>
                  <input
                    type="text"
                    value={filters.budgetMax >= 1000 ? '1,000+' : filters.budgetMax}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setFilters((prev) => ({ ...prev, budgetMax: Number(value) || 1000 }));
                    }}
                    className="w-full pl-7 pr-3 py-2 text-sm border border-[hsl(var(--snug-border))] rounded-lg focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Apartment Size */}
          <div>
            <h3 className="text-sm font-semibold text-[hsl(var(--snug-text-primary))] mb-3">
              Apartment Size
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
            <h3 className="text-sm font-semibold text-[hsl(var(--snug-text-primary))] mb-3">
              House Rules
            </h3>
            <div className="space-y-3">
              {HOUSE_RULES.map((rule) => (
                <label key={rule} className="flex items-center gap-3 cursor-pointer">
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      filters.houseRules.includes(rule)
                        ? 'border-[hsl(var(--snug-text-primary))] bg-[hsl(var(--snug-text-primary))]'
                        : 'border-[hsl(var(--snug-border))]'
                    }`}
                    onClick={() => handleHouseRuleToggle(rule)}
                  >
                    {filters.houseRules.includes(rule) && (
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
                  <span className="text-sm text-[hsl(var(--snug-text-primary))]">{rule}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-[hsl(var(--snug-border))]">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 text-sm text-[hsl(var(--snug-text-primary))] hover:opacity-70 transition-opacity"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-8 py-2.5 bg-[hsl(var(--snug-orange))] text-white text-sm font-medium rounded-full hover:opacity-90 transition-opacity"
          >
            Show Results
          </button>
        </div>
      </div>
    </div>
  );
}
