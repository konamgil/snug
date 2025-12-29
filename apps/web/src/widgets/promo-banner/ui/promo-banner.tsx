'use client';

import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Link } from '@/i18n/navigation';

const STORAGE_KEY = 'snug_promo_banner_hidden_until';

export function PromoBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    // Check if banner should be hidden
    const hiddenUntil = localStorage.getItem(STORAGE_KEY);
    if (hiddenUntil) {
      const hiddenDate = new Date(hiddenUntil);
      if (hiddenDate > new Date()) {
        return; // Still hidden
      }
      localStorage.removeItem(STORAGE_KEY);
    }
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    if (dontShowAgain) {
      // Hide until end of today
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      localStorage.setItem(STORAGE_KEY, tomorrow.toISOString());
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div>
      {/* Banner */}
      <div className="relative bg-[#f2f2f2] h-14 flex items-center justify-center px-4 md:px-6">
        {/* Center Content */}
        <div className="flex flex-col items-center">
          <p className="font-bold text-base text-[#161616] tracking-tight">
            SNUG Pre-Open starts Dec 31
          </p>
          <p className="text-xs text-[#525252] tracking-tight">
            Explore stays and get ready to book.
          </p>
        </div>

        {/* Sign Up Button - Desktop only */}
        <Link
          href="/signup"
          className="hidden md:flex absolute right-6 border border-[#ff7900] text-[#ff7900] px-4 py-2 rounded-full text-xs font-bold hover:bg-[#ff7900] hover:text-white transition-colors"
        >
          Sign Up
        </Link>
      </div>

      {/* Controls below banner */}
      <div className="flex items-center justify-end px-4 md:px-6 py-1">
        <label className="flex items-center gap-1 cursor-pointer">
          <button
            type="button"
            onClick={() => setDontShowAgain(!dontShowAgain)}
            className={`size-5 border rounded flex items-center justify-center transition-colors ${
              dontShowAgain ? 'bg-[#525252] border-[#525252]' : 'border-[#525252] bg-transparent'
            }`}
            aria-label="Don't show this again today"
          >
            {dontShowAgain && <Check className="size-3 text-white" strokeWidth={3} />}
          </button>
          <span className="text-xs text-[#6f6f6f]">Don&apos;t show this again today</span>
        </label>
        <button
          type="button"
          onClick={handleClose}
          className="p-2 hover:bg-black/5 rounded-full transition-colors"
          aria-label="Close banner"
        >
          <X className="size-3.5 text-[#161616]" />
        </button>
      </div>
    </div>
  );
}
