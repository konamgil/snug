'use client';

import Image from 'next/image';

const features = [
  {
    id: 'deposit',
    title: 'Lower deposit\noptions',
    subtitle: 'Reduce the deposit, expand your choices.',
    description: 'SNUG lowers the financial burden and removes the barriers to getting started.',
  },
  {
    id: 'flexible',
    title: 'Flexible\nterms',
    subtitle: "Don't plan your life around a contract choose a stay that fits your schedule.",
    description:
      "With SNUG, you're not locked into fixed lease terms. From short stays to longer living, you can choose the length that works for you.",
  },
  {
    id: 'movein',
    title: 'Move-in\nready',
    subtitle: 'Skip the commitments start living right away.',
    description:
      'SNUG offers fully furnished homes, so you can move in without worrying about setup or long-term commitments. Just arrive, settle in, and start living.',
  },
];

function FeatureCard({
  title,
  subtitle,
  description,
}: {
  title: string;
  subtitle: string;
  description: string;
}) {
  return (
    <div className="border-2 border-[#EF8BAC] rounded-[35px] p-8 h-full flex flex-col">
      {/* Icon */}
      <div className="mb-4">
        <Image
          src="/images/about/icon-snug.svg"
          alt=""
          width={39}
          height={23}
          className="w-10 h-auto"
        />
      </div>

      {/* Title */}
      <h3 className="text-xl md:text-[22px] font-black text-[#EF8BAC] uppercase whitespace-pre-line mb-4">
        {title}
      </h3>

      {/* Subtitle */}
      <p className="text-base font-bold text-black leading-tight mb-4">{subtitle}</p>

      {/* Description */}
      <p className="text-xs text-black leading-relaxed">{description}</p>
    </div>
  );
}

export function BarrierFreeSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white via-[#FDF0F4] to-white">
      <div className="max-w-[1312px] mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          {/* Symbol */}
          <div className="flex justify-center mb-4">
            <Image
              src="/images/about/symbol-pink.svg"
              alt=""
              width={75}
              height={55}
              className="w-[60px] md:w-[75px] h-auto"
            />
          </div>

          {/* Title */}
          <h2 className="text-4xl md:text-[56px] font-black text-[#EF8BAC] tracking-tight mb-6">
            Barrier-free
          </h2>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl font-extrabold text-black leading-tight">
            No deposits.
            <br />
            No long contracts.
            <br />
            No setup hassles.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1032px] mx-auto">
          {features.map((feature) => (
            <FeatureCard
              key={feature.id}
              title={feature.title}
              subtitle={feature.subtitle}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
