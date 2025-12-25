'use client';

import { useTranslations } from 'next-intl';
import { AnimateOnScroll, StaggerContainer, StaggerItem } from '@/shared/ui/animation';
import { SpeechBubbleIcon } from '@/shared/ui/icons';

interface ProcessCard {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function ProcessSection() {
  const t = useTranslations('hostIntro.process');

  const cards: ProcessCard[] = [
    {
      icon: (
        <svg
          width="40"
          height="32"
          viewBox="0 0 55 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-[hsl(var(--snug-orange))]"
        >
          <path
            d="M2 36.2857L7.66667 42L19 30.5714M30.3333 4.85714H53M30.3333 22H53M30.3333 39.1429H53M4.83333 2H16.1667C17.7315 2 19 3.27919 19 4.85714V16.2857C19 17.8637 17.7315 19.1429 16.1667 19.1429H4.83333C3.26853 19.1429 2 17.8637 2 16.2857V4.85714C2 3.27919 3.26853 2 4.83333 2Z"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      title: t('cards.0.title'),
      description: t('cards.0.description'),
    },
    {
      icon: (
        <svg
          width="40"
          height="35"
          viewBox="0 0 49 43"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-[hsl(var(--snug-orange))]"
        >
          <path
            d="M18.875 41H7.625C4.5184 41 2 38.4416 2 35.2857V31.7143C2 25.797 6.722 21 12.5469 21H15.7776C20.2127 21 23.25 27.6667 24.5 31.6667C25.8712 36.0546 28.7873 41 33.2224 41C36.4062 41 38.2298 41 41.375 41C44.5202 41 47 38.4416 47 35.2857V31.7143C47 25.797 42.2766 21.001 36.4531 21C36.4531 21 34.4841 21 33.2224 21C32 21 30 21.5 28.8282 21.9781"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="13.5" cy="8.5" r="6.5" stroke="currentColor" strokeWidth="4" />
          <circle cx="36.5" cy="8.5" r="6.5" stroke="currentColor" strokeWidth="4" />
        </svg>
      ),
      title: t('cards.1.title'),
      description: t('cards.1.description'),
    },
    {
      icon: (
        <svg
          width="34"
          height="40"
          viewBox="0 0 44 53"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-[hsl(var(--snug-orange))]"
        >
          <path
            d="M2 34.5663V21.5398C2 16.3575 4.05865 11.3875 7.72306 7.72306C11.3875 4.05865 16.3575 2 21.5398 2C26.722 2 31.692 4.05865 35.3565 7.72306C39.0209 11.3875 41.0795 16.3575 41.0795 21.5398V34.5663M41.0795 36.7373C41.0795 37.889 40.622 38.9934 39.8077 39.8077C38.9934 40.622 37.889 41.0795 36.7373 41.0795H34.5663C33.4147 41.0795 32.3102 40.622 31.4959 39.8077C30.6816 38.9934 30.2241 37.889 30.2241 36.7373V30.2241C30.2241 29.0725 30.6816 27.968 31.4959 27.1537C32.3102 26.3394 33.4147 25.8819 34.5663 25.8819H41.0795V36.7373ZM2 36.7373C2 37.889 2.45748 38.9934 3.27179 39.8077C4.08611 40.622 5.19055 41.0795 6.34217 41.0795H8.51325C9.66487 41.0795 10.7693 40.622 11.5836 39.8077C12.3979 38.9934 12.8554 37.889 12.8554 36.7373V30.2241C12.8554 29.0725 12.3979 27.968 11.5836 27.1537C10.7693 26.3394 9.66487 25.8819 8.51325 25.8819H2V36.7373Z"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M34.8118 40.7109C35.4672 43.4965 34.4185 49.0676 24.9805 49.0676"
            stroke="currentColor"
            strokeWidth="4"
          />
          <circle cx="23.0146" cy="49.0692" r="3.43253" fill="currentColor" stroke="currentColor" />
        </svg>
      ),
      title: t('cards.2.title'),
      description: t('cards.2.description'),
    },
    {
      icon: (
        <svg
          width="40"
          height="40"
          viewBox="0 0 49 49"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-[hsl(var(--snug-orange))]"
        >
          <path d="M10 10H20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <path
            d="M41 2H9C5.13401 2 2 5.13401 2 9V34C2 37.866 5.13401 41 9 41H14.0502"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M10 17H20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <circle cx="41" cy="16" r="6" stroke="currentColor" strokeWidth="4" />
          <circle cx="28" cy="41" r="6" stroke="currentColor" strokeWidth="4" />
          <path
            d="M28 35V28.6574H41V22"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      title: t('cards.3.title'),
      description: t('cards.3.description'),
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-[1312px] mx-auto px-5 md:px-8">
        {/* Section Heading */}
        <AnimateOnScroll variant="fadeUp" className="text-center mb-12 md:mb-16">
          {/* Speech bubble icon */}
          <div className="flex items-center justify-center mb-4">
            <SpeechBubbleIcon />
          </div>
          <p className="text-sm text-[hsl(var(--snug-text-primary))] font-medium mb-2">
            {t('subtitle')}
          </p>
          <h2 className="text-2xl md:text-[32px] font-bold leading-tight text-[hsl(var(--snug-text-primary))]">
            {t('titlePrefix')}
            <span className="text-[#FF8200]">{t('titleHighlight')}</span>
            {t('titleSuffix')}
          </h2>
        </AnimateOnScroll>

        {/* Process Cards */}
        <div className="relative">
          {/* Cards Grid */}
          <StaggerContainer
            staggerDelay={0.12}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {cards.map((card, index) => (
              <StaggerItem key={index}>
                <div className="relative h-full bg-white border border-[hsl(var(--snug-border))] rounded-2xl p-6 hover:shadow-lg hover:border-[hsl(var(--snug-orange))] transition-all duration-300 group">
                  {/* Icon */}
                  <div className="mb-4">{card.icon}</div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-[hsl(var(--snug-text-primary))] mb-3">
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-[hsl(var(--snug-gray))] leading-relaxed">
                    {card.description}
                  </p>

                  {/* Arrow connector for desktop (except last card) */}
                  {index < cards.length - 1 && (
                    <div className="hidden lg:block absolute -right-3 top-1/2 transform -translate-y-1/2 z-10">
                      <div className="w-6 h-6 bg-[hsl(var(--snug-orange))] rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}
