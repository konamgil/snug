'use client';

import Image from 'next/image';

export function GlobalSupportSection() {
  return (
    <section className="py-16 md:py-24 bg-[#FF7900] relative overflow-hidden">
      <div className="max-w-[1312px] mx-auto px-4 md:px-8 lg:px-16">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          {/* Left: Chat Demo Image */}
          <div className="relative w-full max-w-[481px] aspect-[481/549] flex-shrink-0">
            <Image
              src="/images/about/global-support-chat.svg"
              alt="AI translation chat demo"
              fill
              className="object-contain"
            />
          </div>

          {/* Right: Content */}
          <div className="flex-1 text-center lg:text-right">
            {/* Emoji */}
            <div className="text-5xl md:text-6xl mb-6">
              <span role="img" aria-label="globe">
                🌏
              </span>
            </div>

            {/* Title */}
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Global support</h2>

            {/* Description */}
            <p className="text-lg md:text-xl text-white leading-relaxed max-w-[357px] mx-auto lg:mx-0 lg:ml-auto">
              Multilingual support for customer service, maintenance, and essential documents.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
