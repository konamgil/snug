'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';

export function DashboardSection() {
  const t = useTranslations('hostIntro.dashboard');

  return (
    <section className="pt-12 md:pt-16 pb-24 md:pb-40 bg-white">
      <div className="max-w-[1312px] mx-auto px-5 md:px-8">
        {/* Section Heading */}
        <div className="text-center mb-40 md:mb-52">
          {/* Speech bubble icon */}
          <div className="flex items-center justify-center mb-4">
            <svg
              width="20"
              height="25"
              viewBox="0 0 20 25"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17.938 3.74098C15.9917 1.18444 13.1349 0.179289 10.431 0.0206368C7.21447 -0.166765 3.99173 0.90547 1.75504 3.922C0.393798 5.75874 0.0640827 7.73072 0 10.0573C0 16.3022 5.43256 18.7033 8.99121 18.9471C10.5209 19.0515 10.801 18.9386 11.5742 18.8758C11.5742 18.8758 10.1075 20.0492 8.85995 20.9415C8.40103 21.2694 7.95659 21.8188 8.42171 22.6132C8.72041 23.1232 9.36744 24.1092 9.68372 24.6075C10.0062 25.1165 10.8351 25.1782 11.5463 24.5117C13.4884 22.6898 14.616 21.4707 16.0641 19.7521C17.6879 17.827 18.9871 15.9711 19.7209 12.5009C20.2295 10.0967 20.2625 6.79371 17.939 3.74098H17.938Z"
                fill="#FF8200"
              />
            </svg>
          </div>
          <h2 className="text-2xl md:text-[32px] font-medium leading-tight text-[hsl(var(--snug-text-primary))]">
            {t('titleLine1')}
            <br />
            <span className="text-[#FF6700] font-bold">{t('titleHighlight')}</span>
            {t('titleSuffix')}
          </h2>
        </div>

        {/* Dashboard Preview Container */}
        <div className="relative">
          {/* Dashboard Layout */}
          <div className="relative max-w-[1218px] mx-auto">
            {/* Sidebar Zoom Circle - Hidden on mobile */}
            <div className="hidden md:block absolute -left-[10px] lg:left-[20px] top-[-25%] w-[280px] lg:w-[431px] h-[280px] lg:h-[431px] z-20">
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
                <p className="text-[#FF8200] mb-1" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                  {t('dashboardLabel')}
                </p>
                <p
                  className="text-[hsl(var(--snug-text-primary))] leading-tight"
                  style={{ fontSize: '1.625rem', fontWeight: 500 }}
                >
                  {t('zoomDescriptionLine1')}
                  <br />
                  {t('zoomDescriptionLine2')}
                </p>
              </div>
            </div>

            {/* Dashboard Screenshot */}
            <div className="relative z-10 max-w-[950px] mx-auto">
              <Image
                src="/images/host-intro/dashboard-preview.png"
                alt="Snug Host Dashboard Preview"
                width={1218}
                height={945}
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
