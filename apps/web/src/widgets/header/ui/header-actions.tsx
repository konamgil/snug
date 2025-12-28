'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { User, Globe, X } from 'lucide-react';
import { ChatIcon } from '@/shared/ui/icons';
import { Link } from '@/i18n/navigation';
import { ChatModal } from '@/features/chat';
import { LanguageDropdown } from './language-dropdown';

interface HeaderActionsProps {
  className?: string;
}

export function HeaderActions({ className }: HeaderActionsProps) {
  const t = useTranslations('home');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  return (
    <>
      <div className={`flex items-center gap-2.5 ${className ?? ''}`}>
        {/* Host Mode Button */}
        <Link
          href="/host"
          className="flex px-4 py-2 text-xs font-normal text-[hsl(var(--snug-brown))] border border-[hsl(var(--snug-brown))] rounded-full hover:bg-[hsl(var(--snug-brown))]/5 transition-colors whitespace-nowrap"
        >
          {t('hostMode')}
        </Link>

        {/* My Page Button */}
        <Link
          href="/mypage/profile"
          className="w-8 h-8 rounded-full bg-[hsl(var(--snug-brown))] flex items-center justify-center hover:opacity-90 transition-opacity"
          aria-label="My Page"
        >
          <User className="w-3.5 h-3.5 text-white" />
        </Link>

        {/* Language Switcher */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsLangOpen(!isLangOpen)}
            className={`w-8 h-8 rounded-full flex items-center justify-center hover:opacity-90 transition-all ${
              isLangOpen ? 'bg-[hsl(var(--snug-light-gray))]' : 'bg-[hsl(var(--snug-orange))]'
            }`}
            aria-label={isLangOpen ? 'Close language menu' : 'Change Language'}
          >
            {isLangOpen ? (
              <X className="w-3.5 h-3.5 text-[hsl(var(--snug-text-primary))]" />
            ) : (
              <Globe className="w-3.5 h-3.5 text-white" />
            )}
          </button>
          <LanguageDropdown isOpen={isLangOpen} onClose={() => setIsLangOpen(false)} />
        </div>

        {/* Chat Button / Close Button */}
        <button
          type="button"
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`w-8 h-8 rounded-full flex items-center justify-center hover:opacity-90 transition-all ${
            isChatOpen ? 'bg-[hsl(var(--snug-light-gray))]' : 'bg-[hsl(var(--snug-orange))]'
          }`}
          aria-label={isChatOpen ? 'Close chat' : 'Messages'}
        >
          {isChatOpen ? (
            <X className="w-3.5 h-3.5 text-[hsl(var(--snug-text-primary))]" />
          ) : (
            <ChatIcon className="w-3.5 h-3.5 text-white" />
          )}
        </button>
      </div>

      {/* Chat Modal */}
      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
}
