'use client';

import Image from 'next/image';

const painPoints = [
  'High security deposits',
  'Long-term contracts',
  'Misleading photos & conditions',
];

export function BuiltForLivingSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-[1312px] mx-auto px-4 md:px-8 lg:px-16">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          {/* Left: Illustration */}
          <div className="relative w-full max-w-[540px] aspect-square lg:flex-shrink-0">
            <Image
              src="/images/about/built-for-living-illustration.png"
              alt="Built for living illustration"
              fill
              className="object-contain"
            />
            {/* Overlay play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[100px] h-[100px] bg-white/80 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-white transition-colors">
                <svg
                  className="w-10 h-10 text-[#763225] ml-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div className="flex-1 text-center lg:text-left">
            {/* Symbol */}
            <div className="flex justify-center lg:justify-start mb-4">
              <Image
                src="/images/about/symbol-brown.svg"
                alt=""
                width={75}
                height={55}
                className="w-[60px] md:w-[75px] h-auto"
              />
            </div>

            {/* Title */}
            <h2 className="text-4xl md:text-5xl font-black text-[#763225] mb-6">
              Built for Living
            </h2>

            {/* Description */}
            <p className="text-base md:text-lg text-black leading-relaxed mb-8 max-w-[411px] mx-auto lg:mx-0">
              SNUG helps foreigners find homes for living, not just staying. From short stays to
              flexible rentals, we make it easier to find a place that fits your life in Korea.
            </p>

            {/* Pain Points */}
            <div className="space-y-3">
              {painPoints.map((point) => (
                <div
                  key={point}
                  className="inline-flex items-center gap-3 px-6 py-2.5 bg-[#F5F5F5] rounded-full"
                >
                  <svg
                    className="w-5 h-5 text-[#763225]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  <span className="text-sm md:text-base font-medium text-black">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
