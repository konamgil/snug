'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, Check } from 'lucide-react';

export type RoomTypeOption = 'all' | 'house' | 'sharedHouse' | 'sharedRoom';

interface RoomTypeDropdownProps {
  value: RoomTypeOption;
  onChange: (value: RoomTypeOption) => void;
}

export function RoomTypeDropdown({ value, onChange }: RoomTypeDropdownProps) {
  const t = useTranslations('search.filters');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const options: { value: RoomTypeOption; label: string }[] = [
    { value: 'all', label: t('roomTypes.all') },
    { value: 'house', label: t('roomTypes.house') },
    { value: 'sharedHouse', label: t('roomTypes.sharedHouse') },
    { value: 'sharedRoom', label: t('roomTypes.sharedRoom') },
  ];

  const selectedOption = options.find((opt) => opt.value === value);
  const isActive = value !== 'all';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (option: RoomTypeOption) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-xs transition-colors whitespace-nowrap ${
          isActive
            ? 'border-[hsl(var(--snug-orange))] text-[hsl(var(--snug-orange))]'
            : 'border-[hsl(var(--snug-border))] hover:border-[hsl(var(--snug-gray))]'
        }`}
      >
        {isActive ? selectedOption?.label : t('roomType')}
        <ChevronDown
          className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-1.5 w-40 bg-white rounded-2xl shadow-xl border border-[hsl(var(--snug-border))] z-50">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`w-full px-3 py-2 text-left text-[13px] rounded-xl transition-colors flex items-center justify-between ${
                value === option.value
                  ? 'font-semibold text-[hsl(var(--snug-text-primary))] bg-[hsl(var(--snug-light-gray))]'
                  : 'text-[hsl(var(--snug-text-primary))] hover:bg-[hsl(var(--snug-light-gray))]'
              }`}
            >
              {option.label}
              {value === option.value && (
                <Check className="w-4 h-4 text-[hsl(var(--snug-orange))]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
