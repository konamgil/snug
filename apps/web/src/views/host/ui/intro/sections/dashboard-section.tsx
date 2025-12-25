'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { SpeechBubbleIcon } from '@/shared/ui/icons';
import { AnimateOnScroll } from '@/shared/ui/animation';

export function DashboardSection() {
  const t = useTranslations('hostIntro.dashboard');

  return (
    <section className="pt-12 md:pt-16 pb-24 md:pb-40 bg-white">
      <div className="max-w-[1312px] mx-auto px-5 md:px-8">
        {/* Section Heading */}
        <AnimateOnScroll variant="fadeUp" className="text-center mb-40 md:mb-52">
          {/* Speech bubble icon */}
          <div className="flex items-center justify-center mb-4">
            <SpeechBubbleIcon />
          </div>
          <h2 className="text-2xl md:text-[32px] font-medium leading-tight text-[hsl(var(--snug-text-primary))]">
            {t('titleLine1')}
            <br />
            <span className="text-[#FF6700] font-bold">{t('titleHighlight')}</span>
            {t('titleSuffix')}
          </h2>
        </AnimateOnScroll>

        {/* Dashboard Preview Container */}
        <div className="relative">
          {/* Dashboard Layout */}
          <div className="relative max-w-[1218px] mx-auto">
            {/* Sidebar Zoom Circle - Hidden on mobile */}
            <AnimateOnScroll
              variant="scale"
              delay={0.2}
              className="hidden md:block absolute -left-[10px] lg:left-[20px] top-[-25%] w-[280px] lg:w-[431px] h-[280px] lg:h-[431px] z-20"
            >
              {/* Orange dashed border */}
              <div className="absolute inset-0 rounded-full border-2 border-[#FF8200] border-dashed" />
              {/* Circle with zoomed sidebar */}
              <div className="absolute inset-[8px] rounded-full overflow-hidden bg-white">
                <div className="relative w-[280%] h-[280%] translate-x-[7%] translate-y-[4%]">
                  <Image
                    src="/images/host-intro/dashboard-preview.png"
                    alt="Dashboard Sidebar Zoom"
                    width={1218}
                    height={945}
                    className="w-full h-auto"
                  />
                </div>
              </div>
              {/* Zoom description text */}
              <div className="absolute left-[100%] lg:left-[105%] top-[10%] whitespace-nowrap">
                <p className="text-[#FF8200] mb-1 text-xl font-bold">{t('dashboardLabel')}</p>
                <p className="text-[hsl(var(--snug-text-primary))] leading-tight text-[1.625rem] font-medium">
                  {t('zoomDescriptionLine1')}
                  <br />
                  {t('zoomDescriptionLine2')}
                </p>
              </div>
            </AnimateOnScroll>

            {/* Dashboard Screenshot */}
            <AnimateOnScroll
              variant="fadeUp"
              delay={0.1}
              className="relative z-10 max-w-[950px] mx-auto"
            >
              <Image
                src="/images/host-intro/dashboard-preview.png"
                alt="Snug Host Dashboard Preview"
                width={1218}
                height={945}
                className="w-full h-auto"
                priority
              />
            </AnimateOnScroll>
          </div>

          {/* Description */}
          <AnimateOnScroll variant="fadeUp" delay={0.3}>
            <p className="text-center text-sm md:text-base text-[#A8A8A8] mt-8 max-w-[625px] mx-auto leading-relaxed">
              {t('descriptionLine1')}
              <br />
              {t('descriptionLine2')}
            </p>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}
