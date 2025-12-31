'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="max-w-[1312px] mx-auto px-4 md:px-8 lg:px-16">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12 py-12 lg:py-16">
          {/* Left Content */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left flex-1 pt-8 lg:pt-24">
            {/* Logo Text */}
            <div className="mb-6 lg:mb-8">
              <Image
                src="/images/about/logo-livelikealocal.png"
                alt="live like a local snug"
                width={374}
                height={154}
                className="w-[280px] md:w-[374px] h-auto"
                priority
              />
            </div>

            {/* Description */}
            <div className="mb-6 lg:mb-8 max-w-[498px]">
              <h1 className="text-xl md:text-2xl font-extrabold text-black leading-tight mb-4">
                When it&apos;s time to truly live, not just stay,
                <br className="hidden md:block" />
                what do you consider?
              </h1>
              <p className="text-sm md:text-base text-black leading-relaxed">
                Built for everyday living. Less burden, more choice.
                <br />
                Short stays & flexible rentals by SNUG.
              </p>
            </div>

            {/* CTA Button */}
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-6 py-2.5 bg-[#FF7900] text-white text-sm font-bold rounded-full hover:bg-[#E66D00] transition-colors"
            >
              Sign up
            </Link>
          </div>

          {/* Right Image */}
          <div className="relative w-full max-w-[530px] aspect-[530/863] lg:flex-shrink-0">
            <Image
              src="/images/about/hero-illustration.png"
              alt="Snug living illustration"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
