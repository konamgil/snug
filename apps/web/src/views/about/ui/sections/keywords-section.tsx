'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

interface KeywordItem {
  text: string;
  type: 'primary' | 'secondary';
  desktop: { top: string; left: string };
  mobile: { top: string; left: string };
  duration: number;
  delay: number;
  distance: number;
}

const keywords: KeywordItem[] = [
  // Primary (orange) - higher z-index
  {
    text: 'Working Holiday',
    type: 'primary',
    desktop: { top: '45px', left: '43%' },
    mobile: { top: '70px', left: '38%' },
    duration: 3.2,
    delay: 0,
    distance: 10,
  },
  {
    text: 'K-Culture',
    type: 'primary',
    desktop: { top: '133px', left: '40%' },
    mobile: { top: '130px', left: '35%' },
    duration: 2.8,
    delay: 0.7,
    distance: 8,
  },
  {
    text: 'Visiting Family',
    type: 'primary',
    desktop: { top: '212px', left: '17%' },
    mobile: { top: '190px', left: '5%' },
    duration: 3.5,
    delay: 1.2,
    distance: 12,
  },
  {
    text: 'Business Travel',
    type: 'primary',
    desktop: { top: '274px', left: '57%' },
    mobile: { top: '280px', left: '30%' },
    duration: 3.0,
    delay: 0.3,
    distance: 9,
  },
  // Secondary (beige) - lower z-index
  {
    text: 'Corporate Relocation',
    type: 'secondary',
    desktop: { top: '35px', left: '27%' },
    mobile: { top: '45px', left: '12%' },
    duration: 2.6,
    delay: 0.5,
    distance: 6,
  },
  {
    text: 'Entertainment Stays',
    type: 'secondary',
    desktop: { top: '0px', left: '59%' },
    mobile: { top: '0px', left: '45%' },
    duration: 3.3,
    delay: 1.0,
    distance: 7,
  },
  {
    text: 'One-Month Stay',
    type: 'secondary',
    desktop: { top: '121px', left: '8%' },
    mobile: { top: '105px', left: '2%' },
    duration: 2.9,
    delay: 0.2,
    distance: 8,
  },
  {
    text: 'Exchange Students',
    type: 'secondary',
    desktop: { top: '128px', left: '79%' },
    mobile: { top: '220px', left: '50%' },
    duration: 3.1,
    delay: 1.5,
    distance: 6,
  },
  {
    text: 'Concerts',
    type: 'secondary',
    desktop: { top: '181px', left: '54%' },
    mobile: { top: '160px', left: '60%' },
    duration: 2.7,
    delay: 0.8,
    distance: 7,
  },
  {
    text: 'Internships',
    type: 'secondary',
    desktop: { top: '264px', left: '36%' },
    mobile: { top: '220px', left: '22%' },
    duration: 3.4,
    delay: 0.4,
    distance: 9,
  },
  {
    text: 'Gap Year Stays',
    type: 'secondary',
    desktop: { top: '335px', left: '0%' },
    mobile: { top: '255px', left: '2%' },
    duration: 2.5,
    delay: 1.3,
    distance: 5,
  },
  {
    text: 'Medical Travel',
    type: 'secondary',
    desktop: { top: '349px', left: '34%' },
    mobile: { top: '310px', left: '25%' },
    duration: 3.0,
    delay: 0.6,
    distance: 8,
  },
];

function FloatingTag({ item, index }: { item: KeywordItem; index: number }) {
  const baseClasses =
    'inline-flex items-center justify-center rounded-full whitespace-nowrap cursor-pointer transition-all duration-300 ease-out';

  const styleClasses =
    item.type === 'primary'
      ? 'px-5 md:px-[30px] py-1.5 md:py-2 bg-[#FF7900] text-white text-lg md:text-[34px] font-extrabold shadow-[1px_6px_8.4px_0px_rgba(0,0,0,0.09)] capitalize tracking-[0.9px] hover:scale-105 hover:-translate-y-1 hover:shadow-[1px_10px_20px_0px_rgba(255,121,0,0.3)]'
      : 'px-4 md:px-5 py-1 md:py-[5px] bg-[#FFECDA] text-black/50 text-sm md:text-[22px] font-bold shadow-[6px_5px_10px_0px_rgba(0,0,0,0.06)] tracking-[0.6px] hover:scale-105 hover:-translate-y-1 hover:shadow-[6px_10px_20px_0px_rgba(0,0,0,0.12)] hover:text-black/70';

  return (
    <span
      className={`${baseClasses} ${styleClasses}`}
      style={{
        animation: `keyword-float-${index} ${item.duration}s ease-in-out infinite`,
        animationDelay: `${item.delay}s`,
      }}
    >
      {item.text}
    </span>
  );
}

export function KeywordsSection() {
  // Generate unique keyframes for each keyword
  const keyframesCSS = keywords
    .map(
      (item, index) => `
    @keyframes keyword-float-${index} {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-${item.distance}px);
      }
    }
  `,
    )
    .join('\n');

  return (
    <section className="py-8 md:py-12 overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: keyframesCSS }} />

      <div className="max-w-[1312px] mx-auto px-4 md:px-8">
        {/* Title */}
        <motion.div
          className="text-center mb-8 md:mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="flex items-center justify-center mb-4">
            <Image
              src="/images/about/logo-aboutsnug.svg"
              alt="about.snug."
              width={296}
              height={48}
              className="w-[13.1rem] h-[2.12rem] md:h-12 md:w-auto"
            />
          </div>
          <p className="text-xl md:text-2xl font-extrabold text-black">
            Different stays, different lives.
          </p>
        </motion.div>

        {/* Desktop: Scattered Layout */}
        <motion.div
          className="hidden md:block relative h-[400px] max-w-[1100px] mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {keywords.map((item, index) => (
            <div
              key={item.text}
              className="absolute"
              style={{
                top: item.desktop.top,
                left: item.desktop.left,
                zIndex: item.type === 'primary' ? 20 : 10,
              }}
            >
              <FloatingTag item={item} index={index} />
            </div>
          ))}
        </motion.div>

        {/* Mobile: Scattered Layout */}
        <motion.div
          className="md:hidden relative h-[360px] mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {keywords.map((item, index) => (
            <div
              key={item.text}
              className="absolute"
              style={{
                top: item.mobile.top,
                left: item.mobile.left,
                zIndex: item.type === 'primary' ? 20 : 10,
              }}
            >
              <FloatingTag item={item} index={index} />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
