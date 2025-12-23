'use client';

import { useState } from 'react';
import { Star, Search, Paperclip, Send } from 'lucide-react';
import Image from 'next/image';

interface RoomInfoCard {
  badge: string;
  imageUrl: string;
  propertyName: string;
  roomNumber: string;
  dateRange: string;
  guestCount: number;
  price: number;
}

interface ChatMessage {
  id: string;
  type: 'guest' | 'host' | 'system';
  originalText?: string;
  translatedText?: string;
  timestamp: string;
  isRead: boolean;
  roomInfo?: RoomInfoCard;
}

interface ContractsChatProps {
  guestName: string;
  guestAvatar?: string;
  isFavorite: boolean;
  onToggleFavorite?: () => void;
}

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    type: 'guest',
    roomInfo: {
      badge: '숙소 연장 문의',
      imageUrl: '',
      propertyName: 'Korea Stay',
      roomNumber: '101호',
      dateRange: '2025.08.26-2025.09.02 (1주일)',
      guestCount: 2,
      price: 650000,
    },
    originalText: 'Can I extend my current reservation for one more week?',
    translatedText: '안녕하세요, 현재 예약을 1주일 더 연장할 수 있을까요?',
    timestamp: '오전 2:00',
    isRead: true,
  },
  {
    id: '2',
    type: 'host',
    translatedText:
      'Korea Stay 101호는 기존 일정과 겹쳐 연장이 어렵습니다. 대신 가까운 다른 룸을 추천해드려도 될까요?',
    timestamp: '오전 2:01',
    isRead: true,
  },
  {
    id: '3',
    type: 'guest',
    originalText: "Sure, that's okay.",
    translatedText: '네 괜찮습니다.',
    timestamp: '',
    isRead: true,
  },
];

