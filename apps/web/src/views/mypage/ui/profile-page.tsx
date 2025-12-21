'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Camera, ChevronDown, X, User } from 'lucide-react';
import { Header } from '@/widgets/header';
import { CustomSelect, type SelectOption } from '@/shared/ui';
import { MypageSidebar } from './mypage-sidebar';

type VerificationState = 'idle' | 'code_sent' | 'success' | 'error';

interface ProfileData {
  firstName: string;
  lastName: string;
  aboutMe: string;
  purposeOfStay: string;
  email: string;
  countryCode: string;
  phone: string;
  phoneVerified: boolean;
  passportNumber: string;
}

const ABOUT_ME_MAX_LENGTH = 100;

const COUNTRY_CODES = [
  { code: '+82', label: '(+82) South Korea' },
  { code: '+1', label: '(+1) USA' },
  { code: '+86', label: '(+86) China' },
  { code: '+81', label: '(+81) Japan' },
  { code: '+84', label: '(+84) Vietnam' },
];

export function ProfilePage() {
  const t = useTranslations('mypage.profile');
  const [verificationState, setVerificationState] = useState<VerificationState>('idle');
  const [verificationCode, setVerificationCode] = useState('');
  const [timer, setTimer] = useState(180);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Purpose options with translations
  const purposeOptions: SelectOption[] = useMemo(
    () => [
      { value: 'work', label: t('purposeWork') },
      { value: 'study', label: t('purposeStudy') },
      { value: 'business', label: t('purposeBusiness') },
      { value: 'family', label: t('purposeFamily') },
      { value: 'tourism', label: t('purposeTourism') },
      { value: 'medical', label: t('purposeMedical') },
      { value: 'other', label: t('purposeOther') },
    ],
    [t],
  );

  // Mock profile data
  const [profile, setProfile] = useState<ProfileData>({
    firstName: 'Gildong',
    lastName: 'Hong',
    aboutMe: '',
    purposeOfStay: '',
    email: 'gildong@gmail.com',
    countryCode: '+82',
    phone: '',
    phoneVerified: false,
    passportNumber: '',
  });

  const [editedProfile, setEditedProfile] = useState<ProfileData>(profile);

  // Timer effect
  useEffect(() => {
    if (!isTimerActive) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setTimeout(() => {
            setIsTimerActive(false);
            setVerificationState('idle');
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSave = () => {
    setProfile(editedProfile);
  };

  const handleVerify = () => {
    setVerificationState('code_sent');
    setTimer(180);
    setIsTimerActive(true);
  };

  const handleConfirmVerification = () => {
    if (verificationCode === '123456') {
      setVerificationState('success');
      setIsTimerActive(false);
      setEditedProfile((prev) => ({ ...prev, phoneVerified: true }));
    } else {
      setVerificationState('error');
    }
  };

  const handleResendCode = () => {
    setTimer(180);
    setIsTimerActive(true);
    setVerificationCode('');
    setVerificationState('code_sent');
  };

  const handleInputChange = useCallback((field: keyof ProfileData, value: string) => {
    setEditedProfile((prev) => ({ ...prev, [field]: value }));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Logo */}
      <Header showLogo />

      <div className="flex">
        {/* Sidebar - Desktop only, fixed to left */}
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

            {/* Profile Photo */}
            <div className="mb-8">
              <div className="relative inline-block">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-[hsl(var(--snug-light-gray))] flex items-center justify-center border border-[hsl(var(--snug-border))]">
                  <User className="w-8 h-8 text-[hsl(var(--snug-gray))]" strokeWidth={1} />
                </div>
                <button
                  type="button"
                  className="absolute -top-1 -right-1 w-6 h-6 bg-white border border-[hsl(var(--snug-border))] rounded-full flex items-center justify-center text-[hsl(var(--snug-gray))]"
                >
                  <Camera className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-2">
                  {t('name')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={editedProfile.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder={t('firstName')}
                    className="px-4 py-3 border border-[hsl(var(--snug-border))] rounded-xl text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                  />
                  <input
                    type="text"
                    value={editedProfile.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder={t('lastName')}
                    className="px-4 py-3 border border-[hsl(var(--snug-border))] rounded-xl text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                  />
                </div>
                <p className="mt-2 text-xs text-[hsl(var(--snug-gray))]">{t('nameHint')}</p>
              </div>

              {/* About me - Textarea with character count */}
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-2">
                  {t('aboutMe')}
                </label>
                <div className="relative">
                  <textarea
                    value={editedProfile.aboutMe}
                    onChange={(e) => {
                      if (e.target.value.length <= ABOUT_ME_MAX_LENGTH) {
                        handleInputChange('aboutMe', e.target.value);
                      }
                    }}
                    placeholder={t('aboutMePlaceholder')}
                    rows={3}
                    className="w-full px-4 py-3 border border-[hsl(var(--snug-border))] rounded-xl text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))] resize-none"
                  />
                  <span className="absolute bottom-3 right-4 text-xs text-[hsl(var(--snug-gray))]">
                    <span
                      className={
                        editedProfile.aboutMe.length >= ABOUT_ME_MAX_LENGTH
                          ? 'text-[hsl(var(--snug-orange))]'
                          : ''
                      }
                    >
                      {editedProfile.aboutMe.length}
                    </span>
                    {' / '}
                    {ABOUT_ME_MAX_LENGTH}
                  </span>
                </div>
              </div>

              {/* Purpose of stay - Custom Select */}
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-2">
                  {t('purposeOfStay')}
                </label>
                <CustomSelect
                  value={editedProfile.purposeOfStay}
                  onChange={(value) => handleInputChange('purposeOfStay', value)}
                  options={purposeOptions}
                  placeholder={t('purposePlaceholder')}
                />
              </div>

              {/* Email address - Read only */}
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-2">
                  {t('emailAddress')}
                </label>
                <div className="px-4 py-3 border border-[hsl(var(--snug-border))] rounded-xl text-sm text-[hsl(var(--snug-text-primary))] bg-[hsl(var(--snug-light-gray))]/30">
                  {profile.email}
                </div>
              </div>

              {/* Phone number */}
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-2">
                  {t('phoneNumber')}
                </label>
                <div className="flex gap-2">
                  <div className="relative w-[180px] flex-shrink-0">
                    <select
                      value={editedProfile.countryCode}
                      onChange={(e) => handleInputChange('countryCode', e.target.value)}
                      className="w-full px-4 py-3 border border-[hsl(var(--snug-border))] rounded-xl text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))] appearance-none bg-white"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--snug-gray))] pointer-events-none" />
                  </div>
                  <input
                    type="tel"
                    value={editedProfile.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder={t('phonePlaceholder')}
                    className="flex-1 px-4 py-3 border border-[hsl(var(--snug-border))] rounded-xl text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                  />
                  {verificationState === 'idle' && !editedProfile.phoneVerified && (
                    <button
                      type="button"
                      onClick={handleVerify}
                      className="px-6 py-3 bg-[hsl(var(--snug-light-gray))] text-[hsl(var(--snug-gray))] rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      {t('verify')}
                    </button>
                  )}
                </div>
                <p className="mt-2 text-xs text-[hsl(var(--snug-gray))]">{t('phoneHint')}</p>

                {/* Verification Code Input */}
                {verificationState === 'code_sent' && (
                  <div className="mt-3 space-y-3">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={verificationCode}
                          onChange={(e) =>
                            setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                          }
                          placeholder={t('enterCode')}
                          className="w-full px-4 py-3 border border-[hsl(var(--snug-border))] rounded-xl text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[hsl(var(--snug-orange))]">
                          {formatTime(timer)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleConfirmVerification}
                        className="px-6 py-3 bg-[hsl(var(--snug-orange))] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
                      >
                        {t('confirm')}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleResendCode}
                      className="text-sm text-[hsl(var(--snug-gray))] underline"
                    >
                      {t('resendCode')}
                    </button>
                  </div>
                )}

                {/* Success State */}
                {verificationState === 'success' && (
                  <div className="mt-3 flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-sm text-green-700">{t('verificationSuccess')}</span>
                  </div>
                )}

                {/* Error State */}
                {verificationState === 'error' && (
                  <div className="mt-3 flex items-center justify-between px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center gap-2">
                      <X className="w-5 h-5 text-red-500" />
                      <span className="text-sm text-red-700">{t('verificationError')}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleResendCode}
                      className="text-sm text-red-600 underline"
                    >
                      {t('tryAgain')}
                    </button>
                  </div>
                )}

                {editedProfile.phoneVerified && verificationState === 'idle' && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>{t('verified')}</span>
                  </div>
                )}
              </div>

              {/* Passport number */}
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-2">
                  {t('passportNumber')}
                </label>
                <input
                  type="text"
                  value={editedProfile.passportNumber}
                  onChange={(e) => handleInputChange('passportNumber', e.target.value)}
                  placeholder={t('passportPlaceholder')}
                  className="w-full px-4 py-3 border border-[hsl(var(--snug-border))] rounded-xl text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                />
              </div>

              {/* Save Button */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-8 py-3 bg-[hsl(var(--snug-orange))] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  {t('save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
