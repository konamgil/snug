'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';

export function PainPointsSection() {
  const t = useTranslations('hostIntro.painPoints');

  return (
    <section className="relative pt-16 md:pt-24 pb-32 md:pb-40 bg-white">
      <div className="max-w-[1312px] mx-auto px-5 md:px-8">
        {/* Section Heading */}
        <div className="text-center mb-12 md:mb-16">
          {/* Building icon */}
          <div className="flex items-center justify-center mb-4">
            <svg
              width="46"
              height="34"
              viewBox="0 0 46 34"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_pain)">
                <path d="M46 11.3327L34.4995 0L23 11.3327V33.999H46V11.3327Z" fill="#EF8BAC" />
                <path d="M23 11.3327L11.5005 0L0 11.3327V34L23 33.999V11.3327Z" fill="#EFDBB8" />
                <path
                  d="M13.3369 19.8608C12.6549 19.6785 11.4377 19.3218 11.4377 19.3218C10.973 19.2263 10.6432 19.0913 10.4573 18.9197C10.289 18.7644 10.2137 18.5967 10.2264 18.3913C10.2264 18.2235 10.2802 18.0798 10.3908 17.9525C10.5082 17.8176 10.6745 17.7144 10.8849 17.6469C11.1109 17.5736 11.3634 17.537 11.6344 17.537C12.1119 17.537 12.7146 17.7549 13.0326 18.0056C13.2547 18.1811 13.4024 18.3961 13.4846 18.6622C13.5805 18.9775 13.8584 19.1897 14.1744 19.1897H17.4668C17.6723 19.1897 17.868 19.101 18.0059 18.9467C18.1478 18.7876 18.2104 18.5764 18.185 18.3652C18.1008 17.6517 17.596 16.5727 17.2173 16.1417C16.5823 15.4185 15.7526 14.7146 14.9023 14.3453C13.8711 13.8979 12.9073 13.6289 11.8213 13.6289C10.3203 13.6289 9.08361 13.9384 8.20791 14.2981C7.23046 14.6992 6.44967 15.3125 5.92719 16.0839C5.47515 16.7521 5.05834 17.6806 5.05834 18.8773C5.04954 20.123 5.41547 20.9957 6.14734 21.7912C6.87431 22.5809 7.96722 23.1238 9.39377 23.4044L11.8056 23.8845C12.3222 23.9916 12.7038 24.1304 12.9406 24.2963C13.148 24.4428 13.2449 24.6251 13.2449 24.871C13.2449 25.0474 13.192 25.192 13.0825 25.3145C12.9641 25.4476 12.7958 25.5517 12.5835 25.624C12.3584 25.7012 12.0903 25.7397 11.786 25.7397C11.2626 25.7397 10.8301 25.6163 10.5033 25.3714C10.2577 25.1882 10.0855 24.9587 9.97888 24.6694C9.87321 24.3869 9.60316 24.197 9.30669 24.197H5.53484C5.32154 24.197 5.11998 24.2915 4.98202 24.4573C4.83917 24.628 4.78145 24.8517 4.8245 25.0706C4.98496 25.8834 5.30001 26.6191 5.75988 27.2546C6.34009 28.0549 7.14827 28.6855 8.16388 29.1271C9.17167 29.5658 10.3771 29.7886 11.7489 29.7886C13.1206 29.7886 13.9464 29.6295 14.9385 29.185C16.0931 28.6691 16.5579 28.2612 16.8925 27.8533C17.5911 27.0029 18.1488 25.7253 18.1488 24.6453C18.1488 23.4718 17.6811 21.9204 16.5774 21.1297C15.7624 20.5454 14.4307 20.15 13.3359 19.8579L13.3369 19.8608Z"
                  fill="#06050B"
                />
                <path
                  d="M39.7012 16.2078C38.4263 14.6052 36.5536 13.9756 34.7826 13.8763C32.675 13.7586 30.5636 14.4307 29.0979 16.3216C28.2056 17.4729 27.9893 18.708 27.9473 20.1669C27.9473 24.0817 31.5068 25.586 33.8384 25.7393C34.8403 25.8048 35.0243 25.7345 35.5311 25.6949C35.5311 25.6949 34.5703 26.4306 33.7523 26.9899C33.4519 27.1953 33.1604 27.5405 33.4656 28.038C33.6613 28.3581 34.0859 28.9753 34.2924 29.2877C34.5037 29.6068 35.0468 29.6454 35.5125 29.2279C36.7845 28.0853 37.5242 27.3216 38.4732 26.2445C39.5368 25.0373 40.388 23.8744 40.8694 21.6991C41.2021 20.192 41.2246 18.1218 39.7021 16.2087L39.7012 16.2078Z"
                  fill="#06050B"
                />
              </g>
              <defs>
                <clipPath id="clip0_pain">
                  <rect width="46" height="34" fill="white" />
                </clipPath>
              </defs>
            </svg>
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
        </div>

        {/* Illustrations with Speech Bubbles */}
        {/* Mobile: Vertical stack (< 768px) */}
        <div className="flex flex-col items-center gap-8 md:hidden">
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
                <svg
                  width="24"
                  height="14"
                  viewBox="0 0 24 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 14L0 0H24L12 14Z" fill="white" />
                  <path d="M0 0L12 14L24 0" stroke="#EF8BAC" strokeWidth="2" fill="none" />
                </svg>
              </div>
            </div>
            <Image
              src="/images/host-intro/pain-point-2.png"
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
                <svg
                  width="24"
                  height="14"
                  viewBox="0 0 24 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 14L0 0H24L12 14Z" fill="white" />
                  <path d="M0 0L12 14L24 0" stroke="#FF8200" strokeWidth="2" fill="none" />
                </svg>
              </div>
            </div>
            <Image
              src="/images/host-intro/pain-point-1.png"
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
                  <svg
                    width="24"
                    height="14"
                    viewBox="0 0 24 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 14L0 0H24L12 14Z" fill="white" />
                    <path d="M0 0L12 14L24 0" stroke="#FF8200" strokeWidth="2" fill="none" />
                  </svg>
                </div>
              </div>
            </div>
            <Image
              src="/images/host-intro/pain-point-1.png"
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
                  <svg
                    width="24"
                    height="14"
                    viewBox="0 0 24 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 14L0 0H24L12 14Z" fill="white" />
                    <path d="M0 0L12 14L24 0" stroke="#EF8BAC" strokeWidth="2" fill="none" />
                  </svg>
                </div>
              </div>
            </div>
            <Image
              src="/images/host-intro/pain-point-2.png"
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
          <div className="relative w-auto self-end translate-y-[130px]">
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
                  <svg
                    width="24"
                    height="14"
                    viewBox="0 0 24 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 14L0 0H24L12 14Z" fill="white" />
                    <path d="M0 0L12 14L24 0" stroke="#FF8200" strokeWidth="2" fill="none" />
                  </svg>
                </div>
              </div>
            </div>
            {/* Woman Illustration */}
            <Image
              src="/images/host-intro/pain-point-1.png"
              alt="Person working late at night"
              width={469}
              height={502}
              className="h-[500px] object-contain"
            />
          </div>

          {/* Right Group: Man + Pink Bubble */}
          <div className="relative w-auto self-end -ml-[5%] mt-[100px]">
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
                  <svg
                    width="24"
                    height="14"
                    viewBox="0 0 24 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 14L0 0H24L12 14Z" fill="white" />
                    <path d="M0 0L12 14L24 0" stroke="#EF8BAC" strokeWidth="2" fill="none" />
                  </svg>
                </div>
              </div>
            </div>
            {/* Man Illustration */}
            <Image
              src="/images/host-intro/pain-point-2.png"
              alt="Person at desk looking worried"
              width={469}
              height={566}
              className="h-[566px] object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
