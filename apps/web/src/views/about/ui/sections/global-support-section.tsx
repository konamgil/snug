'use client';

import { motion } from 'framer-motion';
import { ChatAnimation } from './chat-animation';

export function GlobalSupportSection() {
  return (
    <section className="relative z-0 bg-white -mt-[40px] md:-mt-[60px]">
      {/* Orange background at top */}
      <div className="absolute top-[60px] md:top-[100px] left-0 right-0 h-[120px] md:h-[176px] bg-[#FF7900] z-0" />

      <div className="relative z-10 max-w-[1312px] mx-auto px-4 md:px-8 pt-[150px] md:pt-[200px] pb-12 md:pb-20">
        <div className="flex flex-col-reverse lg:flex-row items-center justify-center gap-8 lg:gap-16">
          {/* Left: Chat Illustration with typing animation */}
          <ChatAnimation />

          {/* Right: Content */}
          <motion.div
            className="flex flex-col items-center lg:items-center lg:ml-12 xl:ml-20 lg:mt-28 mb-4 lg:mb-0"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Globe Emoji */}
            <motion.span
              className="text-6xl mb-4"
              initial={{ scale: 0.5, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            >
              🌏
            </motion.span>

            {/* Title */}
            <h2 className="text-4xl md:text-[56px] font-black text-[#FF7900] tracking-[-2.8px] mb-4">
              Global support
            </h2>

            {/* Description */}
            <p className="text-xl md:text-[26px] font-black text-black text-center leading-[1.3] max-w-[357px]">
              Multilingual support for
              <br />
              customer service,
              <br />
              maintenance, and
              <br />
              essential documents.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
