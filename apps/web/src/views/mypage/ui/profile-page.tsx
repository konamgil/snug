'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Camera, ChevronDown, User } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
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
  { code: '+82', label: '+82 (South Korea)' },
  { code: '+1', label: '+1 (USA)' },
  { code: '+86', label: '+86 (China)' },
  { code: '+81', label: '+81 (Japan)' },
  { code: '+84', label: '+84 (Vietnam)' },
];

export function ProfilePage() {
  const t = useTranslations('mypage.profile');
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
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
    aboutMe:
      "Hi, I'm Hong Gil-dong. I always keep things clean and tidy. Looking forward to staying at your place!",
    purposeOfStay: 'work',
    email: 'gildong@gmail.com',
    countryCode: '+82',
    phone: '010-1234-5678',
    phoneVerified: true,
    passportNumber: 'M 123456',
  });

  const [editedProfile, setEditedProfile] = useState<ProfileData>(profile);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

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
    setIsEditing(false);
    setShowCountryDropdown(false);
  };

  const handleEdit = () => {
    setEditedProfile(profile);
    setIsEditing(true);
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

  const getCountryLabel = (code: string) => {
    const country = COUNTRY_CODES.find((c) => c.code === code);
    return country ? country.label : code;
  };

  const getPurposeLabel = (value: string) => {
    const purpose = purposeOptions.find((p) => p.value === value);
    return purpose ? purpose.label : '';
  };

  // Read-only field style
  const readOnlyFieldClass =
    'px-4 py-3 bg-[hsl(var(--snug-light-gray))]/50 rounded-3xl text-sm text-[hsl(var(--snug-text-primary))]';

  return (
    <div className="min-h-screen bg-white">
      {/* PC Header with Logo */}
      <div className="hidden md:block">
        <Header showLogo />
      </div>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-5 py-4">
        <button type="button" onClick={() => router.back()} className="p-1" aria-label="Back">
          <ArrowLeft className="w-6 h-6 text-[hsl(var(--snug-text-primary))]" />
        </button>
        {isEditing ? (
          <button
            type="button"
            onClick={handleSave}
            className="text-base font-extrabold text-[hsl(var(--snug-text-primary))]"
          >
            {t('save')}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleEdit}
            className="text-base font-extrabold text-[hsl(var(--snug-text-primary))]"
          >
            {t('edit')}
          </button>
        )}
      </header>

      <div className="flex">
        {/* Sidebar - Desktop only, fixed to left */}
        <div className="hidden lg:block w-[260px] flex-shrink-0 px-6 py-8 border-r border-[hsl(var(--snug-border))]">
          <MypageSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex justify-center py-6 px-5 md:py-8 md:px-6">
          <div className="w-full max-w-[560px]">
            {/* Page Header */}
            <div className="mb-6 md:mb-8">
              <h1 className="text-lg md:text-xl font-bold text-[hsl(var(--snug-text-primary))] mb-1">
                {t('title')}
              </h1>
              <p className="text-sm text-[hsl(var(--snug-gray))]">{t('subtitle')}</p>
            </div>

            {/* Profile Photo */}
            <div className="mb-6 md:mb-8">
              <div className="relative inline-block">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-[hsl(var(--snug-light-gray))] flex items-center justify-center border border-[hsl(var(--snug-border))]">
                  <User className="w-8 h-8 text-[hsl(var(--snug-gray))]" strokeWidth={1} />
                </div>
                {isEditing && (
                  <button
                    type="button"
                    className="absolute -top-1 -right-1 w-6 h-6 bg-white border border-[hsl(var(--snug-border))] rounded-full flex items-center justify-center text-[hsl(var(--snug-gray))]"
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-2">
                  {t('name')}
                </label>
                {isEditing ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={editedProfile.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder={t('firstName')}
                        className="px-4 py-3 border border-[hsl(var(--snug-border))] rounded-3xl text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                      />
                      <input
                        type="text"
                        value={editedProfile.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder={t('lastName')}
                        className="px-4 py-3 border border-[hsl(var(--snug-border))] rounded-3xl text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                      />
                    </div>
                    <p className="mt-2 text-xs text-[hsl(var(--snug-gray))]">{t('nameHint')}</p>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div className={readOnlyFieldClass}>{profile.firstName}</div>
                    <div className={readOnlyFieldClass}>{profile.lastName}</div>
                  </div>
                )}
              </div>

              {/* About me */}
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-2">
                  {t('aboutMe')}
                </label>
                {isEditing ? (
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
                      className="w-full px-4 py-3 border border-[hsl(var(--snug-border))] rounded-[28px] text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))] resize-none"
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
                ) : (
                  <div className={`${readOnlyFieldClass} min-h-[80px]`}>
                    {profile.aboutMe || '-'}
                  </div>
                )}
              </div>

              {/* Purpose of stay */}
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-2">
                  {t('purposeOfStay')}
                </label>
                {isEditing ? (
                  <CustomSelect
                    value={editedProfile.purposeOfStay}
                    onChange={(value) => handleInputChange('purposeOfStay', value)}
                    options={purposeOptions}
                    placeholder={t('purposePlaceholder')}
                  />
                ) : (
                  <div className={readOnlyFieldClass}>
                    {getPurposeLabel(profile.purposeOfStay) || '-'}
                  </div>
                )}
              </div>

              {/* Email address - Always read only */}
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-2">
                  {t('emailAddress')}
                </label>
                <div className={readOnlyFieldClass}>{profile.email}</div>
              </div>

              {/* Phone number */}
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-2">
                  {t('phoneNumber')}
                </label>
                {isEditing ? (
                  <>
                    {/* Mobile: stacked, Desktop: row */}
                    <div className="flex flex-col md:flex-row gap-2">
                      <div className="relative w-full md:w-[180px] md:flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                          className="w-full px-4 py-3 border border-[hsl(var(--snug-border))] rounded-3xl text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))] bg-white flex items-center justify-between"
                        >
                          <span className="text-[hsl(var(--snug-text-primary))]">
                            {getCountryLabel(editedProfile.countryCode)}
                          </span>
                          <ChevronDown
                            className={`w-5 h-5 text-[hsl(var(--snug-gray))] transition-transform ${
                              showCountryDropdown ? 'rotate-180' : ''
                            }`}
                          />
                        </button>

                        {/* Country Code Dropdown */}
                        {showCountryDropdown && (
                          <div className="absolute top-full left-0 mt-2 bg-white border border-[hsl(var(--snug-border))] rounded-2xl shadow-lg p-2 min-w-[200px] z-10">
                            {COUNTRY_CODES.map((c) => (
                              <button
                                key={c.code}
                                type="button"
                                onClick={() => {
                                  handleInputChange('countryCode', c.code);
                                  setShowCountryDropdown(false);
                                }}
                                className={`w-full px-3 py-2.5 text-left text-sm hover:bg-[hsl(var(--snug-light-gray))] rounded-lg transition-colors ${
                                  editedProfile.countryCode === c.code
                                    ? 'text-[hsl(var(--snug-text-primary))] font-medium'
                                    : 'text-[hsl(var(--snug-text-primary))]'
                                }`}
                              >
                                {c.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <input
                        type="tel"
                        value={editedProfile.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder={t('phonePlaceholder')}
                        className="w-full md:flex-1 px-4 py-3 border border-[hsl(var(--snug-border))] rounded-3xl text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                      />
                      {/* Verify button - Desktop only in row */}
                      {verificationState === 'idle' && !editedProfile.phoneVerified && (
                        <button
                          type="button"
                          onClick={handleVerify}
                          className="hidden md:block px-6 py-3 bg-[hsl(var(--snug-light-gray))] text-[hsl(var(--snug-gray))] rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                        >
                          {t('verify')}
                        </button>
                      )}
                      {/* Resend code button - Desktop only in row */}
                      {(verificationState === 'code_sent' || verificationState === 'error') && (
                        <button
                          type="button"
                          onClick={handleResendCode}
                          className="hidden md:block px-6 py-3 bg-[#5D4037] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
                        >
                          {t('resendCode')}
                        </button>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-[hsl(var(--snug-gray))]">{t('phoneHint')}</p>

                    {/* Mobile: Verify/Resend button below */}
                    {verificationState === 'idle' && !editedProfile.phoneVerified && (
                      <button
                        type="button"
                        onClick={handleVerify}
                        className="md:hidden mt-3 px-6 py-3 bg-[hsl(var(--snug-light-gray))] text-[hsl(var(--snug-gray))] rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                      >
                        {t('verify')}
                      </button>
                    )}
                    {(verificationState === 'code_sent' || verificationState === 'error') && (
                      <button
                        type="button"
                        onClick={handleResendCode}
                        className="md:hidden mt-3 px-6 py-3 bg-[#5D4037] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
                      >
                        {t('resendCode')}
                      </button>
                    )}

                    {/* Verification Code Input */}
                    {(verificationState === 'code_sent' || verificationState === 'error') && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-2">
                          {t('verificationCode')}
                        </label>
                        {/* Mobile: stacked, Desktop: row */}
                        <div className="flex flex-col md:flex-row gap-2">
                          <div className="relative flex-1">
                            <input
                              type="text"
                              value={verificationCode}
                              onChange={(e) =>
                                setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                              }
                              placeholder={t('enterCode')}
                              className="w-full px-4 py-3 border border-[hsl(var(--snug-border))] rounded-3xl text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[hsl(var(--snug-gray))]">
                              {formatTime(timer)}
                            </span>
                          </div>
                          {/* Desktop: Confirm in row */}
                          <button
                            type="button"
                            onClick={handleConfirmVerification}
                            className="hidden md:block px-6 py-3 bg-[#5D4037] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
                          >
                            {t('confirm')}
                          </button>
                        </div>
                        {/* Error message */}
                        {verificationState === 'error' && (
                          <p className="mt-2 text-sm text-red-500">{t('verificationError')}</p>
                        )}
                        {/* Mobile: Confirm button below */}
                        <button
                          type="button"
                          onClick={handleConfirmVerification}
                          className="md:hidden mt-3 px-6 py-3 bg-[#5D4037] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
                        >
                          {t('confirm')}
                        </button>
                      </div>
                    )}

                    {/* Success State */}
                    {verificationState === 'success' && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
                        <svg
                          className="w-4 h-4"
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
                        <span>{t('verificationSuccess')}</span>
                      </div>
                    )}

                    {editedProfile.phoneVerified && verificationState === 'idle' && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                        <svg
                          className="w-4 h-4"
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
                        <span>{t('verified')}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Mobile: stacked, Desktop: row */}
                    <div className="flex flex-col md:flex-row gap-2 md:gap-3">
                      <div className={`${readOnlyFieldClass} w-full md:w-[180px] md:flex-shrink-0`}>
                        {getCountryLabel(profile.countryCode)}
                      </div>
                      <div className={`${readOnlyFieldClass} w-full md:flex-1`}>
                        {profile.phone || '-'}
                      </div>
                    </div>
                    {profile.phoneVerified && (
                      <p className="mt-2 text-xs text-[hsl(var(--snug-gray))]">{t('verified')}</p>
                    )}
                  </>
                )}
              </div>

              {/* Passport number */}
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-2">
                  {t('passportNumber')}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.passportNumber}
                    onChange={(e) => handleInputChange('passportNumber', e.target.value)}
                    placeholder={t('passportPlaceholder')}
                    className="w-full px-4 py-3 border border-[hsl(var(--snug-border))] rounded-3xl text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                  />
                ) : (
                  <div className={readOnlyFieldClass}>{profile.passportNumber || '-'}</div>
                )}
              </div>

              {/* Save/Edit Button - PC only */}
              <div className="hidden md:block pt-4">
                {isEditing ? (
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-8 py-3 bg-[hsl(var(--snug-orange))] text-white rounded-2xl text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    {t('save')}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="px-8 py-3 border border-[hsl(var(--snug-border))] text-[hsl(var(--snug-text-primary))] rounded-2xl text-sm font-medium hover:bg-[hsl(var(--snug-light-gray))] transition-colors"
                  >
                    {t('edit')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showCountryDropdown && (
        <div className="fixed inset-0 z-0" onClick={() => setShowCountryDropdown(false)} />
      )}
    </div>
  );
}
