'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { User, X, Globe } from 'lucide-react';
import { ChatIcon } from '@/shared/ui/icons';
import { Link, useRouter } from '@/i18n/navigation';
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
  const [isChatOpen, setIsChatOpen] = useState(false);
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
        {/* About Snug Link */}
        <Link
          href="/about"
          className="text-xs font-extrabold text-[hsl(var(--snug-text-primary))] hover:opacity-70 transition-opacity whitespace-nowrap tracking-tight"
        >
          {t('aboutSnug')}
        </Link>

        {/* Divider */}
        <div className="w-px h-2.5 bg-[#d8d8d8]" />

        {/* Become a Host Link */}
        <button
          type="button"
          onClick={handleHostModeClick}
          className="text-xs font-extrabold text-[hsl(var(--snug-text-primary))] hover:opacity-70 transition-opacity whitespace-nowrap tracking-tight"
        >
          {t('becomeHost')}
        </button>

        {/* Divider */}
        <div className="w-px h-2.5 bg-[#d8d8d8]" />

        {/* Login/MyPage Button - Pink */}
        <Link
          href={session ? '/mypage' : '/login?redirect=/mypage'}
          className="h-8 px-4 py-1.5 rounded-full bg-[#ef8bac] flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
        >
          <User className="w-3.5 h-3.5 text-white" />
          <span className="text-xs font-bold text-white tracking-tight">
            {session ? t('myPage') : 'Login'}
          </span>
        </Link>

        {/* Language Switcher - Brown with Globe icon */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsLangOpen(!isLangOpen)}
            className={`w-8 h-8 rounded-full flex items-center justify-center hover:opacity-90 transition-all ${
              isLangOpen ? 'bg-[hsl(var(--snug-light-gray))]' : 'bg-[hsl(var(--snug-brown))]'
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

        {/* Chat Button - Brown */}
        <button
          type="button"
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`w-8 h-8 rounded-full flex items-center justify-center hover:opacity-90 transition-all ${
            isChatOpen ? 'bg-[hsl(var(--snug-light-gray))]' : 'bg-[hsl(var(--snug-brown))]'
          }`}
          aria-label={isChatOpen ? 'Close chat' : 'Messages'}
        >
          {isChatOpen ? (
            <X className="w-3.5 h-3.5 text-[hsl(var(--snug-text-primary))]" />
          ) : (
            <ChatIcon className="w-3 h-3 text-white" />
          )}
        </button>
      </div>

      {/* Chat Modal placeholder - to be implemented */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="bg-white rounded-2xl p-6 shadow-xl max-w-sm mx-4">
            <p className="text-sm text-[hsl(var(--snug-text-secondary))]">
              Chat feature coming soon!
            </p>
            <button
              type="button"
              onClick={() => setIsChatOpen(false)}
              className="mt-4 w-full py-2 bg-[hsl(var(--snug-orange))] text-white text-sm font-medium rounded-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
