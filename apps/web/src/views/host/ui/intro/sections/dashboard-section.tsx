'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { SpeechBubbleIcon } from '@/shared/ui/icons';
import { AnimateOnScroll } from '@/shared/ui/animation';

export function DashboardSection() {
  const t = useTranslations('hostIntro.dashboard');
  const tOperations = useTranslations('hostIntro.operations');

  return (
    <section className="pt-12 md:pt-16 pb-24 md:pb-40 bg-white">
      <div className="max-w-[1312px] mx-auto px-5 md:px-8">
        {/* Section Heading */}
        <AnimateOnScroll variant="fadeUp" className="text-center mb-12 md:mb-52">
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

        {/* Desktop: Dashboard Preview Container */}
        <div className="hidden md:block relative">
          {/* Dashboard Layout */}
          <div className="relative max-w-[1218px] mx-auto">
            {/* Sidebar Zoom Circle */}
            <AnimateOnScroll
              variant="scale"
              delay={0.2}
              className="absolute -left-[10px] lg:left-[20px] top-[-25%] w-[280px] lg:w-[431px] h-[280px] lg:h-[431px] z-20"
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

        {/* Mobile: Two sections with iPhone mockups */}
        <div className="md:hidden space-y-20">
          {/* Dashboard Section */}
          <AnimateOnScroll variant="fadeUp">
            <div className="text-center mb-6">
              <p className="text-[#FF8200] text-lg font-bold mb-2">{t('dashboardLabel')}</p>
              <h3 className="text-xl font-medium text-[hsl(var(--snug-text-primary))] leading-tight">
                {t('zoomDescriptionLine1')}
                <br />
                {t('zoomDescriptionLine2')}
              </h3>
            </div>

            {/* Dashboard Illustration */}
            <div className="relative flex justify-center mb-8">
              <Image
                src="/images/host-intro/process-mobile-dashboard.png"
                alt="Dashboard Preview"
                width={350}
                height={427}
                className="w-full max-w-[300px] h-auto"
              />
            </div>

            {/* Dashboard Description */}
            <p className="text-sm text-[hsl(var(--snug-gray))] text-center leading-relaxed">
              하우스 운영부터 매출, 계약,
              <br />
              체크인 현황은 물론, 환불·취소까지!
              <br />
              호스트 대시보드에서 운영 전반을
              <br />
              한눈에 확인하고 간편하게 관리하세요.
            </p>
          </AnimateOnScroll>

          {/* Operations Section */}
          <AnimateOnScroll variant="fadeUp">
            <div className="text-center mb-6">
              <p className="text-[#FF8200] text-lg font-bold mb-2">{tOperations('label')}</p>
              <h3 className="text-xl font-medium text-[hsl(var(--snug-text-primary))] leading-tight">
                {tOperations('titleLine1')}
                <br />
                {tOperations('titleLine2')}
              </h3>
            </div>

            {/* Operations Illustration */}
            <div className="relative flex justify-center mb-8">
              <Image
                src="/images/host-intro/process-mobile-operations.png"
                alt="Operations Preview"
                width={350}
                height={426}
                className="w-full max-w-[300px] h-auto"
              />
            </div>

            {/* Operations Description */}
            <p className="text-sm text-[hsl(var(--snug-gray))] text-center leading-relaxed">
              여러 협력업체 관리도 이제 스너그에서 한 번에.
              <br />
              호스트가 일일이 소통할 필요없이,
              <br />
              클릭 한 번에 요청·수락·기록이
              <br />
              모두 자동 처리됩니다.
            </p>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}
