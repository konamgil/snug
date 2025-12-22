'use client';

import { ChatList } from '@/features/chat';
import { MobileNav } from '@/widgets/mobile-nav';

export function ChatPageView() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 pb-16 md:pb-0">
        <ChatList />
      </div>
      <MobileNav />
    </div>
  );
}
