'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useAuthStore } from '@/shared/stores';

const STORAGE_KEY = 'snug_promo_banner_hidden';

export function PromoBanner() {
  const [isVisible, setIsVisible] = useState(() => {
    // SSR에서는 false, 클라이언트에서 localStorage 확인
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem(STORAGE_KEY);
  });
  const { user } = useAuthStore();

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  // 로그인 되어 있으면 /map (강남 중심), 아니면 /mypage (로그인 화면)
  const href = user ? '/map?lat=37.507387&lng=127.033762' : '/mypage';

  return (
    <Link href={href} className="block md:hidden">
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
