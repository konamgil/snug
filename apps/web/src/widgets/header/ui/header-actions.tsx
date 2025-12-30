'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { User, Globe, X } from 'lucide-react';
// import { ChatIcon } from '@/shared/ui/icons'; // TODO: 채팅 기능 오픈 시 활성화
import { Link, useRouter } from '@/i18n/navigation';
// import { ChatModal } from '@/features/chat'; // TODO: 채팅 기능 오픈 시 활성화
import { LanguageDropdown } from './language-dropdown';
import { useAuthStore } from '@/shared/stores';
import { getAccommodations } from '@/shared/api/accommodation';

interface HeaderActionsProps {
  className?: string;
}

export function HeaderActions({ className }: HeaderActionsProps) {
  const t = useTranslations('home');
  const router = useRouter();
  const { session } = useAuthStore();
  // const [isChatOpen, setIsChatOpen] = useState(false); // TODO: 채팅 기능 오픈 시 활성화
  const [isLangOpen, setIsLangOpen] = useState(false);

  const handleHostModeClick = async () => {
    // Not logged in → redirect to login
    if (!session) {
      router.push('/login?redirect=/host');
      return;
    }

    try {
      const accommodations = await getAccommodations();
      if (accommodations.length > 0) {
        // Host → go to dashboard
        router.push('/host');
      } else {
        // Not a host → go to intro
        router.push('/host/intro');
      }
    } catch (error) {
      console.error('[HeaderActions] Error checking host status:', error);
      // On error, go to intro
      router.push('/host/intro');
    }
  };

  return (
    <>
      <div className={`flex items-center gap-2.5 ${className ?? ''}`}>
        {/* Host Mode Button */}
        <button
          type="button"
          onClick={handleHostModeClick}
          className="flex px-4 py-2 text-xs font-normal text-[hsl(var(--snug-brown))] border border-[hsl(var(--snug-brown))] rounded-full hover:bg-[hsl(var(--snug-brown))]/5 transition-colors whitespace-nowrap"
        >
          {t('hostMode')}
        </button>

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

        {/* TODO: 채팅 기능 오픈 시 활성화
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
        */}
      </div>

      {/* TODO: 채팅 기능 오픈 시 활성화
      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      */}
    </>
  );
}
