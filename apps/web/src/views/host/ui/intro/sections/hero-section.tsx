'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

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
    <section className="relative min-h-[708px] overflow-hidden bg-white">
      {/* Background Illustration - Combined SVG */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="relative max-w-[1312px] mx-auto px-5 md:px-8 h-full flex items-end justify-center">
          <div className="w-full h-[55%] md:h-[70%] lg:h-[85%] bg-[url('/images/host-intro/hero-combined.svg')] bg-contain bg-center bg-no-repeat" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-30 max-w-[1312px] mx-auto px-5 md:px-8 h-full">
        <div className="flex flex-col justify-center h-full pt-20 pb-[300px] md:pb-[350px] lg:pb-20">
          {/* Speech bubble icons */}
          <div className="flex items-center gap-1 mb-4">
            <svg
              width="20"
              height="25"
              viewBox="0 0 20 25"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="transition-all duration-300"
            >
              <path
                d="M17.938 3.74098C15.9917 1.18444 13.1349 0.179289 10.431 0.0206368C7.21447 -0.166765 3.99173 0.90547 1.75504 3.922C0.393798 5.75874 0.0640827 7.73072 0 10.0573C0 16.3022 5.43256 18.7033 8.99121 18.9471C10.5209 19.0515 10.801 18.9386 11.5742 18.8758C11.5742 18.8758 10.1075 20.0492 8.85995 20.9415C8.40103 21.2694 7.95659 21.8188 8.42171 22.6132C8.72041 23.1232 9.36744 24.1092 9.68372 24.6075C10.0062 25.1165 10.8351 25.1782 11.5463 24.5117C13.4884 22.6898 14.616 21.4707 16.0641 19.7521C17.6879 17.827 18.9871 15.9711 19.7209 12.5009C20.2295 10.0967 20.2625 6.79371 17.939 3.74098H17.938Z"
                fill={slides[currentSlide]?.color ?? '#FF8200'}
              />
            </svg>
            <svg
              width="20"
              height="25"
              viewBox="0 0 20 25"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="transition-all duration-300"
            >
              <path
                d="M17.938 3.74098C15.9917 1.18444 13.1349 0.179289 10.431 0.0206368C7.21447 -0.166765 3.99173 0.90547 1.75504 3.922C0.393798 5.75874 0.0640827 7.73072 0 10.0573C0 16.3022 5.43256 18.7033 8.99121 18.9471C10.5209 19.0515 10.801 18.9386 11.5742 18.8758C11.5742 18.8758 10.1075 20.0492 8.85995 20.9415C8.40103 21.2694 7.95659 21.8188 8.42171 22.6132C8.72041 23.1232 9.36744 24.1092 9.68372 24.6075C10.0062 25.1165 10.8351 25.1782 11.5463 24.5117C13.4884 22.6898 14.616 21.4707 16.0641 19.7521C17.6879 17.827 18.9871 15.9711 19.7209 12.5009C20.2295 10.0967 20.2625 6.79371 17.939 3.74098H17.938Z"
                fill={slides[currentSlide]?.color ?? '#FF8200'}
              />
            </svg>
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

          {/* Description */}
          <p className="text-sm md:text-base text-[hsl(var(--snug-gray))] max-w-[400px] mb-8 transition-all duration-300">
            {slides[currentSlide]?.description ?? ''}
          </p>

          {/* CTA Button */}
          <Link
            href="/host"
            className={`inline-flex items-center justify-center w-fit px-6 py-3 text-white text-sm font-medium rounded-full transition-all duration-300 hover:opacity-90 ${slides[currentSlide]?.bgColor ?? 'bg-[#FF8200]'}`}
          >
            {t('cta')}
          </Link>
        </div>
      </div>
    </section>
  );
}
