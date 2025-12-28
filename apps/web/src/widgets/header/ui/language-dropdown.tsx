'use client';

import { useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { locales, localeNames, localeFlags, type Locale } from '@/i18n/config';

interface LanguageDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LanguageDropdown({ isOpen, onClose }: LanguageDropdownProps) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLocaleChange = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale });
    onClose();
  };

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Delay to prevent immediate close on open
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 p-1.5 w-40 bg-white rounded-xl shadow-xl border border-[hsl(var(--snug-border))] z-50"
    >
      {locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => handleLocaleChange(loc)}
          className={`w-full px-3 py-2.5 text-left text-sm rounded-lg transition-colors ${
            locale === loc
              ? 'bg-[hsl(var(--snug-orange))]/10 text-[hsl(var(--snug-orange))] font-medium'
              : 'text-[hsl(var(--snug-text-primary))] hover:bg-[hsl(var(--snug-light-gray))]'
          }`}
        >
          <span className="mr-2">{localeFlags[loc]}</span>
          {localeNames[loc]}
        </button>
      ))}
    </div>
  );
}
