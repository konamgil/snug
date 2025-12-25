'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { Heart } from 'lucide-react';

export function CtaSection() {
  const t = useTranslations('hostIntro.cta');

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-[1312px] mx-auto px-5 md:px-8">
        {/* Top Text */}
        <div className="text-center mb-8">
          <h2 className="text-[hsl(var(--snug-text-primary))] text-[1.75rem] font-medium">
            {t('titlePrefix')}
            <span className="text-[#FF6700]">{t('titleHighlight')}</span>
            {t('titleSuffix')}
          </h2>
        </div>

        {/* Welcome Snug Logo */}
        <div className="flex items-center justify-center mb-12">
          <Image
            src="/images/logo/logo-welcome-snug.svg"
            alt="Welcome Snug"
            width={596}
            height={80}
            className="h-auto w-[37.22606rem]"
          />
        </div>

        {/* Illustration Container */}
        <div className="relative max-w-[814px] mx-auto mb-12">
          <div className="relative aspect-[2/1] rounded-[2rem] overflow-hidden border-2 border-[#E5E5E5] bg-gradient-to-br from-amber-50 to-orange-50">
            {/* Background illustration */}
            <Image
              src="/images/host-intro/cta-main.svg"
              alt="Welcome to Snug hosting"
              fill
              className="object-contain object-center"
            />

            {/* Decorative elements */}
            <div className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center z-10">
              <Heart className="w-8 h-8 text-[hsl(var(--snug-orange))]" fill="currentColor" />
            </div>

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center">
          <Link
            href="/host"
            className="inline-flex items-center justify-center px-8 py-4 bg-[hsl(var(--snug-orange))] text-white text-lg font-semibold rounded-full hover:bg-[hsl(var(--snug-orange))]/90 transition-colors shadow-lg shadow-[hsl(var(--snug-orange))]/30"
          >
            {t('button')}
          </Link>
        </div>
      </div>
    </section>
  );
}
