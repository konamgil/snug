'use client';

import { useState } from 'react';
import { ChatHeader, type ChatFilter } from './chat-header';
import { ChatListItem, type ChatItem } from './chat-list-item';

// Mock data for chat list
const MOCK_CHATS: ChatItem[] = [
  {
    id: 'snug-official',
    name: 'Snug',
    location: '',
    lastMessage:
      "Snug : Welcome to Snug! We're here to help if you need anything. Have a nice day!",
    dateRange: '',
    timestamp: 'Aug 01, 25',
    imageUrl: '/images/logo/logo-snug-icon.svg',
    isOnline: true,
    isSnugOfficial: true,
  },
  {
    id: '1',
    name: 'Jongmin',
    location: 'Gangnam-gu, Seoul',
    lastMessage: "Last speaker's name: Please let me know ...",
    dateRange: 'MM.DD.YY - MM.DD.YY',
    timestamp: '08:23 PM',
    imageUrl: 'https://placehold.co/72x72/f5f5f5/999?text=Room',
    isOnline: true,
  },
  {
    id: '2',
    name: 'Jongmin',
    location: 'Gangnam-gu, Seoul',
    lastMessage: "Last speaker's name: Please let me know ...",
    dateRange: 'MM.DD.YY - MM.DD.YY',
    timestamp: '6:40 PM',
    imageUrl: 'https://placehold.co/72x72/f5f5f5/999?text=Room',
    isOnline: true,
  },
  {
    id: '3',
    name: 'Soo',
    location: 'Gangnam-gu, Seoul',
    lastMessage: "Last speaker's name: Please let me know ...",
    dateRange: 'MM.DD.YY - MM.DD.YY',
    timestamp: 'Yesterday',
    imageUrl: 'https://placehold.co/72x72/f5f5f5/999?text=Room',
  },
  {
    id: '4',
    name: 'Minji',
    location: 'Itaewon, Seoul',
    lastMessage: "Last speaker's name: Please update ...",
    dateRange: 'MM.DD.YY - MM.DD.YY',
    timestamp: 'Yesterday',
    imageUrl: 'https://placehold.co/72x72/f5f5f5/999?text=Room',
  },
  {
    id: '5',
    name: 'Jisoo',
    location: 'Hongdae, Seoul',
    lastMessage: "Last speaker's name: Please confirm ...",
    dateRange: 'MM.DD.YY - MM.DD.YY',
    timestamp: 'Jul 28, 25',
    imageUrl: 'https://placehold.co/72x72/f5f5f5/999?text=Room',
  },
  {
    id: '6',
    name: 'Taejun',
    location: 'Myeongdong, Seoul',
    lastMessage: "Last speaker's name: Please advise ...",
    dateRange: 'MM.DD.YY - MM.DD.YY',
    timestamp: 'Jul 14, 25',
    imageUrl: 'https://placehold.co/72x72/f5f5f5/999?text=Room',
  },
  {
    id: '7',
    name: 'Yuna',
    location: 'Gangnam-gu, Seoul',
    lastMessage: "Last speaker's name: Please clarify ...",
    dateRange: 'MM.DD.YY - MM.DD.YY',
    timestamp: 'Jul 20, 25',
    imageUrl: 'https://placehold.co/72x72/f5f5f5/999?text=Room',
  },
];

interface ChatListProps {
  onChatSelect?: (chatId: string) => void;
}

export function ChatList({ onChatSelect }: ChatListProps) {
  const [filter, setFilter] = useState<ChatFilter>('all');

  const filteredChats = MOCK_CHATS.filter((chat) => {
    if (filter === 'all') return true;
    if (filter === 'snug') return chat.isSnugOfficial;
    if (filter === 'host') return !chat.isSnugOfficial;
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      <ChatHeader
        filter={filter}
        onFilterChange={setFilter}
        onSearchClick={() => {
          /* TODO: Implement search */
        }}
      />

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Snug Official - with border */}
        {filteredChats
          .filter((c) => c.isSnugOfficial)
          .map((chat) => (
            <div key={chat.id} className="border-b border-[hsl(var(--snug-border))]">
              <ChatListItem
                chat={chat}
                onClick={onChatSelect ? () => onChatSelect(chat.id) : undefined}
              />
            </div>
          ))}

        {/* Other Chats */}
        {filteredChats
          .filter((c) => !c.isSnugOfficial)
          .map((chat) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              onClick={onChatSelect ? () => onChatSelect(chat.id) : undefined}
            />
          ))}
      </div>
    </div>
  );
}
