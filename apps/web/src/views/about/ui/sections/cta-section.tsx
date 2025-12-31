'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';

export function CtaSection() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="max-w-[1312px] mx-auto px-4 md:px-8 lg:px-16">
        {/* Background Illustration */}
        <div className="relative">
          {/* Illustration */}
          <div className="relative w-full max-w-[1189px] mx-auto aspect-[1189/683]">
            <Image
              src="/images/about/cta-illustration.svg"
              alt="Find your snug home"
              fill
              className="object-contain"
            />

            {/* Overlay Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
              {/* Logo */}
              <div className="mb-6">
                <p className="text-sm md:text-base text-gray-600 mb-2">Find.</p>
                <Image
                  src="/images/about/logo-snug-medium.svg"
                  alt="snug"
                  width={310}
                  height={63}
                  className="w-[200px] md:w-[310px] h-auto"
                />
              </div>

              {/* Tagline */}
              <p className="text-base md:text-lg text-black leading-relaxed mb-8 max-w-[366px]">
                Not just a short stay, but a place where life unfolds.
                <br />
                Discover it on SNUG.
              </p>

              {/* CTA Button */}
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-6 py-2.5 bg-[#FF7900] text-white text-sm font-bold rounded-full hover:bg-[#E66D00] transition-colors"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
