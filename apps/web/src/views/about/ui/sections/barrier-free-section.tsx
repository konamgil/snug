'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

const features = [
  {
    title: 'Lower deposit\noptions',
    subtitle: 'Reduce the deposit, expand\nyour choices.',
    description: 'SNUG lowers the financial burden and removes\nthe barriers to getting started.',
  },
  {
    title: 'Flexible\nterms',
    subtitle: "Don't plan your life around a\ncontract choose a stay that\nfits your schedule.",
    description:
      "With SNUG, you're not locked into fixed lease\nterms. From short stays to longer living, you can\nchoose the length that works for you.",
  },
  {
    title: 'Move-in\nready',
    subtitle: 'Skip the commitments\nstart living right away.',
    description:
      'SNUG offers fully furnished homes, so you can\nmove in without worrying about setup or long-term\ncommitments. Just arrive, settle in, and start living.',
  },
];

function QuoteIcon() {
  return (
    <svg width="40" height="23" viewBox="0 0 40 23" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16.9716 3.43688C15.1182 1.08044 12.4176 0.153752 9.87584 0.021368C6.83101 -0.16397 3.78616 0.84215 1.66801 3.59574C0.370648 5.29026 0.0529536 7.09068 0 9.2353C0 14.9808 5.13651 17.1783 8.52554 17.4166C9.98176 17.5225 10.2465 17.4166 10.9614 17.3637C10.9614 17.3637 9.5846 18.4492 8.39315 19.27C7.96952 19.5613 7.54588 20.0643 7.96951 20.8057C8.26075 21.2823 8.86971 22.1825 9.16096 22.6326C9.47868 23.1092 10.2465 23.1621 10.9349 22.5531C12.7618 20.8851 13.8474 19.7466 15.2242 18.1845C16.7598 16.4105 18.0042 14.716 18.6926 11.5123C19.1692 9.31473 19.1957 6.2699 16.9981 3.46335L16.9716 3.43688Z"
        fill="#EF8BAC"
      />
      <path
        d="M37.1494 3.43688C35.296 1.08044 32.5954 0.153752 30.0536 0.021368C27.0087 -0.16397 23.9639 0.84215 21.8458 3.59574C20.5484 5.29026 20.2307 7.09068 20.1777 9.2353C20.1777 14.9808 25.3142 17.1783 28.7033 17.4166C30.1595 17.5225 30.4243 17.4166 31.1391 17.3637C31.1391 17.3637 29.7623 18.4492 28.5709 19.27C28.1473 19.5613 27.7236 20.0643 28.1472 20.8057C28.4385 21.2823 29.0475 22.1825 29.3387 22.6326C29.6565 23.1092 30.4243 23.1621 31.1127 22.5531C32.9396 20.8851 34.0251 19.7466 35.4019 18.1845C36.9376 16.4105 38.182 14.716 38.8704 11.5123C39.3469 9.31473 39.3734 6.2699 37.1758 3.46335L37.1494 3.43688Z"
        fill="#EF8BAC"
      />
    </svg>
  );
}

function BackgroundShape() {
  return (
    <svg
      className="absolute top-0 left-0 w-full h-auto"
      viewBox="0 0 1312 599"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <path d="M656 84.8785L0 599V0H1312V599L656 84.8785Z" fill="#EF8BAC" />
    </svg>
  );
}

export function BarrierFreeSection() {
  return (
    <section className="relative bg-white">
      <BackgroundShape />
      <div className="relative max-w-[1312px] mx-auto px-4 md:px-8 pt-[200px] md:pt-[350px] pb-12 md:pb-20">
        {/* Header */}
        <motion.div
          className="flex flex-col items-center mb-10 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Symbol */}
          <Image
            src="/images/about/symbol-pink.svg"
            alt=""
            width={75}
            height={55}
            className="w-[60px] md:w-[75px] h-auto mb-4"
          />
          {/* Title */}
          <h2 className="text-4xl md:text-[56px] font-black text-[#EF8BAC] tracking-[-2.8px] mb-4">
            Barrier-free
          </h2>
          {/* Description */}
          <p className="text-lg md:text-[26px] font-extrabold text-black text-center leading-[1.4]">
            No deposits.
            <br />
            No long contracts.
            <br />
            No setup hassles.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-[960px] mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="border-2 border-[#EF8BAC] rounded-[35px] p-6 md:p-8 bg-white"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.15, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {/* Quote Icon */}
              <div className="mb-4">
                <QuoteIcon />
              </div>
              {/* Title */}
              <h3 className="text-[18px] md:text-[22px] font-black text-[#EF8BAC] uppercase leading-tight mb-4 whitespace-pre">
                {feature.title}
              </h3>
              {/* Subtitle */}
              <p className="text-sm md:text-base font-bold text-black leading-[1.3] mb-3 whitespace-pre-line md:whitespace-normal">
                {feature.subtitle}
              </p>
              {/* Description */}
              <p className="text-xs md:text-sm text-black leading-[1.5] whitespace-pre-line md:whitespace-normal">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
