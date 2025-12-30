'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ChevronDown, Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Link, useRouter } from '@/i18n/navigation';
import { EmailVerificationModal } from '@/features/auth';

type TabType = 'findId' | 'findPassword';
type FindPasswordStep = 'email' | 'reset' | 'socialLoginError';

const COUNTRY_CODES = [
  { code: '+82', country: 'South Korea' },
  { code: '+1', country: 'USA' },
  { code: '+81', country: 'Japan' },
  { code: '+86', country: 'China' },
  { code: '+44', country: 'UK' },
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function ForgotPasswordPage() {
  const t = useTranslations('auth.forgotPassword');
  const router = useRouter();

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('findId');

  // Find ID states
  const [countryCode, setCountryCode] = useState('+82');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [foundEmail, setFoundEmail] = useState<string | null>(null);
  const [findIdLoading, setFindIdLoading] = useState(false);
  const [findIdError, setFindIdError] = useState('');

  // Find Password states
  const [email, setEmail] = useState('');
  const [passwordStep, setPasswordStep] = useState<FindPasswordStep>('email');
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [checkingProvider, setCheckingProvider] = useState(false);
  const [socialProvider, setSocialProvider] = useState<string | null>(null);

  const selectedCountry = COUNTRY_CODES.find((c) => c.code === countryCode);
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordsMatch = newPassword === confirmPassword;
  const isPasswordValid = newPassword.length >= 8;

  // Handle Find ID submission
  const handleFindId = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;

    setFindIdLoading(true);
    setFindIdError('');
    setFoundEmail(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/find-id`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, countryCode }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setFoundEmail(data.email);
      } else {
        setFindIdError(data.message || t('findIdError'));
      }
    } catch {
      setFindIdError(t('findIdError'));
    }

    setFindIdLoading(false);
  };

  // Handle email verification for password reset
  const handleStartEmailVerification = async () => {
    if (!isValidEmail) return;

    setCheckingProvider(true);
    setResetError('');

    try {
      // 먼저 provider 확인
      const response = await fetch(`${API_BASE_URL}/auth/check-provider`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.exists && data.isSocialLogin) {
        // 소셜 로그인 사용자
        setSocialProvider(data.provider);
        setPasswordStep('socialLoginError');
        return;
      }

      if (!data.exists) {
        setResetError(t('userNotFound'));
        return;
      }

      // 이메일 가입 사용자 - 인증 진행
      setShowEmailVerificationModal(true);
    } catch {
      setResetError(t('resetError'));
    } finally {
      setCheckingProvider(false);
    }
  };

  const handleEmailVerified = () => {
    setIsEmailVerified(true);
    setShowEmailVerificationModal(false);
    setPasswordStep('reset');
  };

  // Handle password reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid || !passwordsMatch || !isEmailVerified) return;

    setResetLoading(true);
    setResetError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResetSuccess(true);
      } else {
        setResetError(data.message || t('resetError'));
      }
    } catch {
      setResetError(t('resetError'));
    }

    setResetLoading(false);
  };

  // Reset states when switching tabs
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    // Reset Find ID states
    setPhoneNumber('');
    setFoundEmail(null);
    setFindIdError('');
    // Reset Find Password states
    setEmail('');
    setPasswordStep('email');
    setIsEmailVerified(false);
    setNewPassword('');
    setConfirmPassword('');
    setResetError('');
    setResetSuccess(false);
    setSocialProvider(null);
  };

  // Provider 이름을 사용자 친화적으로 변환
  const getProviderDisplayName = (provider: string) => {
    const names: Record<string, string> = {
      google: 'Google',
      kakao: '카카오',
      facebook: 'Facebook',
      apple: 'Apple',
    };
    return names[provider] || provider;
  };

  const tabBaseClass = 'flex-1 py-3 text-sm font-medium transition-colors';
  const tabActiveClass =
    'text-[hsl(var(--snug-text-primary))] border-b-2 border-[hsl(var(--snug-orange))]';
  const tabInactiveClass = 'text-[hsl(var(--snug-gray))]';
  const inputClass =
    'px-4 py-3 border border-[hsl(var(--snug-border))] rounded-3xl text-sm text-[hsl(var(--snug-text-primary))] placeholder:text-[hsl(var(--snug-gray))] focus:outline-none focus:border-[hsl(var(--snug-orange))] transition-colors';

  return (
    <div className="min-h-dvh flex flex-col bg-white">
      <main className="flex-1 flex flex-col items-center justify-center px-5 py-8">
        {/* Welcome Logo */}
        <div className="mb-8">
          <Image
            src="/images/logo/logo-welcome-snug.svg"
            alt="Welcome to Snug"
            width={240}
            height={50}
            priority
          />
        </div>

        {/* Tab Navigation */}
        <div className="w-full max-w-[420px] flex border-b border-[hsl(var(--snug-border))] mb-6">
          <button
            type="button"
            onClick={() => handleTabChange('findId')}
            className={[
              tabBaseClass,
              activeTab === 'findId' ? tabActiveClass : tabInactiveClass,
            ].join(' ')}
          >
            {t('findId')}
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('findPassword')}
            className={[
              tabBaseClass,
              activeTab === 'findPassword' ? tabActiveClass : tabInactiveClass,
            ].join(' ')}
          >
            {t('findPassword')}
          </button>
        </div>

        {/* Find ID Tab */}
        {activeTab === 'findId' && (
          <div className="w-full max-w-[420px]">
            {foundEmail ? (
              /* Show found email */
              <div className="text-center space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-2xl">
                  <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">{t('idFound')}</span>
                  </div>
                  <p className="text-[hsl(var(--snug-text-primary))]">{foundEmail}</p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  className="w-full py-3 bg-[hsl(var(--snug-orange))] text-white text-sm font-medium rounded-full hover:bg-[hsl(var(--snug-orange))]/90 active:scale-[0.98] transition-all"
                >
                  {t('goToLogin')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleFindId} className="space-y-3">
                {findIdError && <p className="text-sm text-red-500 text-center">{findIdError}</p>}

                {/* Phone Row */}
                <div className="flex gap-3">
                  {/* Country Code Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                      className="flex items-center gap-2 px-4 py-3 border border-[hsl(var(--snug-border))] rounded-3xl text-sm text-[hsl(var(--snug-text-primary))] hover:border-[hsl(var(--snug-gray))] transition-colors min-w-[160px]"
                    >
                      <span>
                        ({countryCode}) {selectedCountry?.country}
                      </span>
                      <ChevronDown className="w-4 h-4 ml-auto" />
                    </button>
                    {showCountryDropdown && (
                      <div className="absolute top-full left-0 mt-2 w-full bg-white border border-[hsl(var(--snug-border))] rounded-2xl shadow-lg p-2 z-10">
                        {COUNTRY_CODES.map((country) => (
                          <button
                            key={country.code}
                            type="button"
                            onClick={() => {
                              setCountryCode(country.code);
                              setShowCountryDropdown(false);
                            }}
                            className="w-full px-3 py-2.5 text-left text-sm hover:bg-[hsl(var(--snug-light-gray))] rounded-lg transition-colors"
                          >
                            ({country.code}) {country.country}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Phone Number */}
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder={t('phoneNumber')}
                    className={['flex-1', inputClass].join(' ')}
                  />
                </div>

                <p className="text-xs text-[hsl(var(--snug-gray))] px-1">{t('findIdHint')}</p>

                {/* Continue Button */}
                <button
                  type="submit"
                  disabled={!phoneNumber || findIdLoading}
                  className="w-full py-3 bg-[hsl(var(--snug-orange))] text-white text-sm font-medium rounded-full hover:bg-[hsl(var(--snug-orange))]/90 active:scale-[0.98] transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {findIdLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {t('continue')}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Find Password Tab */}
        {activeTab === 'findPassword' && (
          <div className="w-full max-w-[420px]">
            {resetSuccess ? (
              /* Success message */
              <div className="text-center space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-2xl">
                  <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">{t('resetSuccess')}</span>
                  </div>
                  <p className="text-sm text-[hsl(var(--snug-gray))]">{t('resetSuccessHint')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  className="w-full py-3 bg-[hsl(var(--snug-orange))] text-white text-sm font-medium rounded-full hover:bg-[hsl(var(--snug-orange))]/90 active:scale-[0.98] transition-all"
                >
                  {t('goToLogin')}
                </button>
              </div>
            ) : passwordStep === 'socialLoginError' ? (
              /* Social login user - show info message */
              <div className="text-center space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                  <div className="text-amber-600 mb-2">
                    <span className="font-medium">{t('socialLoginUser')}</span>
                  </div>
                  <p className="text-sm text-[hsl(var(--snug-text-primary))]">
                    {t('socialLoginUserHint', {
                      provider: getProviderDisplayName(socialProvider || ''),
                    })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  className="w-full py-3 bg-[hsl(var(--snug-orange))] text-white text-sm font-medium rounded-full hover:bg-[hsl(var(--snug-orange))]/90 active:scale-[0.98] transition-all"
                >
                  {t('goToLogin')}
                </button>
              </div>
            ) : passwordStep === 'email' ? (
              /* Step 1: Email input and verification */
              <div className="space-y-3">
                {resetError && <p className="text-sm text-red-500 text-center">{resetError}</p>}

                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setIsEmailVerified(false);
                  }}
                  placeholder={t('email')}
                  className={['w-full', inputClass].join(' ')}
                />

                {isEmailVerified ? (
                  <div className="flex items-center justify-center gap-1 py-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">{t('emailVerified')}</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartEmailVerification}
                    disabled={!isValidEmail || checkingProvider}
                    className="w-full py-3 bg-[hsl(var(--snug-orange))] text-white text-sm font-medium rounded-full hover:bg-[hsl(var(--snug-orange))]/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {checkingProvider && <Loader2 className="w-4 h-4 animate-spin" />}
                    {t('verifyEmail')}
                  </button>
                )}
              </div>
            ) : (
              /* Step 2: New password input */
              <form onSubmit={handleResetPassword} className="space-y-3">
                {resetError && <p className="text-sm text-red-500 text-center">{resetError}</p>}

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t('newPassword')}
                    className={['w-full pr-12', inputClass].join(' ')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[hsl(var(--snug-gray))]"
                  >
                    {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-[hsl(var(--snug-gray))] px-1">{t('passwordHint')}</p>

                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('confirmPassword')}
                  className={['w-full', inputClass].join(' ')}
                />
                {confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-red-500 px-1">{t('passwordMismatch')}</p>
                )}

                <button
                  type="submit"
                  disabled={!isPasswordValid || !passwordsMatch || resetLoading}
                  className="w-full py-3 bg-[hsl(var(--snug-orange))] text-white text-sm font-medium rounded-full hover:bg-[hsl(var(--snug-orange))]/90 active:scale-[0.98] transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {resetLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {t('resetPassword')}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Back to Login Link */}
        <Link href="/login" className="mt-6 text-sm text-[hsl(var(--snug-gray))] underline">
          {t('backToLogin')}
        </Link>
      </main>

      {/* Email Verification Modal */}
      <EmailVerificationModal
        isOpen={showEmailVerificationModal}
        onClose={() => setShowEmailVerificationModal(false)}
        email={email}
        type="RESET_PASSWORD"
        onVerified={handleEmailVerified}
      />
    </div>
  );
}
