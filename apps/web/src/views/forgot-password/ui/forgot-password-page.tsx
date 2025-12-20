'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import { Link } from '@/i18n/navigation';

type TabType = 'findId' | 'findPassword';

const COUNTRY_CODES = [
  { code: '+82', country: 'South Korea' },
  { code: '+1', country: 'USA' },
  { code: '+81', country: 'Japan' },
  { code: '+86', country: 'China' },
  { code: '+44', country: 'UK' },
];

export function ForgotPasswordPage() {
  const t = useTranslations('auth.forgotPassword');
  const [activeTab, setActiveTab] = useState<TabType>('findId');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [countryCode, setCountryCode] = useState('+82');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const selectedCountry = COUNTRY_CODES.find((c) => c.code === countryCode);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'findId') {
      console.log('Find ID:', { firstName, lastName, countryCode, phoneNumber });
    } else {
      console.log('Find Password:', { email });
    }
  };

  const tabBaseClass = 'flex-1 py-3 text-sm font-medium transition-colors';
  const tabActiveClass =
    'text-[hsl(var(--snug-text-primary))] border-b-2 border-[hsl(var(--snug-orange))]';
  const tabInactiveClass = 'text-[hsl(var(--snug-gray))]';
  const inputClass =
    'px-4 py-3 border border-[hsl(var(--snug-border))] rounded-lg text-sm text-[hsl(var(--snug-text-primary))] placeholder:text-[hsl(var(--snug-gray))] focus:outline-none focus:border-[hsl(var(--snug-orange))] transition-colors';

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1 flex flex-col items-center justify-center px-5 py-8">
        {/* Welcome Logo */}
        <div className="mb-8">
          <Image
            src="/images/logo/logo-welcome-snug.png"
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
            onClick={() => setActiveTab('findId')}
            className={[
              tabBaseClass,
              activeTab === 'findId' ? tabActiveClass : tabInactiveClass,
            ].join(' ')}
          >
            {t('findId')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('findPassword')}
            className={[
              tabBaseClass,
              activeTab === 'findPassword' ? tabActiveClass : tabInactiveClass,
            ].join(' ')}
          >
            {t('findPassword')}
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="w-full max-w-[420px] space-y-3">
          {activeTab === 'findId' ? (
            <>
              {/* Name Row */}
              <div className="flex gap-3">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={t('firstName')}
                  className={['flex-1', inputClass].join(' ')}
                />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={t('lastName')}
                  className={['flex-1', inputClass].join(' ')}
                />
              </div>

              {/* Phone Row */}
              <div className="flex gap-3">
                {/* Country Code Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="flex items-center gap-2 px-4 py-3 border border-[hsl(var(--snug-border))] rounded-lg text-sm text-[hsl(var(--snug-text-primary))] hover:border-[hsl(var(--snug-gray))] transition-colors min-w-[160px]"
                  >
                    <span>
                      ({countryCode}) {selectedCountry?.country}
                    </span>
                    <ChevronDown className="w-4 h-4 ml-auto" />
                  </button>
                  {showCountryDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-[hsl(var(--snug-border))] rounded-lg shadow-lg z-10">
                      {COUNTRY_CODES.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => {
                            setCountryCode(country.code);
                            setShowCountryDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-[hsl(var(--snug-light-gray))] transition-colors first:rounded-t-lg last:rounded-b-lg"
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
            </>
          ) : (
            /* Find Password - Email Input */
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('email')}
              className={['w-full', inputClass].join(' ')}
            />
          )}

          {/* Continue Button */}
          <button
            type="submit"
            className="w-full py-4 bg-[hsl(var(--snug-orange))] text-white text-base font-medium rounded-full hover:bg-[hsl(var(--snug-orange))]/90 active:scale-[0.98] transition-all mt-6"
          >
            {t('continue')}
          </button>
        </form>

        {/* Back to Login Link */}
        <Link href="/login" className="mt-6 text-sm text-[hsl(var(--snug-gray))] underline">
          {t('backToLogin')}
        </Link>
      </main>
    </div>
  );
}
