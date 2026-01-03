'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

const painPoints = [
  'High security deposits',
  'Long-term contracts',
  'Misleading photos & conditions',
];

export function BuiltForLivingSection() {
  return (
    <section className="py-12 md:py-20">
      <div className="max-w-[1312px] mx-auto px-4 md:px-8 lg:px-[117px]">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-8 lg:gap-12">
          {/* Left: Illustration */}
          <motion.div
            className="relative w-full max-w-[539px] aspect-[539/651] lg:flex-shrink-0 rounded-[20px] overflow-hidden"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Image
              src="/images/about/built-for-living-illustration.jpg"
              alt="Person looking for housing in Korea"
              fill
              className="object-cover scale-x-[-1]"
            />
          </motion.div>

          {/* Right: Content */}
          <motion.div
            className="flex-1 flex flex-col items-center lg:-mt-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Symbol + Title */}
            <div className="flex flex-col items-center mb-3">
              <Image
                src="/images/about/symbol-brown.svg"
                alt=""
                width={75}
                height={55}
                className="w-[60px] md:w-[75px] h-auto mb-8"
              />
              <h2 className="text-4xl md:text-[56px] font-black text-[#763225] tracking-[-2.8px]">
                Built for Living
              </h2>
            </div>

            {/* Description */}
            <p className="text-sm md:text-2xl font-extrabold text-black leading-[1.35] mb-8 max-w-[300px] md:max-w-[411px] text-center">
              <span className="md:hidden">
                SNUG helps foreigners find homes
                <br />
                for living, not just staying.
                <br />
                From short stays to flexible
                <br />
                rentals, we make it easier to find a
                <br />
                place that fits your life in Korea.
              </span>
              <span className="hidden md:inline">
                SNUG helps foreigners find homes for living, not just staying.
                <br />
                From short stays to flexible rentals, we make it easier to find a place that fits
                your life in Korea.
              </span>
            </p>

            {/* Pain Points */}
            <div className="flex flex-col gap-3 items-center lg:items-start">
              {painPoints.map((point, index) => (
                <motion.div
                  key={point}
                  className="inline-flex items-center justify-center px-6 py-2 bg-[#763225] rounded-full w-full max-w-[390px]"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <span className="text-lg md:text-xl font-extrabold text-white">{point}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
