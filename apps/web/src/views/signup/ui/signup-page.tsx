'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Eye, EyeOff, X, ChevronDown } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';

const COUNTRY_CODES = [
  { code: '+82', country: 'South Korea' },
  { code: '+1', country: 'USA' },
  { code: '+81', country: 'Japan' },
  { code: '+86', country: 'China' },
  { code: '+44', country: 'UK' },
];

interface FloatingInputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  showPasswordToggle?: boolean;
  showClear?: boolean;
}

function FloatingInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  hint,
  showPasswordToggle,
  showClear,
}: FloatingInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isFloating = isFocused || value.length > 0;

  const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;
  const hasRightElements = showPasswordToggle || (showClear && value);

  const borderClass = error
    ? 'border-red-500'
    : isFocused
      ? 'border-[hsl(var(--snug-orange))]'
      : 'border-[hsl(var(--snug-border))]';

  const labelClass = isFloating
    ? 'top-2 text-xs text-[hsl(var(--snug-gray))]'
    : 'top-1/2 -translate-y-1/2 text-sm text-[hsl(var(--snug-gray))]';

  return (
    <div>
      <div className={`relative border rounded-2xl transition-colors ${borderClass}`}>
        <label
          htmlFor={id}
          className={`absolute left-4 transition-all duration-200 pointer-events-none ${labelClass}`}
        >
          {label}
        </label>
        <input
          type={inputType}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full bg-transparent px-4 pt-6 pb-2 text-sm text-[hsl(var(--snug-text-primary))] focus:outline-none ${hasRightElements ? 'pr-20' : 'pr-4'}`}
        />
        {hasRightElements && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {showPasswordToggle && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-[hsl(var(--snug-gray))] hover:text-[hsl(var(--snug-text-primary))] transition-colors"
              >
                {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            )}
            {showClear && value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="p-1 text-[hsl(var(--snug-gray))] hover:text-[hsl(var(--snug-text-primary))] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>
      {hint && !error && <p className="mt-1.5 text-xs text-[hsl(var(--snug-gray))] px-1">{hint}</p>}
      {error && <p className="mt-1.5 text-xs text-[hsl(var(--snug-orange))] px-1">{error}</p>}
    </div>
  );
}

export function SignupPage() {
  const t = useTranslations('auth.signupPage');
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showMoreTerms, setShowMoreTerms] = useState(false);

  const selectedCountry = COUNTRY_CODES.find((c) => c.code === countryCode);

  const passwordError =
    confirmPassword && password !== confirmPassword ? t('passwordMismatch') : '';

  const isFormValid =
    email &&
    password.length >= 8 &&
    password === confirmPassword &&
    firstName &&
    lastName &&
    agreeTerms;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    console.log('Signup:', {
      email,
      password,
      firstName,
      lastName,
      countryCode,
      phoneNumber,
      agreeMarketing,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1 flex flex-col items-center px-5 py-8">
        {/* Header */}
        <div className="w-full max-w-[500px] flex items-center mb-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 -ml-2 text-[hsl(var(--snug-text-primary))] hover:bg-[hsl(var(--snug-light-gray))] rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="flex-1 text-center text-lg font-bold text-[hsl(var(--snug-text-primary))] pr-10">
            {t('title')}
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-[500px] space-y-4">
          <FloatingInput
            id="email"
            label={t('emailAddress')}
            type="email"
            value={email}
            onChange={setEmail}
          />

          <FloatingInput
            id="password"
            label={t('password')}
            value={password}
            onChange={setPassword}
            hint={t('passwordHint')}
            showPasswordToggle
            showClear
          />

          <FloatingInput
            id="confirmPassword"
            label={t('password')}
            value={confirmPassword}
            onChange={setConfirmPassword}
            error={passwordError}
            showPasswordToggle
            showClear
          />

          {/* Personal Information */}
          <div className="pt-4">
            <h2 className="text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-3">
              {t('personalInfo')}
            </h2>
            <div className="flex gap-3 mb-2">
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={t('firstName')}
                className="flex-1 px-4 py-3 border border-[hsl(var(--snug-border))] rounded-xl text-sm placeholder:text-[hsl(var(--snug-gray))] focus:outline-none focus:border-[hsl(var(--snug-orange))] transition-colors bg-[hsl(var(--snug-light-gray))]/50"
              />
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={t('lastName')}
                className="flex-1 px-4 py-3 border border-[hsl(var(--snug-border))] rounded-xl text-sm placeholder:text-[hsl(var(--snug-gray))] focus:outline-none focus:border-[hsl(var(--snug-orange))] transition-colors bg-[hsl(var(--snug-light-gray))]/50"
              />
            </div>
            <p className="text-xs text-[hsl(var(--snug-gray))] mb-4 px-1">{t('nameHint')}</p>

            <div className="flex gap-3">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  className="flex items-center gap-2 px-4 py-3 border border-[hsl(var(--snug-border))] rounded-xl text-sm text-[hsl(var(--snug-gray))] hover:border-[hsl(var(--snug-gray))] transition-colors min-w-[140px] bg-[hsl(var(--snug-light-gray))]/50"
                >
                  <span>{selectedCountry ? selectedCountry.code : t('countryCode')}</span>
                  <ChevronDown className="w-4 h-4 ml-auto" />
                </button>
                {showCountryDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-[180px] bg-white border border-[hsl(var(--snug-border))] rounded-xl shadow-lg z-10">
                    {COUNTRY_CODES.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => {
                          setCountryCode(country.code);
                          setShowCountryDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-[hsl(var(--snug-light-gray))] transition-colors first:rounded-t-xl last:rounded-b-xl"
                      >
                        {country.code} {country.country}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder={t('phoneNumber')}
                className="flex-1 px-4 py-3 border border-[hsl(var(--snug-border))] rounded-xl text-sm placeholder:text-[hsl(var(--snug-gray))] focus:outline-none focus:border-[hsl(var(--snug-orange))] transition-colors bg-[hsl(var(--snug-light-gray))]/50"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[hsl(var(--snug-border))] my-4" />

          {/* Terms Checkbox */}
          <label className="flex gap-3 cursor-pointer">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="peer sr-only"
              />
              <div className="w-5 h-5 border-2 border-[hsl(var(--snug-border))] rounded peer-checked:bg-[hsl(var(--snug-text-primary))] peer-checked:border-[hsl(var(--snug-text-primary))] transition-colors" />
              <svg
                className="absolute top-0.5 left-0.5 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm text-[hsl(var(--snug-text-primary))]">{t('agreeTerms')}</p>
              <p className="text-xs text-[hsl(var(--snug-gray))] mt-1">
                {showMoreTerms ? t('termsFullText') : t('termsPreview')}
              </p>
              <button
                type="button"
                onClick={() => setShowMoreTerms(!showMoreTerms)}
                className="text-xs text-[hsl(var(--snug-orange))] mt-1"
              >
                {showMoreTerms ? t('showLess') : t('showMore')}
              </button>
            </div>
          </label>

          {/* Marketing Checkbox */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={agreeMarketing}
                onChange={(e) => setAgreeMarketing(e.target.checked)}
                className="peer sr-only"
              />
              <div className="w-5 h-5 border-2 border-[hsl(var(--snug-border))] rounded peer-checked:bg-[hsl(var(--snug-text-primary))] peer-checked:border-[hsl(var(--snug-text-primary))] transition-colors" />
              <svg
                className="absolute top-0.5 left-0.5 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm text-[hsl(var(--snug-text-primary))]">
              {t('agreeMarketing')}
            </span>
          </label>

          {/* Continue Button */}
          <button
            type="submit"
            disabled={!isFormValid}
            className="w-full py-4 bg-[hsl(var(--snug-orange))] text-white text-base font-medium rounded-full hover:bg-[hsl(var(--snug-orange))]/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 mt-6"
          >
            {t('continue')}
          </button>
        </form>
      </main>
    </div>
  );
}
