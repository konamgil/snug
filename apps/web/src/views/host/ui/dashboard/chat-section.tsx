'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Link } from '@/i18n/navigation';

type ChatFilter = 'all' | 'unread';

interface ChatMessage {
  id: string;
  name: string;
  message: string;
  timestamp: string;
  isOnline?: boolean;
}

const MOCK_CHATS: ChatMessage[] = [
  {
    id: '1',
    name: '김러그',
    message: '네, 감사합니다! 좋은 하루 보내세요!',
    timestamp: '15시 30분',
    isOnline: true,
  },
  {
    id: '2',
    name: '김숙박',
    message:
      '강남역 인근 직장을 다니고 있는데 숙소 근처 전철역은 어떤 역 인가요? 도보로 얼마나 걸리는지 궁금합니다!',
    timestamp: '11시 03분',
    isOnline: true,
  },
  {
    id: '3',
    name: '김숙박',
    message: '체크인 시간보다 늦게 도착할 것 같은데 숙소 체크인이 늦어질 경우 어떻게 되나요?',
    timestamp: '어제',
    isOnline: true,
  },
];

export function ChatSection() {
  const [filter, setFilter] = useState<ChatFilter>('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <section className="bg-white rounded-xl p-4 md:p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[hsl(var(--snug-text-primary))]">최신 채팅</h2>
        <Link href="/host/chat" className="text-sm text-[hsl(var(--snug-orange))] hover:underline">
          모든 채팅목록 보기
        </Link>
      </div>

      {/* Filter Dropdown */}
      <div className="relative mb-4">
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-1 text-sm text-[hsl(var(--snug-text-primary))]"
        >
          {filter === 'all' ? '전체' : '안 읽음'}
          <ChevronDown className="w-4 h-4" />
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-[hsl(var(--snug-border))] rounded-lg shadow-lg z-10">
            <button
              type="button"
              onClick={() => {
                setFilter('all');
                setIsDropdownOpen(false);
              }}
              className={`block w-full px-4 py-2 text-sm text-left hover:bg-[hsl(var(--snug-light-gray))] ${
                filter === 'all'
                  ? 'text-[hsl(var(--snug-orange))]'
                  : 'text-[hsl(var(--snug-text-primary))]'
              }`}
            >
              전체
            </button>
            <button
              type="button"
              onClick={() => {
                setFilter('unread');
                setIsDropdownOpen(false);
              }}
              className={`block w-full px-4 py-2 text-sm text-left hover:bg-[hsl(var(--snug-light-gray))] ${
                filter === 'unread'
                  ? 'text-[hsl(var(--snug-orange))]'
                  : 'text-[hsl(var(--snug-text-primary))]'
              }`}
            >
              안 읽음
            </button>
          </div>
        )}
      </div>

      {/* Chat List */}
      <div className="space-y-4">
        {MOCK_CHATS.map((chat) => (
          <div
            key={chat.id}
            className="cursor-pointer hover:bg-[hsl(var(--snug-light-gray))]/50 -mx-2 px-2 py-2 rounded transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 mr-4">
                <p className="text-sm font-medium text-[hsl(var(--snug-text-primary))]">
                  {chat.name}
                  {chat.isOnline && (
                    <span className="inline-block w-2 h-2 bg-[hsl(var(--snug-orange))] rounded-full ml-1.5" />
                  )}
                </p>
                <p className="text-sm text-[hsl(var(--snug-gray))] line-clamp-2 mt-0.5">
                  {chat.message}
                </p>
              </div>
              <span className="text-xs text-[hsl(var(--snug-gray))] flex-shrink-0">
                {chat.timestamp}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ChatEmptySection() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <section className="bg-white rounded-xl p-4 md:p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[hsl(var(--snug-text-primary))]">최신 채팅</h2>
        <Link href="/host/chat" className="text-sm text-[hsl(var(--snug-orange))] hover:underline">
          모든 채팅목록 보기
        </Link>
      </div>

      {/* Filter Dropdown */}
      <div className="relative mb-4">
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-1 text-sm text-[hsl(var(--snug-text-primary))]"
        >
          전체
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center h-[120px] text-center">
        <p className="text-sm text-[hsl(var(--snug-gray))]">최근 채팅이 없습니다.</p>
        <p className="text-sm text-[hsl(var(--snug-gray))]">
          숙소 문의나 게스트 메시지가 도착하면 이곳에서 확인할 수 있습니다.
        </p>
      </div>
    </section>
  );
}
