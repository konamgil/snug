'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Image from 'next/image';

interface NavigationLoadingContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  navigateWithLoading: (loadData: () => Promise<void>, navigate: () => void) => Promise<void>;
}

const NavigationLoadingContext = createContext<NavigationLoadingContextType | null>(null);

export function useNavigationLoading() {
  const context = useContext(NavigationLoadingContext);
  if (!context) {
    throw new Error('useNavigationLoading must be used within NavigationLoadingProvider');
  }
  return context;
}

interface NavigationLoadingProviderProps {
  children: ReactNode;
}

export function NavigationLoadingProvider({ children }: NavigationLoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  const startLoading = useCallback(() => {
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  // 데이터 로드 후 네비게이션
  const navigateWithLoading = useCallback(
    async (loadData: () => Promise<void>, navigate: () => void) => {
      setIsLoading(true);
      try {
        await loadData();
        navigate();
      } catch (error) {
        console.error('Navigation loading failed:', error);
        setIsLoading(false);
      }
    },
    [],
  );

  // pathname이 변경되면 약간의 지연 후 로딩 종료 (페이지 렌더링 대기)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 100); // 100ms 지연으로 페이지 렌더링 대기
    return () => clearTimeout(timeout);
  }, [pathname]);

  // 안전장치: 5초 후 자동 종료
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  return (
    <NavigationLoadingContext.Provider
      value={{ isLoading, startLoading, stopLoading, navigateWithLoading }}
    >
      {children}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 backdrop-blur-sm"
            aria-busy="true"
            role="status"
            aria-label="Loading"
          >
            {prefersReducedMotion ? (
              <Image
                src="/images/logo/favicon.svg"
                alt=""
                width={80}
                height={97}
                priority
                aria-hidden="true"
              />
            ) : (
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.85, 1, 0.85],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Image
                  src="/images/logo/favicon.svg"
                  alt=""
                  width={80}
                  height={97}
                  priority
                  aria-hidden="true"
                />
              </motion.div>
            )}
            <span className="sr-only">Loading...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </NavigationLoadingContext.Provider>
  );
}
