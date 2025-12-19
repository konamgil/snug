'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Heart } from 'lucide-react';
import Image from 'next/image';

interface BannerSlide {
  id: number;
  caption: string;
}

interface HeroBannerProps {
  className?: string;
}

export function HeroBanner({ className }: HeroBannerProps) {
  const t = useTranslations('home.banner');
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: BannerSlide[] = [
    { id: 1, caption: t('slide1') },
    { id: 2, caption: t('slide2') },
    { id: 3, caption: t('slide3') },
    { id: 4, caption: t('slide4') },
    { id: 5, caption: t('slide5') },
  ];

  // Auto-rotate slides every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className={`w-full max-w-[350px] ${className ?? ''}`}>
      {/* Banner Card */}
      <div className="relative border border-[hsl(var(--snug-border))] rounded-[20px] overflow-hidden h-[170px] bg-white">
        {/* Illustration Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/banner/banner-illustration.png"
            alt="Snug coworking and living space illustration"
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        {/* Favorite Button */}
        <button
          type="button"
          className="absolute top-2 right-2 w-[18px] h-[18px] flex items-center justify-center hover:scale-110 transition-transform z-10"
          aria-label="Add to favorites"
        >
          <Heart
            className="w-4 h-4 text-white drop-shadow-sm"
            fill="white"
            strokeWidth={1}
            stroke="#D8D8D8"
          />
        </button>
      </div>

      {/* Caption Bar */}
      <div className="mt-1 mx-auto w-full">
        <div className="bg-[hsl(var(--snug-light-gray))] rounded-full py-2 px-4">
          <p className="text-[11px] font-bold text-center text-[hsl(var(--snug-text-primary))] tracking-tight">
            {slides[currentSlide]?.caption}
          </p>
        </div>
      </div>

      {/* Slide Indicator */}
      <div className="flex justify-end items-center gap-0.5 text-[9px] mt-2">
        <span className="font-bold text-black">{currentSlide + 1}</span>
        <span className="opacity-70 text-black">/</span>
        <span className="opacity-70 text-black">{slides.length}</span>
      </div>

      {/* Dot Navigation */}
      <div className="flex justify-center gap-1 mt-2">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => setCurrentSlide(index)}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              index === currentSlide
                ? 'bg-[hsl(var(--snug-orange))]'
                : 'bg-[hsl(var(--snug-border))]'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
