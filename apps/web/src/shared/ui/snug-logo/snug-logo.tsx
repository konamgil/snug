'use client';

import Image from 'next/image';
import { useEasterEgg } from '@/shared/lib/easter-egg-context';

interface SnugLogoProps {
  className?: string;
}

export function SnugLogo({ className }: SnugLogoProps) {
  const { incrementClick, clickCount, isEasterEggActive } = useEasterEgg();

  const handleClick = () => {
    if (!isEasterEggActive) {
      incrementClick();
      // Show hint after 5 clicks
      if (clickCount === 4) {
        console.log('%c Almost there... keep clicking! 👀', 'color: #ff7900;');
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`cursor-default transition-transform active:scale-95 ${className ?? ''}`}
      aria-label="hello.snug. logo"
    >
      <Image
        src="/images/logo/logo_hellosnug.svg"
        alt="hello.snug."
        width={173}
        height={32}
        className="h-8 w-auto"
        priority
      />
    </button>
  );
}
