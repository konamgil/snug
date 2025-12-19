'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { defaultLocale } from '@/i18n/config';

// Root page redirects to default locale (client-side for static export)
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Detect browser language or use default
    const browserLang = navigator.language.split('-')[0] ?? defaultLocale;
    const supportedLocales = ['en', 'ko', 'zh', 'ja', 'vi'];
    const locale = supportedLocales.includes(browserLang) ? browserLang : defaultLocale;
    router.replace(`/${locale}`);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>
  );
}
