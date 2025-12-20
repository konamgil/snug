'use client';

import { useTranslations } from 'next-intl';
import { User, Globe, MessageCircle } from 'lucide-react';
import { Link } from '@/i18n/navigation';

export function Header() {
  const t = useTranslations('home');

  return (
    <header className="sticky top-0 z-50 w-full bg-white safe-top">
      <div className="flex h-14 md:h-16 items-center justify-end px-4 md:px-6">
        {/* Right Side Actions - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Host Mode Button */}
          <Link
            href="/host"
            className="flex px-4 py-2 text-xs font-normal text-[hsl(var(--snug-brown))] border border-[hsl(var(--snug-brown))] rounded-full hover:bg-[hsl(var(--snug-brown))]/5 transition-colors"
          >
            {t('hostMode')}
          </Link>

          {/* My Page Button */}
          <button
            type="button"
            className="w-8 h-8 rounded-full bg-[hsl(var(--snug-brown))] flex items-center justify-center hover:opacity-90 transition-opacity"
            aria-label="My Page"
          >
            <User className="w-3.5 h-3.5 text-white" />
          </button>

          {/* Language Switcher */}
          <button
            type="button"
            className="w-8 h-8 rounded-full bg-[hsl(var(--snug-orange))] flex items-center justify-center hover:opacity-90 transition-opacity"
            aria-label="Change Language"
          >
            <Globe className="w-3.5 h-3.5 text-white" />
          </button>

          {/* Chat Button */}
          <button
            type="button"
            className="w-8 h-8 rounded-full bg-[hsl(var(--snug-orange))] flex items-center justify-center hover:opacity-90 transition-opacity"
            aria-label="Messages"
          >
            <MessageCircle className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>
    </header>
  );
}
