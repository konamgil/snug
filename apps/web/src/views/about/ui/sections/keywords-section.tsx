'use client';

import Image from 'next/image';

const keywords = [
  { text: 'Exchange Students', size: 'small' },
  { text: 'Entertainment Stays', size: 'small' },
  { text: 'Concerts', size: 'small' },
  { text: 'Corporate Relocation', size: 'small' },
  { text: 'One-Month Stay', size: 'small' },
  { text: 'K-Culture', size: 'large' },
  { text: 'Business Travel', size: 'large' },
  { text: 'Visiting Family', size: 'large' },
  { text: 'Working Holiday', size: 'large' },
  { text: 'Medical Travel', size: 'small' },
  { text: 'Gap Year Stays', size: 'small' },
  { text: 'Internships', size: 'small' },
];

function KeywordTag({ text, size }: { text: string; size: 'small' | 'large' }) {
  const baseClasses =
    'inline-flex items-center justify-center border border-black rounded-full whitespace-nowrap';
  const sizeClasses =
    size === 'large' ? 'px-8 py-2 text-2xl md:text-[30px]' : 'px-5 py-1.5 text-lg md:text-xl';

  return <span className={`${baseClasses} ${sizeClasses} font-medium`}>{text}</span>;
}

export function KeywordsSection() {
  return (
    <section className="py-16 md:py-24 overflow-hidden">
      <div className="max-w-[1312px] mx-auto px-4 md:px-8">
        {/* Title */}
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl md:text-3xl font-bold">about.</span>
            <Image
              src="/images/about/logo-aboutsnug.png"
              alt="snug"
              width={110}
              height={45}
              className="h-8 md:h-10 w-auto"
            />
          </div>
          <p className="text-lg md:text-xl text-black">Different stays, different lives.</p>
        </div>

        {/* Keywords Cloud */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-[1000px] mx-auto">
          {keywords.map((keyword) => (
            <KeywordTag
              key={keyword.text}
              text={keyword.text}
              size={keyword.size as 'small' | 'large'}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
