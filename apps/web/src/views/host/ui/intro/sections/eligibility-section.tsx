'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { SpeechBubbleIcon } from '@/shared/ui/icons';
import { AnimateOnScroll, StaggerContainer, StaggerItem } from '@/shared/ui/animation';

interface EligibilityCard {
  title: string;
  descriptionLine1: string;
  descriptionLine2: string;
  bgColor: string;
  image: string;
}

export function EligibilitySection() {
  const t = useTranslations('hostIntro.eligibility');

  const cards: EligibilityCard[] = [
    {
      title: t('cards.0.title'),
      descriptionLine1: t('cards.0.descriptionLine1'),
      descriptionLine2: t('cards.0.descriptionLine2'),
      bgColor: 'bg-[#fff3de]',
      image: '/images/host-intro/eligibility-1.png',
    },
    {
      title: t('cards.1.title'),
      descriptionLine1: t('cards.1.descriptionLine1'),
      descriptionLine2: t('cards.1.descriptionLine2'),
      bgColor: 'bg-[hsl(var(--snug-orange))]',
      image: '/images/host-intro/eligibility-2.png',
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
          <h2 className="text-2xl md:text-[32px] font-bold leading-tight text-[hsl(var(--snug-text-primary))] mb-4">
            <span className="text-[#FF6700]">{t('titleHighlight')}</span>
            {t('titleSuffix')}
          </h2>
          <p className="text-sm md:text-base text-[hsl(var(--snug-gray))] max-w-[400px] mx-auto">
            {t('subtitleLine1')}
            <br />
            {t('subtitleLine2')}
          </p>
        </AnimateOnScroll>

        {/* Eligibility Cards */}
        <StaggerContainer
          staggerDelay={0.15}
          className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 max-w-[1172px] mx-auto"
        >
          {cards.map((card, index) => (
            <StaggerItem key={index}>
              <div
                className={`relative rounded-2xl overflow-hidden ${card.bgColor} min-h-[260px] md:min-h-[320px] group hover:shadow-lg transition-shadow`}
              >
                {/* Content */}
                <div className="relative z-10 p-6 md:p-8">
                  <h3
                    className={`text-xl md:text-2xl font-bold mb-3 ${index === 1 ? 'text-white' : 'text-[hsl(var(--snug-text-primary))]'}`}
                  >
                    {card.title}
                  </h3>
                  <p
                    className={`text-sm md:text-base leading-relaxed max-w-[300px] ${index === 1 ? 'text-white/90' : 'text-[hsl(var(--snug-gray))]'}`}
                  >
                    {card.descriptionLine1}
                    <br />
                    {card.descriptionLine2}
                  </p>
                </div>

                {/* Illustration Image */}
                <div className="absolute bottom-0 right-0 w-full h-full pointer-events-none">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className="object-contain object-right-bottom"
                  />
                </div>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
