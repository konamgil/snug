'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface EasterEggContextType {
  isEasterEggActive: boolean;
  clickCount: number;
  incrementClick: () => void;
  resetEasterEgg: () => void;
}

const EasterEggContext = createContext<EasterEggContextType | null>(null);

const CLICK_THRESHOLD = 10;

export function EasterEggProvider({ children }: { children: ReactNode }) {
  const [clickCount, setClickCount] = useState(0);
  const [isEasterEggActive, setIsEasterEggActive] = useState(false);

  const incrementClick = useCallback(() => {
    setClickCount((prev) => {
      const newCount = prev + 1;
      if (newCount >= CLICK_THRESHOLD && !isEasterEggActive) {
        setIsEasterEggActive(true);
        // Fun console message for easter egg discovery - intentional
        if (process.env.NODE_ENV === 'development') {
          // nosemgrep: no-console-log
          console.log(
            '%c🎉 Easter Egg Activated! %c The illustration is now alive!',
            'background: #ff7900; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;',
            'color: #ff7900; font-weight: bold;',
          );
        }
      }
      return newCount;
    });
  }, [isEasterEggActive]);

  const resetEasterEgg = useCallback(() => {
    setClickCount(0);
    setIsEasterEggActive(false);
  }, []);

  return (
    <EasterEggContext.Provider
      value={{ isEasterEggActive, clickCount, incrementClick, resetEasterEgg }}
    >
      {children}
    </EasterEggContext.Provider>
  );
}

export function useEasterEgg() {
  const context = useContext(EasterEggContext);
  if (!context) {
    throw new Error('useEasterEgg must be used within an EasterEggProvider');
  }
  return context;
}
