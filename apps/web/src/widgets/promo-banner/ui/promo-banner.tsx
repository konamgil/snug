'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Link } from '@/i18n/navigation';

const STORAGE_KEY = 'snug_promo_banner_hidden';

export function PromoBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if banner was closed
    const isHidden = localStorage.getItem(STORAGE_KEY);
    if (!isHidden) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <Link href="/login" className="block md:hidden">
      <div className="relative bg-[#f2f2f2] h-14 flex items-center px-5">
        {/* Left Content */}
        <div className="flex flex-col">
          <p className="font-bold text-xs text-[#525252] tracking-tight leading-normal">
            SNUG Pre-Open begins Dec 31 —
          </p>
          <p className="text-xs text-[#525252] tracking-tight leading-normal">
            Sign up to get ready to book.
          </p>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-[15px] size-8 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors"
          aria-label="Close banner"
        >
          <X className="size-3.5 text-[#161616]" />
        </button>
      </div>
    </Link>
  );
}
