'use client';

import { useState } from 'react';
import { ArrowLeft, Languages, Search, Paperclip, Lightbulb, Clock, Send } from 'lucide-react';

interface ChatDetailProps {
  chatId: string; // Used to fetch chat data
  onBack: () => void;
}

interface RoomCard {
  id: string;
  type: 'payment' | 'extend';
  roomName: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  duration: string;
  guests: number;
  price: string;
}

interface Message {
  id: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  isMe: boolean;
  isAI?: boolean;
  roomCard?: RoomCard;
  systemMessage?: string;
}

// Mock data
const MOCK_MESSAGES: Message[] = [
  {
    id: '0',
    content: '',
    timestamp: '',
    isRead: true,
    isMe: true,
    roomCard: {
      id: 'r1',
      type: 'extend',
      roomName: 'Room 101',
      propertyName: 'Urban Stay',
      checkIn: 'Sep 12, 25',
      checkOut: 'Sep 12, 25',
      duration: '1w',
      guests: 2,
      price: '471.08$',
    },
  },
  {
    id: '1',
    content: 'Hello, can I extend my stay for one more week?',
    timestamp: '2:00 AM',
    isRead: true,
    isMe: true,
  },
  {
    id: '2',
    content: '',
    timestamp: '',
    isRead: true,
    isMe: false,
    systemMessage:
      'The host is currently unavailable,\nso the AI assistant will assist you instead.',
  },
  {
    id: '3',
    content:
      'Unfortunately, Gangnam Urban Stay Room 101 is not available for an extension due to overlapping reservations. May I suggest another nearby room instead?',
    timestamp: '2:01 AM',
    isRead: true,
    isMe: false,
    isAI: true,
  },
  {
    id: '4',
    content: "Sure, that's okay.",
    timestamp: '2:00 AM',
    isRead: true,
    isMe: true,
  },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ChatDetail({ chatId, onBack }: ChatDetailProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message.trim()) return;
    // TODO: Implement actual message sending
    setMessage('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-[hsl(var(--snug-border))]">
        <button
          type="button"
          onClick={onBack}
          className="p-1 hover:bg-[hsl(var(--snug-light-gray))] rounded-full transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-[hsl(var(--snug-text-primary))]" />
        </button>

        {/* Room Thumbnail */}
        <div className="w-9 h-9 rounded-full overflow-hidden bg-[hsl(var(--snug-light-gray))] flex items-center justify-center">
          <span className="text-[10px] text-[hsl(var(--snug-gray))]">R</span>
        </div>

        <span className="flex-1 font-semibold text-sm text-[hsl(var(--snug-text-primary))]">
          Snug Host
        </span>

        <button
          type="button"
          className="p-1.5 hover:bg-[hsl(var(--snug-light-gray))] rounded-full transition-colors"
          aria-label="Translate"
        >
          <Languages className="w-4 h-4 text-[hsl(var(--snug-orange))]" />
        </button>

        <button
          type="button"
          className="p-1.5 hover:bg-[hsl(var(--snug-light-gray))] rounded-full transition-colors"
          aria-label="Search"
        >
          <Search className="w-4 h-4 text-[hsl(var(--snug-text-primary))]" />
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-4">
        {/* Date Separator */}
        <div className="flex items-center justify-center">
          <div className="border-t border-[hsl(var(--snug-border))] flex-1" />
          <span className="px-4 text-xs text-[hsl(var(--snug-gray))]">Sep 12 Fri.</span>
          <div className="border-t border-[hsl(var(--snug-border))] flex-1" />
        </div>

        {MOCK_MESSAGES.map((msg) => (
          <div key={msg.id}>
            {/* System Message */}
            {msg.systemMessage && (
              <div className="text-center py-2">
                <p className="text-xs text-[hsl(var(--snug-gray))] whitespace-pre-line">
                  {msg.systemMessage}
                </p>
              </div>
            )}

            {/* Room Card */}
            {msg.roomCard && (
              <div className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'} gap-2`}>
                <RoomRequestCard card={msg.roomCard} />
                {msg.isMe && (
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-[hsl(var(--snug-light-gray))] flex-shrink-0 flex items-center justify-center">
                    <span className="text-[10px] text-[hsl(var(--snug-gray))]">U</span>
                  </div>
                )}
              </div>
            )}

            {/* Message */}
            {msg.content && (
              <div className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'} gap-2 items-end`}>
                {/* AI Avatar */}
                {msg.isAI && (
                  <div className="w-9 h-9 rounded-full bg-[hsl(var(--snug-orange))] flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-white">snug.</span>
                  </div>
                )}

                {/* Timestamp (left of message for user) */}
                {msg.isMe && (
                  <div className="flex flex-col justify-end text-[10px] text-[hsl(var(--snug-gray))] text-right">
                    <span>read</span>
                    <span>{msg.timestamp}</span>
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`max-w-[200px] px-3 py-2 rounded-2xl text-sm ${
                    msg.isMe
                      ? 'bg-[hsl(var(--snug-light-gray))] text-[hsl(var(--snug-text-primary))]'
                      : msg.isAI
                        ? 'bg-white border border-[hsl(var(--snug-border))] text-[hsl(var(--snug-text-primary))]'
                        : 'bg-white border border-[hsl(var(--snug-border))] text-[hsl(var(--snug-text-primary))]'
                  }`}
                >
                  {msg.content}
                </div>

                {/* Timestamp (right of message for others) */}
                {!msg.isMe && (
                  <div className="flex flex-col justify-end text-[10px] text-[hsl(var(--snug-gray))]">
                    <span>read</span>
                    <span>{msg.timestamp}</span>
                  </div>
                )}

                {/* User Avatar */}
                {msg.isMe && (
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-[hsl(var(--snug-light-gray))] flex-shrink-0 flex items-center justify-center">
                    <span className="text-[10px] text-[hsl(var(--snug-gray))]">U</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="border-t border-[hsl(var(--snug-border))] p-3">
        <div className="border border-[hsl(var(--snug-border))] rounded-2xl p-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="w-full text-sm text-[hsl(var(--snug-text-primary))] placeholder:text-[hsl(var(--snug-gray))] outline-none"
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="flex items-center gap-1 px-2 py-1 text-xs text-[hsl(var(--snug-text-primary))] hover:bg-[hsl(var(--snug-light-gray))] rounded-full transition-colors"
              >
                <Paperclip className="w-3.5 h-3.5" />
                Attach
              </button>
              <button
                type="button"
                className="flex items-center gap-1 px-2 py-1 text-xs text-[hsl(var(--snug-text-primary))] hover:bg-[hsl(var(--snug-light-gray))] rounded-full transition-colors"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                Quick Reply
              </button>
              <button
                type="button"
                className="flex items-center gap-1 px-2 py-1 text-xs text-[hsl(var(--snug-text-primary))] hover:bg-[hsl(var(--snug-light-gray))] rounded-full transition-colors"
              >
                <Clock className="w-3.5 h-3.5" />
                Schedule
              </button>
            </div>

            <button
              type="button"
              onClick={handleSend}
              className="p-1.5 hover:bg-[hsl(var(--snug-light-gray))] rounded-full transition-colors"
              aria-label="Send message"
            >
              <Send className="w-4 h-4 text-[hsl(var(--snug-text-primary))]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RoomRequestCard({ card }: { card: RoomCard }) {
  const badgeText = card.type === 'extend' ? 'Extend Stay Req.' : 'Payment Req.';

  return (
    <div className="border border-[hsl(var(--snug-border))] rounded-2xl overflow-hidden max-w-[220px]">
      <div className="flex gap-2 p-2">
        {/* Room Image */}
        <div className="w-[70px] h-[55px] rounded-lg overflow-hidden bg-[hsl(var(--snug-light-gray))] flex-shrink-0 flex items-center justify-center">
          <span className="text-[10px] text-[hsl(var(--snug-gray))]">Room</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <span className="inline-block px-1.5 py-0.5 text-[10px] text-[hsl(var(--snug-orange))] border border-[hsl(var(--snug-orange))] rounded mb-0.5">
            {badgeText}
          </span>
          <p className="text-[10px] text-[hsl(var(--snug-gray))]">{card.propertyName}</p>
          <p className="text-xs font-semibold text-[hsl(var(--snug-text-primary))]">
            {card.roomName}
          </p>
          <p className="text-[10px] text-[hsl(var(--snug-gray))]">
            {card.checkIn} - {card.checkOut} ({card.duration})
          </p>
          <p className="text-[10px] text-[hsl(var(--snug-gray))]">
            {card.guests} guests | {card.price}
          </p>
        </div>
      </div>
    </div>
  );
}
