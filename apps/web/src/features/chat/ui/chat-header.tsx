'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

export type ChatFilter = 'all' | 'host' | 'snug';

interface ChatHeaderProps {
  filter: ChatFilter;
  onFilterChange: (filter: ChatFilter) => void;
  onSearchClick?: () => void;
}

const FILTER_OPTIONS: { value: ChatFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'host', label: 'Host' },
  { value: 'snug', label: 'Snug' },
];

export function ChatHeader({ filter, onFilterChange, onSearchClick }: ChatHeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div className="flex items-center justify-between px-4 py-3">
      {/* Filter Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-1 text-lg font-bold text-[hsl(var(--snug-text-primary))]"
        >
          Chat
          {showDropdown ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {showDropdown && (
          <div className="absolute top-full left-0 mt-2 bg-white border border-[hsl(var(--snug-border))] rounded-2xl shadow-lg p-2 min-w-[120px] z-10">
            {FILTER_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onFilterChange(option.value);
                  setShowDropdown(false);
                }}
                className={`w-full px-3 py-2 text-left text-sm rounded-lg transition-colors ${
                  filter === option.value
                    ? 'text-[hsl(var(--snug-text-primary))] font-medium'
                    : 'text-[hsl(var(--snug-gray))] hover:bg-[hsl(var(--snug-light-gray))]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search Button */}
      <button
        type="button"
        onClick={onSearchClick}
        className="p-2 hover:bg-[hsl(var(--snug-light-gray))] rounded-full transition-colors"
        aria-label="Search chats"
      >
        <Search className="w-5 h-5 text-[hsl(var(--snug-text-primary))]" />
      </button>
    </div>
  );
}
