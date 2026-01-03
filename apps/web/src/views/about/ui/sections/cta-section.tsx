'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';

export function CtaSection() {
  return (
    <section className="relative bg-white pt-16 md:pt-24 pb-12 md:pb-16">
      <div className="relative max-w-[1312px] mx-auto px-4 md:px-8">
        {/* Content */}
        <motion.div
          className="relative z-10 flex flex-col items-center text-center mb-4 md:mb-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Title Logo */}
          <Image
            src="/images/about/logo-find-snug.svg"
            alt="Find, snug."
            width={484}
            height={100}
            className="w-[200px] md:w-[300px] lg:w-[360px] h-auto mb-6 md:mb-8"
          />

          {/* Description */}
          <p className="text-lg md:text-[22px] font-black text-black leading-[1.5] mb-5 md:mb-6 max-w-[500px]">
            Not just a short stay,
            <br />
            but a place where life unfolds.
            <br />
            Discover it on SNUG.
          </p>

          {/* Sign up Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-2.5 bg-[#FF7900] hover:bg-[#e56d00] hover:scale-105 active:scale-95 rounded-full text-white text-base md:text-lg font-bold transition-all duration-200"
            >
              Sign up
            </Link>
          </motion.div>
        </motion.div>

        {/* Illustration */}
        <motion.div
          className="relative w-full max-w-[1100px] mx-auto -mt-16 md:-mt-80"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Image
            src="/images/about/Group 630374.svg"
            alt="People enjoying life in a cozy living room"
            width={1100}
            height={500}
            className="w-full h-auto"
          />
        </motion.div>
      </div>
    </section>
  );
}