export function ContractsChat({
  guestName,
  guestAvatar,
  isFavorite,
  onToggleFavorite,
}: ContractsChatProps) {
  const [message, setMessage] = useState('');

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  return (
    <div className="h-full flex flex-col bg-white border-x border-[hsl(var(--snug-border))]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--snug-border))]">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 flex-shrink-0 overflow-hidden">
            {guestAvatar && (
              <Image
                src={guestAvatar}
                alt={guestName}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <span className="text-base font-bold text-[hsl(var(--snug-text-primary))]">
            {guestName}
          </span>
          <button type="button" onClick={onToggleFavorite}>
            <Star
              className={`w-5 h-5 ${
                isFavorite
                  ? 'fill-[hsl(var(--snug-orange))] text-[hsl(var(--snug-orange))]'
                  : 'text-[hsl(var(--snug-gray))]'
              }`}
            />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-2 hover:bg-[hsl(var(--snug-light-gray))] rounded-lg transition-colors"
            aria-label="Translate"
          >
            <span className="text-sm font-medium text-[hsl(var(--snug-text-primary))]">
              A<sub>가</sub>
            </span>
          </button>
          <button
            type="button"
            className="p-2 hover:bg-[hsl(var(--snug-light-gray))] rounded-lg transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-[hsl(var(--snug-text-primary))]" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Date Separator */}
        <div className="flex items-center justify-center">
          <span className="text-xs text-[hsl(var(--snug-gray))] px-4 py-1 bg-[hsl(var(--snug-light-gray))] rounded-full">
            9월 12일 금
          </span>
        </div>

        {MOCK_MESSAGES.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.type === 'host' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.type === 'guest' && (
              <div className="flex gap-2 max-w-[80%]">
                {/* Guest Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 flex-shrink-0 overflow-hidden">
                  {guestAvatar && (
                    <Image
                      src={guestAvatar}
                      alt={guestName}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  {/* Room Info Card */}
                  {msg.roomInfo && (
                    <div className="border border-[hsl(var(--snug-border))] rounded-lg p-3 bg-white">
                      <span className="inline-block px-2 py-0.5 text-xs text-[hsl(var(--snug-orange))] border border-[hsl(var(--snug-orange))] rounded mb-2">
                        {msg.roomInfo.badge}
                      </span>
                      <div className="flex gap-3">
                        <div className="w-16 h-12 rounded overflow-hidden bg-[hsl(var(--snug-light-gray))]">
                          {msg.roomInfo.imageUrl ? (
                            <Image
                              src={msg.roomInfo.imageUrl}
                              alt={msg.roomInfo.propertyName}
                              width={64}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-50" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-[hsl(var(--snug-text-primary))]">
                            {msg.roomInfo.propertyName}
                          </p>
                          <p className="text-sm font-bold text-[hsl(var(--snug-text-primary))]">
                            {msg.roomInfo.roomNumber}
                          </p>
                          <p className="text-xs text-[hsl(var(--snug-gray))]">
                            {msg.roomInfo.dateRange}
                          </p>
                          <p className="text-xs text-[hsl(var(--snug-gray))]">
                            {msg.roomInfo.guestCount}명 | {formatPrice(msg.roomInfo.price)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className="bg-[hsl(var(--snug-light-gray))] rounded-lg p-3">
                    {msg.originalText && (
                      <p className="text-sm text-[hsl(var(--snug-gray))] mb-1">
                        {msg.originalText}
                      </p>
                    )}
                    <p className="text-sm text-[hsl(var(--snug-text-primary))]">
                      {msg.translatedText}
                    </p>
                  </div>

                  {/* Customer Inquiry Button */}
                  {msg.roomInfo && (
                    <button
                      type="button"
                      className="px-4 py-2 text-sm text-[hsl(var(--snug-text-primary))] border border-[hsl(var(--snug-border))] rounded-full hover:bg-[hsl(var(--snug-light-gray))] transition-colors"
                    >
                      고객 문의 등록
                    </button>
                  )}

                  {msg.timestamp && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[hsl(var(--snug-gray))]">읽음</span>
                      <span className="text-xs text-[hsl(var(--snug-gray))]">{msg.timestamp}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {msg.type === 'host' && (
              <div className="flex gap-2 max-w-[80%]">
                <div className="space-y-1">
                  {/* Message Bubble */}
                  <div className="bg-[hsl(var(--snug-orange))] text-white rounded-lg p-3">
                    <p className="text-sm">{msg.translatedText}</p>
                  </div>

                  {msg.timestamp && (
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-xs text-[hsl(var(--snug-gray))]">읽음</span>
                      <span className="text-xs text-[hsl(var(--snug-gray))]">{msg.timestamp}</span>
                    </div>
                  )}
                </div>

                {/* Host Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 flex-shrink-0 flex items-center justify-center">
                  <span className="text-lg">👤</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="border-t border-[hsl(var(--snug-border))] p-4">
        <div className="flex items-center gap-2 border border-[hsl(var(--snug-border))] rounded-lg px-3 py-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="내용을 입력해주세요."
            className="flex-1 text-sm focus:outline-none"
          />
          <button
            type="button"
            className="p-1 hover:bg-[hsl(var(--snug-light-gray))] rounded transition-colors"
          >
            <Send className="w-5 h-5 text-[hsl(var(--snug-gray))]" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3 mt-2">
          <button
            type="button"
            className="flex items-center gap-1 text-sm text-[hsl(var(--snug-gray))] hover:text-[hsl(var(--snug-text-primary))]"
          >
            <Paperclip className="w-4 h-4" />
            첨부
          </button>
          <button
            type="button"
            className="flex items-center gap-1 text-sm text-[hsl(var(--snug-gray))] hover:text-[hsl(var(--snug-text-primary))]"
          >
            <span className="w-4 h-4">💡</span>
            빠른 답변
          </button>
          <button
            type="button"
            className="flex items-center gap-1 text-sm text-[hsl(var(--snug-gray))] hover:text-[hsl(var(--snug-text-primary))]"
          >
            <span className="w-4 h-4">📅</span>
            예약 전송
          </button>
        </div>
      </div>
    </div>
  );
}
