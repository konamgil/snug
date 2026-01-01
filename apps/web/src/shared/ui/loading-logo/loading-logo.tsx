'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';

interface LoadingLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'pulse' | 'bounce';
  className?: string;
}

const sizeMap = { sm: 48, md: 64, lg: 80 };
const ASPECT_RATIO = 504 / 416; // favicon.svg 원본 비율

export function LoadingLogo({ size = 'md', variant = 'pulse', className = '' }: LoadingLogoProps) {
  const prefersReducedMotion = useReducedMotion();
  const logoWidth = sizeMap[size];
  const logoHeight = Math.round(logoWidth * ASPECT_RATIO);

  // 접근성: 모션 감소 선호 시 정적 렌더링
  if (prefersReducedMotion) {
    return (
      <div className={className} role="status" aria-label="Loading">
        <Image
          src="/images/logo/favicon.svg"
          alt=""
          width={logoWidth}
          height={logoHeight}
          priority
          aria-hidden="true"
        />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  const animations = {
    pulse: {
      scale: [1, 1.15, 1],
      opacity: [0.85, 1, 0.85],
    },
    bounce: {
      y: [0, -12, 0],
      scale: [1, 1.05, 1],
    },
  };

  const transitions = {
    pulse: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const },
    bounce: { duration: 0.8, repeat: Infinity, ease: [0.36, 0, 0.66, -0.56] as const },
  };

  return (
    <motion.div
      className={className}
      role="status"
      aria-label="Loading"
      animate={animations[variant]}
      transition={transitions[variant]}
    >
      <Image
        src="/images/logo/favicon.svg"
        alt=""
        width={logoWidth}
        height={logoHeight}
        priority
        aria-hidden="true"
      />
      <span className="sr-only">Loading...</span>
    </motion.div>
  );
}
