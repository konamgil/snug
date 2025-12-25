'use client';

import { HeroSection } from './sections/hero-section';
import { PainPointsSection } from './sections/pain-points-section';
import { ValueSection } from './sections/value-section';
import { ProcessSection } from './sections/process-section';
import { DashboardSection } from './sections/dashboard-section';
import { OperationsSection } from './sections/operations-section';
import { EligibilitySection } from './sections/eligibility-section';
import { CtaSection } from './sections/cta-section';
import { IntroFooter } from './components/intro-footer';
import { Header } from '@/widgets/header';

export function HostIntroPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header showLogo heightClass="h-[92px]" />
      <main>
        <HeroSection />
        <PainPointsSection />
        <ValueSection />
        <ProcessSection />
        <DashboardSection />
        <OperationsSection />
        <EligibilitySection />
        <CtaSection />
      </main>
      <IntroFooter />
    </div>
  );
}
