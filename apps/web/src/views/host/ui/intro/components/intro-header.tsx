'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { User, Globe, X } from 'lucide-react';
import { SnugLogo } from '@/shared/ui';
import { ChatIcon } from '@/shared/ui/icons';
import { ChatModal } from '@/features/chat';

export function IntroHeader() {
  const t = useTranslations('home');
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#1a1a1a]">
        <div className="max-w-[1312px] mx-auto px-5 md:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <SnugLogo className="h-7 md:h-8 w-auto" />
            </Link>

            {/* Right Navigation */}
            <div className="flex items-center gap-2.5">
              {/* Guest Mode Button */}
              <Link
                href="/"
                className="flex px-4 py-2 text-xs font-normal text-white border border-white/50 rounded-full hover:bg-white/10 transition-colors whitespace-nowrap"
              >
                {t('guestMode')}
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
              <button
                type="button"
                className="w-8 h-8 rounded-full bg-[hsl(var(--snug-orange))] flex items-center justify-center hover:opacity-90 transition-opacity"
                aria-label="Change Language"
              >
                <Globe className="w-3.5 h-3.5 text-white" />
              </button>

              {/* Chat Button / Close Button */}
              <button
                type="button"
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`w-8 h-8 rounded-full flex items-center justify-center hover:opacity-90 transition-all ${
                  isChatOpen ? 'bg-white/20' : 'bg-[hsl(var(--snug-orange))]'
                }`}
                aria-label={isChatOpen ? 'Close chat' : 'Messages'}
              >
                {isChatOpen ? (
                  <X className="w-3.5 h-3.5 text-white" />
                ) : (
                  <ChatIcon className="w-3.5 h-3.5 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Modal */}
      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
}
