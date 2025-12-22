'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff, X } from 'lucide-react';
import { Header } from '@/widgets/header';
import { MypageSidebar } from './mypage-sidebar';

type TabType = 'login' | 'social';

export function SecurityPage() {
  const t = useTranslations('mypage.security');
  const [activeTab, setActiveTab] = useState<TabType>('login');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);

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
        <div className="flex-1 px-6 lg:px-16 py-8">
          <div className="max-w-[560px]">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-xl font-bold text-[hsl(var(--snug-text-primary))] mb-1">
                {t('title')}
              </h1>
              <p className="text-sm text-[hsl(var(--snug-gray))]">{t('subtitle')}</p>
            </div>

            {/* Tabs */}
            <div className="mb-8">
              <div className="flex border-b border-[hsl(var(--snug-border))]">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className={`px-8 py-3 text-sm font-medium transition-colors relative ${
                    activeTab === 'login'
                      ? 'text-[hsl(var(--snug-text-primary))]'
                      : 'text-[hsl(var(--snug-gray))]'
                  }`}
                >
                  {t('loginTab')}
                  {activeTab === 'login' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[hsl(var(--snug-orange))]" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('social')}
                  className={`px-8 py-3 text-sm font-medium transition-colors relative ${
                    activeTab === 'social'
                      ? 'text-[hsl(var(--snug-text-primary))]'
                      : 'text-[hsl(var(--snug-gray))]'
                  }`}
                >
                  {t('socialTab')}
                  {activeTab === 'social' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[hsl(var(--snug-orange))]" />
                  )}
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
                    className={`px-8 py-3 rounded-lg text-sm font-medium transition-all ${
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
              <div className="py-8 text-center text-[hsl(var(--snug-gray))]">
                {t('socialLoginsComingSoon')}
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
