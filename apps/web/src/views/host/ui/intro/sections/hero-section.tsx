'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { SpeechBubbleIcon } from '@/shared/ui/icons';
import { AnimateOnScroll } from '@/shared/ui/animation';

interface Slide {
  keyword: string;
  color: string; // hex color for SVG fill
  textColor: string; // tailwind class for text
  bgColor: string; // tailwind class for button bg
  description: string;
}

export function HeroSection() {
  const t = useTranslations('hostIntro.hero');
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: Slide[] = [
    {
      keyword: t('slides.0.keyword'),
      color: '#FF8200', // orange
      textColor: 'text-[#FF8200]',
      bgColor: 'bg-[#FF8200]',
      description: t('slides.0.description'),
    },
    {
      keyword: t('slides.1.keyword'),
      color: '#EF8BAC', // pink rgba(239, 139, 172, 1)
      textColor: 'text-[#EF8BAC]',
      bgColor: 'bg-[#EF8BAC]',
      description: t('slides.1.description'),
    },
    {
      keyword: t('slides.2.keyword'),
      color: '#763225', // brown rgba(118, 50, 37, 1)
      textColor: 'text-[#763225]',
      bgColor: 'bg-[#763225]',
      description: t('slides.2.description'),
    },
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <section className="relative md:min-h-[708px] overflow-hidden bg-white">
      {/* Background Illustration - Desktop */}
      <div className="hidden md:block absolute inset-0 pointer-events-none">
        <div className="relative max-w-[1312px] mx-auto px-5 md:px-8 h-full flex items-end justify-center">
          <AnimateOnScroll
            variant="fadeIn"
            delay={0.2}
            className="w-full h-[80%] lg:h-[95%] translate-y-[10%] bg-[url('/images/host-intro/hero-combined.svg')] bg-contain bg-bottom bg-no-repeat"
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-30 max-w-[1312px] mx-auto px-5 md:px-8">
        <AnimateOnScroll
          variant="fadeUp"
          className="flex flex-col justify-center pt-4 md:pt-20 pb-8 md:pb-[350px] lg:pb-20"
        >
          {/* Speech bubble icons */}
          <div className="flex items-center gap-1 mb-4">
            <SpeechBubbleIcon
              color={slides[currentSlide]?.color ?? '#FF8200'}
              className="transition-all duration-300"
            />
            <SpeechBubbleIcon
              color={slides[currentSlide]?.color ?? '#FF8200'}
              className="transition-all duration-300"
            />
          </div>

          {/* Title with animated keyword */}
          <div className="mb-4">
            <h1 className="text-[32px] md:text-[43px] font-bold leading-tight text-[hsl(var(--snug-text-primary))]">
              {t('titlePrefix')}{' '}
              <span className="inline-flex items-center">
                [
                <span
                  className={`mx-1 ${slides[currentSlide]?.textColor ?? ''} transition-all duration-300`}
                >
                  {slides[currentSlide]?.keyword ?? ''}
                </span>
                ]
              </span>{' '}
              {t('titleSuffix')}
            </h1>
          </div>

          {/* Description - fixed height to prevent button position shift */}
          <p className="text-sm md:text-base text-[hsl(var(--snug-gray))] max-w-[400px] min-h-[48px] md:min-h-[56px] mb-8 whitespace-pre-line transition-all duration-300">
            {slides[currentSlide]?.description ?? ''}
          </p>

          {/* CTA Button */}
          <Link
            href="/host"
            className={`inline-flex items-center justify-center w-full md:w-fit px-6 py-3.5 md:py-3 text-white text-base md:text-sm font-medium rounded-full transition-all duration-300 hover:opacity-90 ${slides[currentSlide]?.bgColor ?? 'bg-[#FF8200]'}`}
          >
            {t('cta')}
          </Link>
        </AnimateOnScroll>
      </div>

      {/* Mobile Illustration - Below content */}
      <AnimateOnScroll variant="fadeIn" delay={0.2} className="md:hidden w-full">
        <Image
          src="/images/host-intro/hero-mobile.svg"
          alt="Hero illustration"
          width={390}
          height={915}
          className="w-full h-auto"
          priority
        />
      </AnimateOnScroll>
    </section>
  );
}
