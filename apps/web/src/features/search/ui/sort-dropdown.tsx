'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';

export type SortOption = 'recommended' | 'newest' | 'oldest' | 'priceHigh' | 'priceLow';

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const t = useTranslations('search.sort');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const options: { value: SortOption; label: string }[] = [
    { value: 'recommended', label: t('recommended') },
    { value: 'newest', label: t('newest') },
    { value: 'oldest', label: t('oldest') },
    { value: 'priceHigh', label: t('priceHigh') },
    { value: 'priceLow', label: t('priceLow') },
  ];

  const selectedOption = options.find((opt) => opt.value === value);

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

  const handleSelect = (option: SortOption) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-[13px] font-medium text-[hsl(var(--snug-text-primary))]"
      >
        {selectedOption?.label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 p-1.5 w-36 bg-white rounded-2xl shadow-xl border border-[hsl(var(--snug-border))] z-50">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`w-full px-3 py-2 text-left text-[13px] rounded-xl transition-colors ${
                value === option.value
                  ? 'font-semibold text-[hsl(var(--snug-text-primary))] bg-[hsl(var(--snug-light-gray))]'
                  : 'text-[hsl(var(--snug-text-primary))] hover:bg-[hsl(var(--snug-light-gray))]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
