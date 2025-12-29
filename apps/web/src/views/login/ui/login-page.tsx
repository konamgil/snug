'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import { SocialLoginButtons } from '@/features/auth';
import { EmailLoginForm } from '@/features/auth';
import { Link } from '@/i18n/navigation';

type LoginView = 'social' | 'email';

export function LoginPage() {
  const t = useTranslations('auth');
  const [view, setView] = useState<LoginView>('social');

  return (
    <div className="min-h-screen flex flex-col bg-white relative overflow-y-auto no-scrollbar">
      {/* Back Button - Top Left */}
      {view === 'email' && (
        <button
          type="button"
          onClick={() => setView('social')}
          className="absolute top-4 left-4 p-2 text-[hsl(var(--snug-gray))] hover:text-[hsl(var(--snug-text-primary))] hover:bg-[hsl(var(--snug-light-gray))] rounded-full transition-all z-10"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      )}
      <main className="flex-1 flex flex-col items-center justify-center px-5 py-8">
        {/* Welcome Logo */}
        <div className="mb-6">
          <Image
            src="/images/logo/logo-welcome-snug.svg"
            alt="Welcome to Snug"
            width={280}
            height={60}
            priority
          />
        </div>

        {/* Title */}
        <h1 className="text-base font-bold text-[hsl(var(--snug-text-primary))] mb-6">
          {t('login.title')}
        </h1>

        {/* Login Content */}
        <div className="w-full max-w-[400px]">
          {view === 'social' ? (
            <SocialLoginButtons onEmailClick={() => setView('email')} />
          ) : (
            <EmailLoginForm />
          )}
        </div>

        {/* Forgot Password Link */}
        <Link
          href="/forgot-password"
          className="mt-6 text-sm text-[hsl(var(--snug-gray))] underline"
        >
          {t('login.forgotPassword')}
        </Link>
      </main>
    </div>
  );
}
