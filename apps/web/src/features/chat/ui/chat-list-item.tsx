'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';

export interface ChatItem {
  id: string;
  name: string;
  location: string;
  lastMessage: string;
  dateRange: string;
  timestamp: string;
  imageUrl: string;
  isOnline?: boolean;
  isSnugOfficial?: boolean;
}

interface ChatListItemProps {
  chat: ChatItem;
  onClick?: () => void;
}

export function ChatListItem({ chat, onClick }: ChatListItemProps) {
  const content = (
    <div className="flex gap-3 p-3 hover:bg-[hsl(var(--snug-light-gray))] transition-colors cursor-pointer">
      {/* Profile Image */}
      <div className="relative flex-shrink-0">
        <div className="w-[72px] h-[72px] rounded-lg overflow-hidden bg-[hsl(var(--snug-light-gray))]">
          {chat.isSnugOfficial ? (
            <div className="w-full h-full flex items-center justify-center bg-[hsl(var(--snug-light-gray))] border border-[hsl(var(--snug-border))] rounded-lg">
              <span className="text-lg font-bold text-[hsl(var(--snug-orange))]">snug.</span>
            </div>
          ) : (
            <Image
              src={chat.imageUrl}
              alt={chat.name}
              width={72}
              height={72}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        {/* Online Indicator */}
        {chat.isOnline && (
          <div className="absolute top-0 right-0 w-3 h-3 bg-[hsl(var(--snug-orange))] rounded-full border-2 border-white" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[hsl(var(--snug-text-primary))] truncate">
              {chat.name}
              {!chat.isSnugOfficial && (
                <span className="font-normal text-[hsl(var(--snug-gray))]"> · {chat.location}</span>
              )}
            </p>
          </div>
          <span className="text-xs text-[hsl(var(--snug-gray))] whitespace-nowrap flex-shrink-0">
            {chat.timestamp}
          </span>
        </div>
        <p className="text-sm text-[hsl(var(--snug-gray))] truncate mt-0.5">{chat.lastMessage}</p>
        {!chat.isSnugOfficial && (
          <p className="text-xs text-[hsl(var(--snug-gray))] mt-0.5">{chat.dateRange}</p>
        )}
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="w-full text-left">
        {content}
      </button>
    );
  }

  return (
    <Link href={`/chat/${chat.id}`} className="block">
      {content}
    </Link>
  );
}
