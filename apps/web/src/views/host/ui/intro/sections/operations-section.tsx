'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';

export function OperationsSection() {
  const t = useTranslations('hostIntro.operations');

  return (
    <section className="pt-24 md:pt-40 pb-24 md:pb-40 bg-white">
      <div className="max-w-[1312px] mx-auto px-5 md:px-8">
        {/* Operations Preview Container */}
        <div className="relative">
          {/* Dashboard Layout */}
          <div className="relative max-w-[1218px] mx-auto">
            {/* Zoom Circle - Hidden on mobile, positioned on RIGHT */}
            <div className="hidden md:block absolute -right-[10px] lg:right-[20px] top-[-25%] w-[280px] lg:w-[431px] h-[280px] lg:h-[431px] z-20">
              {/* Orange dashed border */}
              <div className="absolute inset-0 rounded-full border-2 border-[#FF6700] border-dashed" />
              {/* Circle with zoomed content */}
              <div className="absolute inset-[8px] rounded-full overflow-hidden bg-white">
                <div className="relative w-[280%] h-[280%] -translate-x-[70%] translate-y-[4%]">
                  <Image
                    src="/images/host-intro/operations-dashboard.png"
                    alt="Customer Inquiry Detail Zoom"
                    width={1014}
                    height={618}
                    className="w-full h-auto"
                  />
                </div>
              </div>
              {/* Zoom description text - positioned to the LEFT of the circle */}
              <div className="absolute right-[100%] lg:right-[105%] top-[10%] whitespace-nowrap text-right">
                <p className="text-[#FF6700] mb-1" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                  {t('label')}
                </p>
                <p
                  className="text-[hsl(var(--snug-text-primary))] leading-tight"
                  style={{ fontSize: '1.625rem', fontWeight: 500 }}
                >
                  {t('titleLine1')}
                  <br />
                  {t('titleLine2')}
                </p>
              </div>
            </div>

            {/* Operations Screenshot */}
            <div className="relative z-10 max-w-[950px] mx-auto">
              <Image
                src="/images/host-intro/operations-dashboard.png"
                alt="Snug Host Operations Preview"
                width={1014}
                height={618}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>

          {/* Description */}
          <p className="text-center text-sm md:text-base text-[#A8A8A8] mt-8 max-w-[625px] mx-auto leading-relaxed">
            {t('descriptionLine1')}
            <br />
            {t('descriptionLine2')}
          </p>
        </div>
      </div>
    </section>
  );
}
