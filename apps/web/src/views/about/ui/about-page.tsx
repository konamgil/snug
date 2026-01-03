'use client';

import { Header } from '@/widgets/header';
import { HeroSection } from './sections/hero-section';
import { KeywordsSection } from './sections/keywords-section';
import { BuiltForLivingSection } from './sections/built-for-living-section';
import { BarrierFreeSection } from './sections/barrier-free-section';
import { LiveReadySection } from './sections/live-ready-section';
import { GlobalSupportSection } from './sections/global-support-section';
import { CtaSection } from './sections/cta-section';
import { IntroFooter } from '@/views/host/ui/intro/components/intro-footer';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header showLogo />
      <main>
        <HeroSection />
        <KeywordsSection />
        <BuiltForLivingSection />
        <BarrierFreeSection />
        <LiveReadySection />
        <GlobalSupportSection />
        <CtaSection />
      </main>
      <IntroFooter />
    </div>
  );
}
