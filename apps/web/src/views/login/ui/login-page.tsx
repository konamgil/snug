'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { SocialLoginButtons } from '@/features/auth';
import { EmailLoginForm } from '@/features/auth';
import { Link, useRouter } from '@/i18n/navigation';

type LoginView = 'social' | 'email';

export function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<LoginView>('social');
  const [callbackError, setCallbackError] = useState<string | null>(null);

  // URL 파라미터에서 에러 확인
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      const timeoutId = setTimeout(() => {
        if (error === 'email_already_registered') {
          setCallbackError(t('login.emailAlreadyRegistered'));
        } else if (error === 'auth_callback_error') {
          setCallbackError(t('login.authError'));
        }

        // URL에서 에러 파라미터 제거
        const url = new URL(window.location.href);
        url.searchParams.delete('error');
        window.history.replaceState({}, '', url.toString());
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [searchParams, t]);

  const handleBackClick = () => {
    if (view === 'email') {
      setView('social');
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-white relative overflow-y-auto no-scrollbar">
      {/* Back Button - Top Left */}
      <button
        type="button"
        onClick={handleBackClick}
        className="absolute top-4 left-4 p-2 text-[hsl(var(--snug-gray))] hover:text-[hsl(var(--snug-text-primary))] hover:bg-[hsl(var(--snug-light-gray))] rounded-full transition-all z-10"
        aria-label="Go back"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>
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

        {/* Callback Error Message */}
        {callbackError && (
          <div className="w-full max-w-[400px] mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 text-center">{callbackError}</p>
          </div>
        )}

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
