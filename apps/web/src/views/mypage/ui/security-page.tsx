'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff, X } from 'lucide-react';
import { Header } from '@/widgets/header';
import { MypageSidebar } from './mypage-sidebar';

type TabType = 'login' | 'social';

interface SocialLoginState {
  google: boolean;
  apple: boolean;
  kakao: boolean;
  facebook: boolean;
}

export function SecurityPage() {
  const t = useTranslations('mypage.security');
  const [activeTab, setActiveTab] = useState<TabType>('login');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [socialLogins, setSocialLogins] = useState<SocialLoginState>({
    google: true,
    apple: false,
    kakao: false,
    facebook: false,
  });

  const toggleSocialLogin = (provider: keyof SocialLoginState) => {
    setSocialLogins((prev) => ({
      ...prev,
      [provider]: !prev[provider],
    }));
  };

  // Mock user email
  const userEmail = 'gildong@gmail.com';

  const handleChangePassword = () => {
    if (!newPassword || !confirmPassword) {
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }

    // Password change success
    setError('');
    setNewPassword('');
    setConfirmPassword('');
    setShowToast(true);

    // Hide toast after 3 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const isButtonDisabled = !newPassword || !confirmPassword;
  const hasError = error && confirmPassword;

  // Read-only field style
  const readOnlyFieldClass =
    'px-4 py-3 bg-[hsl(var(--snug-light-gray))]/50 rounded-3xl text-sm text-[hsl(var(--snug-text-primary))]';

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Logo */}
      <Header showLogo />

      <div className="flex">
        {/* Sidebar - Desktop only */}
        <div className="hidden lg:block w-[260px] flex-shrink-0 px-6 py-8 border-r border-[hsl(var(--snug-border))]">
          <MypageSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex justify-center py-8 px-6">
          <div className="w-full max-w-[560px]">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-xl font-bold text-[hsl(var(--snug-text-primary))] mb-1">
                {t('title')}
              </h1>
              <p className="text-sm text-[hsl(var(--snug-gray))]">{t('subtitle')}</p>
            </div>

            {/* Tabs */}
            <div className="mb-8">
              <div className="flex">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === 'login'
                      ? 'text-[hsl(var(--snug-text-primary))] border-[hsl(var(--snug-orange))]'
                      : 'text-[hsl(var(--snug-gray))] border-[hsl(var(--snug-border))]'
                  }`}
                >
                  {t('loginTab')}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('social')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === 'social'
                      ? 'text-[hsl(var(--snug-text-primary))] border-[hsl(var(--snug-orange))]'
                      : 'text-[hsl(var(--snug-gray))] border-[hsl(var(--snug-border))]'
                  }`}
                >
                  {t('socialTab')}
                </button>
              </div>
            </div>

            {/* Login Tab Content */}
            {activeTab === 'login' && (
              <div className="space-y-5">
                {/* Email address - Read only */}
                <div>
                  <label className="block text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-2">
                    {t('emailAddress')}
                  </label>
                  <div className={readOnlyFieldClass}>{userEmail}</div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-2">
                    {t('newPassword')}
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setError('');
                      }}
                      placeholder={t('passwordPlaceholder')}
                      className="w-full px-4 py-3 pr-20 border border-[hsl(var(--snug-border))] rounded-3xl text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="text-[hsl(var(--snug-gray))] hover:text-[hsl(var(--snug-text-primary))]"
                      >
                        {showNewPassword ? (
                          <Eye className="w-5 h-5" />
                        ) : (
                          <EyeOff className="w-5 h-5" />
                        )}
                      </button>
                      {newPassword && (
                        <button
                          type="button"
                          onClick={() => setNewPassword('')}
                          className="text-[hsl(var(--snug-gray))] hover:text-[hsl(var(--snug-text-primary))]"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-2">
                    {t('confirmPassword')}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError('');
                      }}
                      placeholder={t('passwordPlaceholder')}
                      className={`w-full px-4 py-3 pr-20 border rounded-3xl text-sm focus:outline-none ${
                        hasError
                          ? 'border-red-500 bg-red-50 focus:border-red-500'
                          : 'border-[hsl(var(--snug-border))] focus:border-[hsl(var(--snug-orange))]'
                      }`}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-[hsl(var(--snug-gray))] hover:text-[hsl(var(--snug-text-primary))]"
                      >
                        {showConfirmPassword ? (
                          <Eye className="w-5 h-5" />
                        ) : (
                          <EyeOff className="w-5 h-5" />
                        )}
                      </button>
                      {confirmPassword && (
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmPassword('');
                            setError('');
                          }}
                          className="text-[hsl(var(--snug-gray))] hover:text-[hsl(var(--snug-text-primary))]"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                  {hasError && <p className="mt-2 text-sm text-red-500">{error}</p>}
                </div>

                {/* Change Password Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleChangePassword}
                    disabled={isButtonDisabled}
                    className={`px-8 py-3 rounded-2xl text-sm font-medium transition-all ${
                      isButtonDisabled
                        ? 'bg-[hsl(var(--snug-light-gray))] text-[hsl(var(--snug-gray))] cursor-not-allowed'
                        : 'bg-[hsl(var(--snug-orange))] text-white hover:opacity-90'
                    }`}
                  >
                    {t('changePassword')}
                  </button>
                </div>
              </div>
            )}

            {/* Social Logins Tab Content */}
            {activeTab === 'social' && (
              <div className="divide-y divide-[hsl(var(--snug-border))]">
                {/* Google */}
                <div className="flex items-center py-4">
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 24 24" className="w-6 h-6">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  </div>
                  <span className="flex-1 text-center text-sm text-[hsl(var(--snug-text-primary))]">
                    {t('continueWithGoogle')}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleSocialLogin('google')}
                    className={`relative w-[48px] h-[26px] rounded-full transition-colors flex-shrink-0 ${
                      socialLogins.google
                        ? 'bg-[hsl(var(--snug-orange))]'
                        : 'bg-[hsl(var(--snug-light-gray))]'
                    }`}
                  >
                    <span
                      className={`absolute top-[3px] left-[3px] w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
                        socialLogins.google ? 'translate-x-[22px]' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Apple */}
                <div className="flex items-center py-4">
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                    </svg>
                  </div>
                  <span className="flex-1 text-center text-sm text-[hsl(var(--snug-text-primary))]">
                    {t('continueWithApple')}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleSocialLogin('apple')}
                    className={`relative w-[48px] h-[26px] rounded-full transition-colors flex-shrink-0 ${
                      socialLogins.apple
                        ? 'bg-[hsl(var(--snug-orange))]'
                        : 'bg-[hsl(var(--snug-light-gray))]'
                    }`}
                  >
                    <span
                      className={`absolute top-[3px] left-[3px] w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
                        socialLogins.apple ? 'translate-x-[22px]' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* KakaoTalk */}
                <div className="flex items-center py-4">
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 24 24" className="w-6 h-6">
                      <path
                        fill="#3C1E1E"
                        d="M12 3C6.48 3 2 6.58 2 11c0 2.83 1.89 5.31 4.68 6.72l-.95 3.53c-.08.3.26.54.52.37l4.17-2.74c.51.07 1.04.12 1.58.12 5.52 0 10-3.58 10-8s-4.48-8-10-8z"
                      />
                    </svg>
                  </div>
                  <span className="flex-1 text-center text-sm text-[hsl(var(--snug-text-primary))]">
                    {t('continueWithKakao')}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleSocialLogin('kakao')}
                    className={`relative w-[48px] h-[26px] rounded-full transition-colors flex-shrink-0 ${
                      socialLogins.kakao
                        ? 'bg-[hsl(var(--snug-orange))]'
                        : 'bg-[hsl(var(--snug-light-gray))]'
                    }`}
                  >
                    <span
                      className={`absolute top-[3px] left-[3px] w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
                        socialLogins.kakao ? 'translate-x-[22px]' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Facebook */}
                <div className="flex items-center py-4">
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 24 24" className="w-6 h-6">
                      <path
                        fill="#1877F2"
                        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                      />
                    </svg>
                  </div>
                  <span className="flex-1 text-center text-sm text-[hsl(var(--snug-text-primary))]">
                    {t('continueWithFacebook')}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleSocialLogin('facebook')}
                    className={`relative w-[48px] h-[26px] rounded-full transition-colors flex-shrink-0 ${
                      socialLogins.facebook
                        ? 'bg-[hsl(var(--snug-orange))]'
                        : 'bg-[hsl(var(--snug-light-gray))]'
                    }`}
                  >
                    <span
                      className={`absolute top-[3px] left-[3px] w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
                        socialLogins.facebook ? 'translate-x-[22px]' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-[#3D3D3D] text-white text-sm rounded-lg shadow-lg">
          {t('passwordChanged')}
        </div>
      )}
    </div>
  );
}
