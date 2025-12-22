'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { ChatList } from './chat-list';
import { ChatDetail } from './chat-detail';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  // Prevent body scroll when modal is open and reset state when closed
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
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
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} aria-hidden="true" />

      {/* Modal */}
      <div className="fixed top-16 right-4 w-[380px] h-[calc(100vh-100px)] max-h-[700px] bg-white rounded-2xl shadow-xl z-50 flex flex-col overflow-hidden">
        {/* Close Button - only show on list view */}
        {!selectedChatId && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 hover:bg-[hsl(var(--snug-light-gray))] rounded-full transition-colors z-10"
            aria-label="Close chat"
          >
            <X className="w-5 h-5 text-[hsl(var(--snug-gray))]" />
          </button>
        )}

        {/* Content */}
        {selectedChatId ? (
          <ChatDetail chatId={selectedChatId} onBack={handleBack} />
        ) : (
          <ChatList onChatSelect={handleChatSelect} />
        )}
      </div>
    </>
  );
}
