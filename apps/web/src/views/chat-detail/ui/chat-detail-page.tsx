'use client';

import { useState } from 'react';
import { ArrowLeft, Languages, Search, Paperclip, Lightbulb, Clock, Send } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';

interface ChatDetailViewProps {
  chatId: string;
}

interface PaymentCard {
  id: string;
  type: 'request' | 'complete';
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
  translatedContent?: string;
  timestamp: string;
  isRead: boolean;
  isMe: boolean;
  paymentCard?: PaymentCard;
  dateSeparator?: string;
}

// Mock data
const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    content: 'for Seoul Dewll Room 201, updated with the adjusted amount.',
    timestamp: '2:01 AM',
    isRead: true,
    isMe: false,
  },
  {
    id: '2',
    content: '',
    timestamp: '2:01 AM',
    isRead: true,
    isMe: false,
    paymentCard: {
      id: 'p1',
      type: 'request',
      roomName: 'Room 201',
      propertyName: 'Seoul Dwell',
      checkIn: 'Sep 12, 25',
      checkOut: 'Sep 26, 25',
      duration: '2w',
      guests: 2,
      price: '978.4$',
    },
  },
  {
    id: '3',
    content: '(Payment Complete)',
    timestamp: '2:00 AM',
    isRead: true,
    isMe: true,
  },
  {
    id: '4',
    content: '',
    timestamp: '2:00 AM',
    isRead: true,
    isMe: false,
    paymentCard: {
      id: 'p2',
      type: 'complete',
      roomName: 'Room 201',
      propertyName: 'Seoul Dwell',
      checkIn: 'Sep 12, 25',
      checkOut: 'Sep 26, 25',
      duration: '2w',
      guests: 2,
      price: '978.4$',
    },
  },
  {
    id: '5',
    content: '',
    timestamp: '12:01 PM',
    isRead: false,
    isMe: false,
    dateSeparator: 'Sep 27 Sat.',
  },
  {
    id: '6',
    content: 'Thank you for staying with us.',
    translatedContent: '저희 숙소를 이용해 주셔서 감사합니다.',
    timestamp: '12:01 PM',
    isRead: false,
    isMe: false,
  },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ChatDetailView({ chatId }: ChatDetailViewProps) {
  const router = useRouter();
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message.trim()) return;
    // TODO: Implement actual message sending
    setMessage('');
  };

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-1 hover:bg-[hsl(var(--snug-light-gray))] rounded-full transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6 text-[hsl(var(--snug-text-primary))]" />
        </button>

        {/* Room Thumbnail */}
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-[hsl(var(--snug-light-gray))] flex items-center justify-center">
          <span className="text-[10px] text-[hsl(var(--snug-gray))]">Room</span>
        </div>

        <span className="flex-1 font-semibold text-[hsl(var(--snug-text-primary))]">Snug Host</span>

        <button
          type="button"
          className="p-2 hover:bg-[hsl(var(--snug-light-gray))] rounded-full transition-colors"
          aria-label="Translate"
        >
          <Languages className="w-5 h-5 text-[hsl(var(--snug-text-primary))]" />
        </button>

        <button
          type="button"
          className="p-2 hover:bg-[hsl(var(--snug-light-gray))] rounded-full transition-colors"
          aria-label="Search"
        >
          <Search className="w-5 h-5 text-[hsl(var(--snug-text-primary))]" />
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {MOCK_MESSAGES.map((msg) => (
          <div key={msg.id}>
            {/* Date Separator */}
            {msg.dateSeparator && (
              <div className="flex items-center justify-center my-4">
                <div className="border-t border-[hsl(var(--snug-border))] flex-1" />
                <span className="px-4 text-xs text-[hsl(var(--snug-gray))]">
                  {msg.dateSeparator}
                </span>
                <div className="border-t border-[hsl(var(--snug-border))] flex-1" />
              </div>
            )}

            {/* Message */}
            {(msg.content || msg.paymentCard) && (
              <div className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'} gap-2`}>
                {/* Host Avatar (left side) */}
                {!msg.isMe && !msg.paymentCard && (
                  <div className="w-10 h-10 rounded-full bg-[hsl(var(--snug-light-gray))] flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">👤</span>
                  </div>
                )}

                {/* Message Content */}
                <div className={`max-w-[280px] ${msg.isMe ? 'order-1' : ''}`}>
                  {msg.paymentCard ? (
                    <PaymentRequestCard card={msg.paymentCard} />
                  ) : (
                    <div
                      className={`px-4 py-2.5 rounded-2xl ${
                        msg.isMe
                          ? 'bg-[hsl(var(--snug-light-gray))]'
                          : 'bg-white border border-[hsl(var(--snug-border))]'
                      }`}
                    >
                      {msg.translatedContent && (
                        <p className="text-sm text-[hsl(var(--snug-gray))] mb-1">
                          {msg.translatedContent}
                        </p>
                      )}
                      <p className="text-sm text-[hsl(var(--snug-text-primary))]">{msg.content}</p>
                    </div>
                  )}
                </div>

                {/* Timestamp & Read Status */}
                <div
                  className={`flex flex-col justify-end text-xs text-[hsl(var(--snug-gray))] ${
                    msg.isMe ? 'order-0 text-right' : 'text-left'
                  }`}
                >
                  <span>{msg.isRead ? 'read' : 'Unread'}</span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* My Avatar (right side) */}
                {msg.isMe && !msg.paymentCard && (
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-[hsl(var(--snug-light-gray))] flex-shrink-0 order-2 flex items-center justify-center">
                    <span className="text-xs text-[hsl(var(--snug-gray))]">U</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="flex-shrink-0 bg-white">
        <div className="p-4">
          <div className="border border-[hsl(var(--snug-border))] rounded-2xl p-3">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full text-sm text-[hsl(var(--snug-text-primary))] placeholder:text-[hsl(var(--snug-gray))] resize-none outline-none min-h-[36px]"
              rows={1}
            />

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[hsl(var(--snug-text-primary))] hover:bg-[hsl(var(--snug-light-gray))] rounded-full transition-colors"
                >
                  <Paperclip className="w-4 h-4" />
                  Attach
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[hsl(var(--snug-text-primary))] hover:bg-[hsl(var(--snug-light-gray))] rounded-full transition-colors"
                >
                  <Lightbulb className="w-4 h-4" />
                  Quick Reply
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[hsl(var(--snug-text-primary))] hover:bg-[hsl(var(--snug-light-gray))] rounded-full transition-colors"
                >
                  <Clock className="w-4 h-4" />
                  Schedule
                </button>
              </div>

              <button
                type="button"
                onClick={handleSend}
                className="p-2 hover:bg-[hsl(var(--snug-light-gray))] rounded-full transition-colors"
                aria-label="Send message"
              >
                <Send className="w-5 h-5 text-[hsl(var(--snug-text-primary))]" />
              </button>
            </div>
          </div>
        </div>
        {/* Bottom spacer for safe area */}
        <div className="h-1 safe-bottom" />
      </div>
    </div>
  );
}

function PaymentRequestCard({ card }: { card: PaymentCard }) {
  const isComplete = card.type === 'complete';

  return (
    <div className="border border-[hsl(var(--snug-border))] rounded-2xl overflow-hidden">
      <div className="flex gap-3 p-3">
        {/* Room Image */}
        <div className="w-[100px] h-[80px] rounded-lg overflow-hidden bg-[hsl(var(--snug-light-gray))] flex-shrink-0 flex items-center justify-center">
          <span className="text-xs text-[hsl(var(--snug-gray))]">Room</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <span className="inline-block px-2 py-0.5 text-xs text-[hsl(var(--snug-orange))] bg-[hsl(var(--snug-orange))]/10 rounded mb-1">
            Payment Req.
          </span>
          <p className="text-xs text-[hsl(var(--snug-gray))]">{card.propertyName}</p>
          <p className="text-sm font-semibold text-[hsl(var(--snug-text-primary))]">
            {card.roomName}
          </p>
          <p className="text-xs text-[hsl(var(--snug-gray))] mt-0.5">
            {card.checkIn} - {card.checkOut} ({card.duration})
          </p>
          <p className="text-xs text-[hsl(var(--snug-gray))]">
            {card.guests} guests | {card.price}
          </p>
        </div>
      </div>

      {/* Action Button */}
      <div className="px-3 pb-3">
        <button
          type="button"
          disabled={isComplete}
          className={`w-full py-2.5 text-sm font-medium rounded-full transition-colors ${
            isComplete
              ? 'bg-[hsl(var(--snug-gray))] text-white cursor-not-allowed'
              : 'bg-[hsl(var(--snug-orange))] text-white hover:opacity-90'
          }`}
        >
          {isComplete ? 'Payment Complete' : 'Request Payment'}
        </button>
      </div>
    </div>
  );
}
