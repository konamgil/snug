'use client';

import { ChatList } from '@/features/chat';

export function ChatPageView() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ChatList />
    </div>
  );
}
