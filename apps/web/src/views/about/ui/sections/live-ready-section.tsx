'use client';

import Image from 'next/image';

const features = [
  {
    id: 'location',
    label: 'Location',
    description: 'In real residential neighborhoods, not tourist zones.',
  },
  {
    id: 'condition',
    label: 'Condition',
    description: 'Maintained for comfortable, everyday living',
  },
  {
    id: 'layout',
    label: 'Layout',
    description: 'A range of spaces designed to fit different lifestyles.',
  },
];

function FeatureTag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center justify-center px-6 py-2 bg-[#F5F5F5] rounded-full text-base font-medium text-black">
      {label}
    </span>
  );
}

export function LiveReadySection() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-[1312px] mx-auto px-4 md:px-8 lg:px-16">
        <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-16">
          {/* Left: Content */}
          <div className="flex-1 lg:max-w-[450px]">
            {/* Symbol */}
            <div className="flex justify-center lg:justify-start mb-4">
              <Image
                src="/images/about/symbol-orange.svg"
                alt=""
                width={75}
                height={55}
                className="w-[60px] md:w-[75px] h-auto"
              />
            </div>

            {/* Title */}
            <h2 className="text-4xl md:text-5xl font-black text-[#FF7900] mb-6 text-center lg:text-left">
              Live-ready
            </h2>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl font-extrabold text-black mb-12 text-center lg:text-left">
              Thoughtfully curated homes for real life.
            </p>

            {/* Features List */}
            <div className="space-y-8">
              {features.map((feature) => (
                <div
                  key={feature.id}
                  className="flex flex-col lg:flex-row items-center lg:items-start gap-4"
                >
                  <FeatureTag label={feature.label} />
                  <p className="text-base text-black text-center lg:text-left max-w-[340px]">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Image Grid */}
          <div className="relative w-full lg:w-[556px] aspect-[556/680] flex-shrink-0">
            <Image
              src="/images/about/live-ready-grid.svg"
              alt="Live-ready home examples"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
