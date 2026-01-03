'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

const features = [
  {
    badge: 'Location',
    description: 'In real residential\nneighborhoods,\nnot tourist zones.',
  },
  {
    badge: 'Condition',
    description: 'Maintained for comfortable,\neveryday living',
  },
  {
    badge: 'Layout',
    description: 'A range of spaces designed\nto fit different lifestyles.',
  },
];

export function LiveReadySection() {
  return (
    <section className="relative z-10 bg-white pt-12 md:pt-20 pb-0 overflow-visible">
      <div className="relative max-w-[1312px] mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
          {/* Left: Content */}
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Symbol */}
            <div className="flex mb-4">
              <Image
                src="/images/about/symbol-orange-left.svg"
                alt=""
                width={38}
                height={55}
                className="w-[30px] md:w-[38px] h-auto"
              />
              <Image
                src="/images/about/symbol-orange-right.svg"
                alt=""
                width={38}
                height={55}
                className="w-[30px] md:w-[38px] h-auto"
              />
            </div>

            {/* Title */}
            <h2 className="text-4xl md:text-[56px] font-black text-[#FF7900] tracking-[-2.8px] mb-2">
              Live-ready
            </h2>

            {/* Subtitle */}
            <p className="text-xl md:text-[26px] font-extrabold text-black text-center leading-[1.2] mb-8 md:mb-12 whitespace-pre-line">
              Thoughtfully curated{'\n'}homes for real life.
            </p>

            {/* Features */}
            <div className="flex flex-col gap-6 md:gap-8 w-full max-w-[427px]">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.badge}
                  className="flex flex-col items-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.15, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  {/* Badge */}
                  <span className="inline-flex items-center justify-center px-4 py-1.5 bg-[#FF7900] rounded-full text-white text-lg md:text-[22px] font-black mb-2">
                    {feature.badge}
                  </span>
                  {/* Description */}
                  <p className="text-lg md:text-2xl font-bold text-black text-center leading-[1.3] whitespace-pre-line">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Illustration - Two Buildings */}
          <motion.div
            className="relative z-20 flex gap-2 lg:flex-shrink-0 items-end translate-y-[60px] md:translate-y-[100px] lg:translate-x-[40px]"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Image
              src="/images/about/building_1_.svg"
              alt="Building illustration 1"
              width={264}
              height={544}
              className="w-[140px] md:w-[264px] h-auto flex-shrink-0"
            />
            <Image
              src="/images/about/building_2_.svg"
              alt="Building illustration 2"
              width={264}
              height={680}
              className="w-[140px] md:w-[264px] h-auto flex-shrink-0"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
