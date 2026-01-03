'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="max-w-[1312px] mx-auto px-4 md:px-6 lg:px-[116px]">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 lg:gap-0 pt-8 pb-12 lg:pt-0 lg:pb-0">
          {/* Left Content */}
          <motion.div
            className="flex flex-col items-center text-center flex-1 lg:pt-[200px]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Logo Text - "live like a local snug" */}
            <div className="mb-4 lg:mb-6">
              <Image
                src="/images/about/logo_livelikealocal.svg"
                alt="live like a local snug"
                width={419}
                height={172}
                className="w-[280px] md:w-[374px] lg:w-[419px] h-auto"
                priority
              />
            </div>

            {/* Description */}
            <motion.div
              className="mb-6 lg:mb-8 max-w-[498px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <h1 className="text-xl md:text-2xl font-extrabold text-black leading-tight mb-4">
                When it&apos;s time to truly live,
                <br className="md:hidden" /> not just stay,
                <br className="hidden md:block" />
                what do you consider?
              </h1>
              <p className="text-sm md:text-base text-black leading-[1.5]">
                Built for everyday living. Less burden, more choice.
                <br />
                Short stays &amp; flexible rentals by SNUG.
              </p>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <Link
                href="/login"
                className="inline-flex items-center justify-center w-[110px] h-10 bg-[#FF7900] text-white text-sm font-bold rounded-full hover:bg-[#E66D00] hover:scale-105 active:scale-95 transition-all duration-200 tracking-[-0.18px]"
              >
                Sign up
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            className="relative w-[calc(100%+32px)] -mx-4 md:mx-0 md:w-full md:max-w-[530px] lg:w-[530px] lg:flex-shrink-0 aspect-[530/863]"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Image
              src="/images/about/hero-illustration.png"
              alt="Snug living illustration"
              fill
              className="object-contain rounded-[20px]"
              priority
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
