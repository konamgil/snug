'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';

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
        <div className="text-center mb-12 md:mb-16">
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
          <h2 className="text-2xl md:text-[32px] font-bold leading-tight text-[hsl(var(--snug-text-primary))] mb-4">
            <span className="text-[#FF6700]">{t('titleHighlight')}</span>
            {t('titleSuffix')}
          </h2>
          <p className="text-sm md:text-base text-[hsl(var(--snug-gray))] max-w-[400px] mx-auto">
            {t('subtitleLine1')}
            <br />
            {t('subtitleLine2')}
          </p>
        </div>

        {/* Eligibility Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-[1172px] mx-auto">
          {cards.map((card, index) => (
            <div
              key={index}
              className={`relative rounded-2xl overflow-hidden ${card.bgColor} min-h-[280px] md:min-h-[320px] group hover:shadow-lg transition-shadow`}
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
          ))}
        </div>
      </div>
    </section>
  );
}
