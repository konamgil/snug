'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Star, Globe, MoreVertical } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'guest' | 'host';
  originalText: string;
  translatedText: string;
  time: string;
  isRead: boolean;
}

interface InquiryChatViewProps {
  guestName: string;
  onClose: () => void;
}

// Mock chat messages
const mockMessages: ChatMessage[] = [
  {
    id: '1',
    sender: 'guest',
    originalText: 'I just arrived safely. Can I have an extra pillow?',
    translatedText: '방금 안전하게 도착했습니다. 베개를 하나 더 받을 수 있을까요?',
    time: '오전 6:30',
    isRead: true,
  },
  {
    id: '2',
    sender: 'host',
    originalText: '네, 베딩팀과 확인해서 준비하겠습니다.',
    translatedText: '',
    time: '오전 6:30',
    isRead: true,
  },
  {
    id: '3',
    sender: 'host',
    originalText: '오늘 오전 10시까지 준비해드려도 될까요?',
    translatedText: '',
    time: '오전 6:34',
    isRead: true,
  },
  {
    id: '4',
    sender: 'guest',
    originalText: "Yes, that's fine.",
    translatedText: '네, 좋습니다.',
    time: '오전 6:38',
    isRead: true,
  },
  {
    id: '5',
    sender: 'guest',
    originalText: 'And can I get an extra blanket?',
    translatedText: '그리고 이불도 하나 더 받을 수 있을까요?',
    time: '오전 7:12',
    isRead: true,
  },
  {
    id: '6',
    sender: 'host',
    originalText: '네, 오늘 오전 10시까지 함께 준비하겠습니다.',
    translatedText: '',
    time: '오전 7:14',
    isRead: true,
  },
];

// Checkbox Component
function MessageCheckbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
        checked
          ? 'bg-[hsl(var(--snug-orange))] border-[hsl(var(--snug-orange))]'
          : 'border-[#a8a8a8] bg-white hover:bg-[#f4f4f4]'
      }`}
    >
      {checked && (
        <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
          <path
            d="M10 3L4.5 8.5L2 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}

// Guest Avatar Component
function GuestAvatar() {
  return (
    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
      <span className="text-white text-sm font-medium">E</span>
    </div>
  );
}

// Host Avatar Component
function HostAvatar() {
  return (
    <div className="w-11 h-11 rounded-full bg-[hsl(var(--snug-orange))] flex items-center justify-center">
      <span className="text-white text-xs font-bold">snug.</span>
    </div>
  );
}

// Guest Message Bubble
function GuestMessage({
  message,
  isSelected,
  onSelect,
  showCheckbox,
  readLabel,
}: {
  message: ChatMessage;
  isSelected: boolean;
  onSelect: () => void;
  showCheckbox: boolean;
  readLabel: string;
}) {
  return (
    <div className="flex items-start gap-2">
      {showCheckbox && (
        <div className="pt-2">
          <MessageCheckbox checked={isSelected} onChange={onSelect} />
        </div>
      )}
      <div className="flex items-start gap-2 flex-1">
        <GuestAvatar />
        <div className="flex-1">
          <div className="bg-[#f4f4f4] rounded-lg px-3 py-2 max-w-[280px]">
            <p className="text-xs text-[#161616]">{message.originalText}</p>
            {message.translatedText && (
              <>
                <div className="border-t border-[#e0e0e0] my-2" />
                <p className="text-xs text-[#525252]">{message.translatedText}</p>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 mt-1 ml-1">
            <span className="text-[10px] text-[#a8a8a8]">{readLabel}</span>
            <span className="text-[10px] text-[#a8a8a8]">{message.time}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Host Message Bubble
function HostMessage({
  message,
  isSelected,
  onSelect,
  showCheckbox,
  readLabel,
}: {
  message: ChatMessage;
  isSelected: boolean;
  onSelect: () => void;
  showCheckbox: boolean;
  readLabel: string;
}) {
  return (
    <div className="flex items-start gap-2 justify-end">
      <div className="flex items-start gap-2">
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1 mb-1 mr-1">
            <span className="text-[10px] text-[#a8a8a8]">{readLabel}</span>
            <span className="text-[10px] text-[#a8a8a8]">{message.time}</span>
          </div>
          <div className="bg-[#f4f4f4] rounded-lg px-3 py-2 max-w-[280px]">
            <p className="text-xs text-[#161616]">{message.originalText}</p>
          </div>
        </div>
        <HostAvatar />
      </div>
      {showCheckbox && (
        <div className="pt-2">
          <MessageCheckbox checked={isSelected} onChange={onSelect} />
        </div>
      )}
    </div>
  );
}

export function InquiryChatView({ guestName, onClose }: InquiryChatViewProps) {
  const t = useTranslations('host.operations.chat');
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [isSelectionMode] = useState(true);

  const handleToggleMessage = (id: string) => {
    setSelectedMessages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleCancel = () => {
    setSelectedMessages(new Set());
    onClose();
  };

  const handleComplete = () => {
    // Handle completion with selected messages
    console.log('Selected messages:', Array.from(selectedMessages));
    onClose();
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#e0e0e0]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GuestAvatar />
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-black">{guestName}</span>
              <Star className="w-4 h-4 text-[#a8a8a8]" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="p-2 hover:bg-[#f4f4f4] rounded-lg transition-colors">
              <Globe className="w-5 h-5 text-[#161616]" />
            </button>
            <button type="button" className="p-2 hover:bg-[#f4f4f4] rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5 text-[#161616]" />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-auto px-5 py-4">
        {/* AI Notice */}
        <div className="flex justify-center mb-6">
          <div className="bg-[#f4f4f4] rounded-full px-3 py-1.5">
            <p className="text-[10px] text-[#525252]">{t('aiNotice')}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-4">
          {mockMessages.map((message) =>
            message.sender === 'guest' ? (
              <GuestMessage
                key={message.id}
                message={message}
                isSelected={selectedMessages.has(message.id)}
                onSelect={() => handleToggleMessage(message.id)}
                showCheckbox={isSelectionMode}
                readLabel={t('read')}
              />
            ) : (
              <HostMessage
                key={message.id}
                message={message}
                isSelected={selectedMessages.has(message.id)}
                onSelect={() => handleToggleMessage(message.id)}
                showCheckbox={isSelectionMode}
                readLabel={t('read')}
              />
            ),
          )}
        </div>
      </div>

      {/* Footer - Selection Mode */}
      {isSelectionMode && (
        <div className="px-5 py-4 border-t border-[#e0e0e0]">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#525252]">{t('selectionPrompt')}</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-[#e0e0e0] rounded text-xs text-[#161616] hover:bg-[#f4f4f4] transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleComplete}
                className="px-6 py-2 bg-[hsl(var(--snug-orange))] rounded text-xs text-white hover:bg-[hsl(var(--snug-orange))]/90 transition-colors"
              >
                {t('complete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
