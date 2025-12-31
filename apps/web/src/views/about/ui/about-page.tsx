'use client';

import Image from 'next/image';
import { Header } from '@/widgets/header';
import { Link } from '@/i18n/navigation';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header showLogo />
      <main>
        {/* Mobile Image */}
        <Link href="/login" className="block md:hidden">
          <Image
            src="/images/about/스너그 소개 페이지 모바일.png"
            alt="Snug About Page"
            width={390}
            height={5765}
            className="w-full h-auto cursor-pointer"
            priority
          />
        </Link>

        {/* Desktop Image */}
        <Link href="/login" className="hidden md:block max-w-[1312px] mx-auto">
          <Image
            src="/images/about/스너그 소개 페이지 PC.png"
            alt="Snug About Page"
            width={1312}
            height={5892}
            className="w-full h-auto cursor-pointer"
            priority
          />
        </Link>
      </main>
    </div>
  );
}
