'use client';

import { useEffect, useState } from 'react';
import { ChatList } from './chat-list';
import { ChatDetail } from './chat-detail';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  // Reset state when closed
  useEffect(() => {
    return () => {
      setSelectedChatId(null);
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (selectedChatId) {
          setSelectedChatId(null);
        } else {
          onClose();
        }
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, selectedChatId, onClose]);

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  const handleBack = () => {
    setSelectedChatId(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-16 right-4 w-[380px] h-[calc(100vh-100px)] max-h-[700px] bg-white rounded-2xl shadow-xl border border-[hsl(var(--snug-border))] z-50 flex flex-col overflow-hidden">
      {/* Content */}
      {selectedChatId ? (
        <ChatDetail chatId={selectedChatId} onBack={handleBack} />
      ) : (
        <ChatList onChatSelect={handleChatSelect} />
      )}
    </div>
  );
}
