'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  className = '',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={selectRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 border rounded-[28px] text-sm text-left flex items-center justify-between transition-colors ${
          isOpen ? 'border-[hsl(var(--snug-orange))]' : 'border-[hsl(var(--snug-border))]'
        } bg-white`}
      >
        <span
          className={
            selectedOption ? 'text-[hsl(var(--snug-text-primary))]' : 'text-[hsl(var(--snug-gray))]'
          }
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-[hsl(var(--snug-gray))]" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[hsl(var(--snug-gray))]" />
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[hsl(var(--snug-border))] rounded-[20px] shadow-lg z-50 p-2">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`w-full px-4 py-3 text-sm text-left transition-colors rounded-xl ${
                value === option.value
                  ? 'bg-[hsl(var(--snug-light-gray))] text-[hsl(var(--snug-text-primary))]'
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
