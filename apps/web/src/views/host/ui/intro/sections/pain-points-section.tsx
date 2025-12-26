'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { PainPointsBuildingIcon, BubbleTailIcon } from '@/shared/ui/icons';
import { AnimateOnScroll } from '@/shared/ui/animation';

export function PainPointsSection() {
  const t = useTranslations('hostIntro.painPoints');

  return (
    <section className="relative pt-16 md:pt-24 pb-32 md:pb-40 bg-white">
      <div className="max-w-[1312px] mx-auto px-5 md:px-8">
        {/* Section Heading */}
        <AnimateOnScroll variant="fadeUp" className="text-center mb-12 md:mb-16">
          {/* Building icon */}
          <div className="flex items-center justify-center mb-4">
            <PainPointsBuildingIcon />
          </div>
          <h2 className="text-2xl md:text-[32px] font-medium leading-tight text-[hsl(var(--snug-text-primary))]">
            <span className="text-[#EF8BAC] font-bold">{t('title.highlight1')}</span>
            {t('title.text1')}
            <span className="text-[#EF8BAC] font-bold">{t('title.highlight2')}</span>
            {t('title.text2')}
            <br />
            {t('title.prefix3')}
            <span className="text-[#EF8BAC] font-bold">{t('title.highlight3')}</span>
            {t('title.text3')}
          </h2>
        </AnimateOnScroll>

        {/* Illustrations with Speech Bubbles */}
        {/* Mobile: Vertical stack (< 768px) */}
        <div className="flex flex-col items-center gap-12 md:hidden">
          {/* Pink Bubble + Man (first on mobile) */}
          <div className="relative w-full max-w-[340px]">
            <div className="relative bg-white rounded-2xl border-2 border-[#EF8BAC] p-4 mb-4">
              <p className="text-[#EF8BAC] font-bold text-sm leading-[1.4] tracking-[-0.5px] mb-1">
                {t('bubbles.0.headline')}
              </p>
              <p className="text-[hsl(var(--snug-text-primary))] text-sm leading-[1.4] tracking-[-0.5px] whitespace-pre-line">
                {t('bubbles.0.body')}
              </p>
              <div className="absolute -bottom-[14px] right-[30%]">
                <BubbleTailIcon color="#EF8BAC" />
              </div>
            </div>
            <Image
              src="/images/host-intro/pain-point-2.webp"
              alt="Person at desk looking worried"
              width={340}
              height={410}
              className="w-full object-contain"
            />
          </div>

          {/* Orange Bubble + Woman (second on mobile) */}
          <div className="relative w-full max-w-[320px]">
            <div className="relative bg-white rounded-2xl border-2 border-[#FF8200] p-4 mb-4">
              <p className="text-[#FF8200] font-bold text-sm leading-[1.4] tracking-[-0.5px] mb-1">
                {t('bubbles.1.headline')}
              </p>
              <p className="text-[hsl(var(--snug-text-primary))] text-sm leading-[1.4] tracking-[-0.5px] whitespace-pre-line">
                {t('bubbles.1.body')}
              </p>
              <div className="absolute -bottom-[14px] left-[30%]">
                <BubbleTailIcon color="#FF8200" />
              </div>
            </div>
            <Image
              src="/images/host-intro/pain-point-1.webp"
              alt="Person working late at night"
              width={320}
              height={343}
              className="w-full object-contain"
            />
          </div>
        </div>

        {/* Tablet: Side by side smaller (768px - 1024px) */}
        <div className="hidden md:flex lg:hidden justify-center items-end">
          {/* Left Group: Woman + Orange Bubble */}
          <div className="relative w-[45%] self-end translate-y-[80px]">
            {/* Orange Speech Bubble */}
            <div className="absolute bottom-[88%] left-0 z-10 w-[280px]">
              <div className="relative bg-white rounded-2xl border-2 border-[#FF8200] p-4">
                <p className="text-[#FF8200] font-bold text-sm leading-[1.4] tracking-[-0.5px] mb-1">
                  {t('bubbles.1.headline')}
                </p>
                <p className="text-[hsl(var(--snug-text-primary))] text-sm leading-[1.4] tracking-[-0.5px] whitespace-pre-line">
                  {t('bubbles.1.body')}
                </p>
                <div className="absolute -bottom-[14px] right-[20%]">
                  <BubbleTailIcon color="#FF8200" />
                </div>
              </div>
            </div>
            <Image
              src="/images/host-intro/pain-point-1.webp"
              alt="Person working late at night"
              width={350}
              height={375}
              className="w-full h-[320px] object-contain"
            />
          </div>

          {/* Right Group: Man + Pink Bubble */}
          <div className="relative w-[50%] self-end -ml-[3%] mt-[60px]">
            {/* Pink Speech Bubble */}
            <div className="absolute bottom-[90%] right-0 z-10 w-[300px]">
              <div className="relative bg-white rounded-2xl border-2 border-[#EF8BAC] p-4">
                <p className="text-[#EF8BAC] font-bold text-sm leading-[1.4] tracking-[-0.5px] mb-1">
                  {t('bubbles.0.headline')}
                </p>
                <p className="text-[hsl(var(--snug-text-primary))] text-sm leading-[1.4] tracking-[-0.5px] whitespace-pre-line">
                  {t('bubbles.0.body')}
                </p>
                <div className="absolute -bottom-[14px] left-[20%]">
                  <BubbleTailIcon color="#EF8BAC" />
                </div>
              </div>
            </div>
            <Image
              src="/images/host-intro/pain-point-2.webp"
              alt="Person at desk looking worried"
              width={380}
              height={458}
              className="w-full h-[380px] object-contain"
            />
          </div>
        </div>

        {/* Desktop: Side by side full (>= 1024px) */}
        <div className="hidden lg:flex justify-center items-end">
          {/* Left Group: Woman + Orange Bubble */}
          <AnimateOnScroll
            variant="slideRight"
            delay={0.1}
            className="relative w-auto self-end translate-y-[130px]"
          >
            {/* Orange Speech Bubble - positioned above woman */}
            <div className="absolute bottom-[90%] -left-[10%] z-10 w-[374px]">
              <div className="relative bg-white rounded-2xl border-2 border-[#FF8200] p-5">
                <p className="text-[#FF8200] font-bold text-base leading-[1.4] tracking-[-0.5px] mb-1">
                  {t('bubbles.1.headline')}
                </p>
                <p className="text-[hsl(var(--snug-text-primary))] text-base leading-[1.4] tracking-[-0.5px] whitespace-pre-line">
                  {t('bubbles.1.body')}
                </p>
                {/* Bubble tail - pointing toward woman's head */}
                <div className="absolute -bottom-[14px] right-[20%]">
                  <BubbleTailIcon color="#FF8200" />
                </div>
              </div>
            </div>
            {/* Woman Illustration */}
            <Image
              src="/images/host-intro/pain-point-1.webp"
              alt="Person working late at night"
              width={469}
              height={502}
              className="h-[500px] object-contain"
            />
          </AnimateOnScroll>

          {/* Right Group: Man + Pink Bubble */}
          <AnimateOnScroll
            variant="slideLeft"
            delay={0.2}
            className="relative w-auto self-end -ml-[5%] mt-[100px]"
          >
            {/* Pink Speech Bubble - positioned above man */}
            <div className="absolute bottom-[95%] right-0 z-10 w-[408px]">
              <div className="relative bg-white rounded-2xl border-2 border-[#EF8BAC] p-5">
                <p className="text-[#EF8BAC] font-bold text-base leading-[1.4] tracking-[-0.5px] mb-1">
                  {t('bubbles.0.headline')}
                </p>
                <p className="text-[hsl(var(--snug-text-primary))] text-base leading-[1.4] tracking-[-0.5px] whitespace-pre-line">
                  {t('bubbles.0.body')}
                </p>
                {/* Bubble tail - pointing toward man's head */}
                <div className="absolute -bottom-[14px] left-[20%]">
                  <BubbleTailIcon color="#EF8BAC" />
                </div>
              </div>
            </div>
            {/* Man Illustration */}
            <Image
              src="/images/host-intro/pain-point-2.webp"
              alt="Person at desk looking worried"
              width={469}
              height={566}
              className="h-[566px] object-contain"
            />
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}
