'use client';

import { useTranslations } from 'next-intl';
import { MessageSquare } from 'lucide-react';
import { ComingSoonOverlay } from '../coming-soon-overlay';

export function HostChatPage() {
  const t = useTranslations('host.sidebar');

  return (
    <ComingSoonOverlay>
      <div className="h-full flex flex-col bg-white p-6">
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="w-6 h-6 text-[hsl(var(--snug-orange))]" />
          <h1 className="text-xl font-bold">{t('chat')}</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">채팅</p>
          </div>
        </div>
      </div>
    </ComingSoonOverlay>
  );
}
