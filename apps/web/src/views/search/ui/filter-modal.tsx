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
  facilities: string[];
  amenities: string[];
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
const HOUSE_RULES = ['Pets allowed', 'Women Only', 'Men Only'];
const FACILITIES = [
  'All',
  'Parking lot',
  'Lift',
  'Wifi',
  'Public gate with lock',
  'Fully furnished',
  'Private bathroom',
  'Washing machine',
  'Balcony/Terrace',
];
const AMENITIES = ['All', 'Queen sized Bed', 'Air conditioning', 'Dryer'];

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
        <h3 className="text-sm font-bold text-[hsl(var(--snug-text-primary))] mb-3">Room Type</h3>
        <div className="flex flex-wrap gap-2">
          {ROOM_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleRoomTypeToggle(type)}
              className={`px-4 py-2 text-sm border rounded-full transition-colors ${
                filters.roomTypes.includes(type)
                  ? 'border-[hsl(var(--snug-orange))] text-[hsl(var(--snug-orange))]'
                  : 'border-[hsl(var(--snug-border))] text-[hsl(var(--snug-text-primary))]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Property Type */}
      <div>
        <h3 className="text-sm font-bold text-[hsl(var(--snug-text-primary))] mb-3">
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
                  ? 'border-[hsl(var(--snug-orange))] text-[hsl(var(--snug-orange))]'
                  : 'border-[hsl(var(--snug-border))] text-[hsl(var(--snug-text-primary))]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div>
        <h3 className="text-sm font-bold text-[hsl(var(--snug-text-primary))]">
          Budget <span className="font-normal text-[hsl(var(--snug-gray))]">· Monthly payment</span>
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
            className="absolute w-full h-1 appearance-none bg-transparent pointer-events-auto cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[hsl(var(--snug-orange))] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
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
            className="absolute w-full h-1 appearance-none bg-transparent pointer-events-auto cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[hsl(var(--snug-orange))] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
          />
        </div>

        {/* Min/Max Inputs */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-xs text-[hsl(var(--snug-gray))] mb-1 block">Minimum</label>
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
            <label className="text-xs text-[hsl(var(--snug-gray))] mb-1 block">Maximum</label>
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
        <h3 className="text-sm font-bold text-[hsl(var(--snug-text-primary))] mb-3">House Rules</h3>
        <div className="space-y-3">
          {HOUSE_RULES.map((rule) => (
            <label key={rule} className="flex items-center gap-3 cursor-pointer">
              <div
                className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                  filters.houseRules.includes(rule)
                    ? 'bg-[hsl(var(--snug-orange))]'
                    : 'border-2 border-[hsl(var(--snug-border))]'
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

      {/* Facilities */}
      <div>
        <h3 className="text-sm font-bold text-[hsl(var(--snug-text-primary))] mb-3">Facilities</h3>
        <div className="grid grid-cols-2 gap-3">
          {FACILITIES.map((facility) => (
            <label key={facility} className="flex items-center gap-3 cursor-pointer">
              <div
                className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                  filters.facilities.includes(facility)
                    ? 'bg-[hsl(var(--snug-orange))]'
                    : 'border-2 border-[hsl(var(--snug-border))]'
                }`}
                onClick={() => handleFacilityToggle(facility)}
              >
                {filters.facilities.includes(facility) && (
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
              <span className="text-sm text-[hsl(var(--snug-text-primary))]">{facility}</span>
            </label>
          ))}
        </div>
      </div>

      {/* House amenities */}
      <div>
        <h3 className="text-sm font-bold text-[hsl(var(--snug-text-primary))] mb-3">
          House amenities
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {AMENITIES.map((amenity) => (
            <label key={amenity} className="flex items-center gap-3 cursor-pointer">
              <div
                className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                  filters.amenities.includes(amenity)
                    ? 'bg-[hsl(var(--snug-orange))]'
                    : 'border-2 border-[hsl(var(--snug-border))]'
                }`}
                onClick={() => handleAmenityToggle(amenity)}
              >
                {filters.amenities.includes(amenity) && (
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
              <span className="text-sm text-[hsl(var(--snug-text-primary))]">{amenity}</span>
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
        Reset
      </button>
      <button
        type="button"
        onClick={handleApply}
        className="flex-1 py-3 bg-[hsl(var(--snug-orange))] text-white text-sm font-semibold rounded-full hover:opacity-90 transition-opacity"
      >
        Show Results
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile: Full Screen */}
      <div className="lg:hidden fixed inset-0 z-[100] bg-white flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--snug-border))]">
          <h2 className="text-lg font-bold text-[hsl(var(--snug-text-primary))]">Filters</h2>
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
            <h2 className="text-lg font-bold text-[hsl(var(--snug-text-primary))]">Filters</h2>
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
