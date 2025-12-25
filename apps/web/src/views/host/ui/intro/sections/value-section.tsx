'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';

export function ValueSection() {
  const t = useTranslations('hostIntro.value');

  return (
    <section className="relative bg-white">
      {/* Top orange stripe - full width */}
      <div
        className="h-3 w-full"
        style={{
          backgroundImage:
            'linear-gradient(109deg, rgba(255, 103, 0, 1) 12%, rgba(255, 121, 0, 1) 99%)',
        }}
      />

      {/* Main content area with orange background - fixed 428px height */}
      <div className="relative h-[428px]">
        {/* Orange background layer - full width, fixed height */}
        <div
          className="absolute inset-0 w-full"
          style={{
            backgroundImage:
              'linear-gradient(109deg, rgba(255, 103, 0, 1) 12%, rgba(255, 121, 0, 1) 99%)',
          }}
        />

        {/* Content layer */}
        <div className="relative h-full max-w-[1312px] mx-auto px-5 md:px-8">
          <div className="flex items-end justify-between h-full">
            {/* Left - Text content */}
            <div className="py-12 md:py-16 max-w-[600px]">
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 bg-white rounded-[20px] mb-6">
                <span className="text-lg font-bold text-[#ff6901] tracking-[-0.45px]">
                  {t('badge')}
                </span>
              </div>

              {/* Heading - Mixed colors */}
              <h2 className="text-[32px] md:text-[41px] font-bold leading-[1.35] mb-6 tracking-[-1px]">
                <span className="text-[#161616]">운영이</span>
                <span className="text-white font-semibold"> 쉬워지면,</span>
                <br />
                <span className="text-[#161616]">수익은 자연스럽게 </span>
                <span className="text-white font-semibold">올라요.</span>
              </h2>

              {/* Description */}
              <p className="text-base md:text-lg leading-[1.55] text-white/80 tracking-[0.36px]">
                운영이 복잡해질수록 불필요한 비용은 늘고 성장 기회는 줄어듭니다.
                <br className="hidden md:block" />
                스너그는 전 과정을 단순화해 낭비를 최소화하고 효율을 극대화함으로써,
                <br className="hidden md:block" />
                같은 공간에서도 더 높은 수익을 만들어냅니다.
              </p>
            </div>

            {/* Right - Buildings: starts 156px below orange bg bottom */}
            {/* Left building: 524px, Right building: 654px */}
            <div className="hidden lg:flex items-end gap-[26px] translate-y-[156px]">
              <Image
                src="/images/host-intro/building-left.svg"
                alt="Building with various rooms"
                width={300}
                height={524}
                className="h-[524px] w-auto"
              />
              <Image
                src="/images/host-intro/building-right.svg"
                alt="Building with various rooms"
                width={350}
                height={654}
                className="h-[654px] w-auto"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for building overflow (156px) */}
      <div className="hidden lg:block h-[156px]" />

      {/* Mobile buildings - separate section */}
      <div className="flex lg:hidden items-end justify-center gap-[26px] py-8 bg-white">
        <Image
          src="/images/host-intro/building-left.svg"
          alt="Building with various rooms"
          width={200}
          height={350}
          className="h-[280px] md:h-[350px] w-auto"
        />
        <Image
          src="/images/host-intro/building-right.svg"
          alt="Building with various rooms"
          width={225}
          height={420}
          className="h-[350px] md:h-[420px] w-auto"
        />
      </div>
    </section>
  );
}
