'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowLeft, ChevronDown, Check, AlertCircle } from 'lucide-react';
import { useRouter, usePathname } from '@/i18n/navigation';
import { Header } from '@/widgets/header';
import { MypageSidebar } from './mypage-sidebar';
import { useAuthStore } from '@/shared/stores';
import { updateProfile } from '@/shared/api/profile';
import { useCurrency } from '@/shared/providers';
import { type CurrencyCode, isValidCurrency } from '@/shared/lib';
import type { Locale } from '@/i18n/config';

interface LanguageOption {
  code: Locale;
  label: string;
  country: string;
}

interface CurrencyOption {
  code: CurrencyCode;
  name: string;
}

export function SettingsPage() {
  const t = useTranslations('mypage.settings');
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale() as Locale;
  const [isHostMode] = useState(true); // Show AI Auto-Responder toggle

  // Auth & Currency
  const user = useAuthStore((state) => state.user);
  const { setCurrency } = useCurrency();

  // State
  const [selectedLanguage, setSelectedLanguage] = useState(currentLocale);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('KRW');
  const [aiAutoResponder, setAiAutoResponder] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [_isSaving, setIsSaving] = useState(false);

  // 사용자 설정 초기화
  useEffect(() => {
    if (user?.preferredCurrency && isValidCurrency(user.preferredCurrency)) {
      setSelectedCurrency(user.preferredCurrency as CurrencyCode);
    }
  }, [user?.preferredCurrency]);

  // 토스트 표시 함수
  const showToastMessage = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleAiToggle = () => {
    if (!aiAutoResponder) {
      // 켜려고 할 때 토스트 표시
      showToastMessage('아직 준비중인 기능입니다', 'info');
    } else {
      setAiAutoResponder(false);
    }
  };

  // 통화 변경 저장
  const handleCurrencyChange = async (currencyCode: CurrencyCode) => {
    if (!user?.id) {
      showToastMessage('로그인이 필요합니다', 'error');
      return;
    }

    setSelectedCurrency(currencyCode);
    setShowCurrencyDropdown(false);
    setCurrency(currencyCode); // 전역 상태 업데이트

    // API 저장
    setIsSaving(true);
    try {
      await updateProfile(user.id, { preferredCurrency: currencyCode });
      showToastMessage('통화 설정이 저장되었습니다', 'success');
    } catch (error) {
      console.error('Failed to save currency preference:', error);
      showToastMessage('저장에 실패했습니다', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const languages: LanguageOption[] = [
    { code: 'ko', label: '한국어', country: '대한민국' },
    { code: 'en', label: 'English', country: 'United States' },
    { code: 'ja', label: '日本語', country: '日本' },
    { code: 'zh', label: '简体中文', country: '中国' },
    { code: 'vi', label: 'Tiếng Việt', country: 'Việt Nam' },
  ];

  const currencies: CurrencyOption[] = [
    { code: 'KRW', name: t('currencyKRW') },
    { code: 'USD', name: t('currencyUSD') },
    { code: 'JPY', name: t('currencyJPY') },
    { code: 'CNY', name: t('currencyCNY') },
    { code: 'EUR', name: t('currencyEUR') },
  ];

  const getSelectedLanguageLabel = () => {
    const lang = languages.find((l) => l.code === selectedLanguage);
    return lang ? `${lang.label} · ${lang.country}` : '';
  };

  const getSelectedCurrencyLabel = () => {
    const currency = currencies.find((c) => c.code === selectedCurrency);
    return currency ? `${currency.code} · ${currency.name}` : '';
  };

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
        <div className="w-6" />
      </header>

      <div className="flex">
        {/* Sidebar - Desktop only */}
        <div className="hidden lg:block w-[280px] flex-shrink-0 px-6 py-8 border-r border-[hsl(var(--snug-border))]">
          <MypageSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex justify-center py-6 px-5 md:py-8 md:px-6">
          <div className="w-full max-w-[560px]">
            {/* Page Header */}
            <div className="mb-6 md:mb-8">
              <h1 className="text-lg md:text-xl font-bold text-[hsl(var(--snug-text-primary))]">
                {t('title')}
              </h1>
            </div>

            {/* Settings Content */}
            <div className="space-y-8">
              {/* AI Auto-Responder - Host Mode Only */}
              {isHostMode && (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-[hsl(var(--snug-text-primary))]">
                      {t('aiAutoResponder')}
                    </h3>
                    <p className="text-sm text-[hsl(var(--snug-gray))] mt-1">
                      {t('aiAutoResponderDesc')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAiToggle}
                    className={`relative w-[52px] h-[28px] rounded-full transition-colors flex-shrink-0 ${
                      aiAutoResponder
                        ? 'bg-[hsl(var(--snug-orange))]'
                        : 'bg-[hsl(var(--snug-border))]'
                    }`}
                  >
                    <span
                      className={`absolute top-[2px] left-[2px] w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 ${
                        aiAutoResponder ? 'translate-x-[24px]' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              )}

              {/* Preferred Language */}
              <div>
                <h3 className="text-base font-semibold text-[hsl(var(--snug-text-primary))]">
                  {t('preferredLanguage')}
                </h3>
                <p className="text-sm text-[hsl(var(--snug-gray))] mt-1">
                  {t('preferredLanguageDesc')}
                </p>
                <div className="relative mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowLanguageDropdown(!showLanguageDropdown);
                      setShowCurrencyDropdown(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 border border-[hsl(var(--snug-border))] rounded-full hover:border-[hsl(var(--snug-gray))] transition-colors"
                  >
                    <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                      {getSelectedLanguageLabel()}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-[hsl(var(--snug-gray))] transition-transform ${
                        showLanguageDropdown ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Language Dropdown */}
                  {showLanguageDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[hsl(var(--snug-border))] rounded-2xl shadow-lg p-2 z-10">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => {
                            setSelectedLanguage(lang.code);
                            setShowLanguageDropdown(false);
                            router.replace(pathname, { locale: lang.code });
                          }}
                          className={`w-full px-3 py-2.5 text-left text-sm rounded-lg transition-colors ${
                            selectedLanguage === lang.code
                              ? 'bg-[hsl(var(--snug-light-gray))] text-[hsl(var(--snug-text-primary))]'
                              : 'text-[hsl(var(--snug-text-primary))] hover:bg-[hsl(var(--snug-light-gray))]'
                          }`}
                        >
                          {lang.label} · {lang.country}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Preferred Currency */}
              <div>
                <h3 className="text-base font-semibold text-[hsl(var(--snug-text-primary))]">
                  {t('preferredCurrency')}
                </h3>
                <p className="text-sm text-[hsl(var(--snug-gray))] mt-1">
                  {t('preferredCurrencyDesc')}
                </p>
                <div className="relative mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCurrencyDropdown(!showCurrencyDropdown);
                      setShowLanguageDropdown(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 border border-[hsl(var(--snug-border))] rounded-full hover:border-[hsl(var(--snug-gray))] transition-colors"
                  >
                    <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                      {getSelectedCurrencyLabel()}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-[hsl(var(--snug-gray))] transition-transform ${
                        showCurrencyDropdown ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Currency Dropdown */}
                  {showCurrencyDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[hsl(var(--snug-border))] rounded-2xl shadow-lg p-2 z-10">
                      {currencies.map((currency) => (
                        <button
                          key={currency.code}
                          type="button"
                          onClick={() => handleCurrencyChange(currency.code)}
                          className={`w-full px-3 py-2.5 text-left text-sm rounded-lg transition-colors ${
                            selectedCurrency === currency.code
                              ? 'bg-[hsl(var(--snug-light-gray))] text-[hsl(var(--snug-text-primary))]'
                              : 'text-[hsl(var(--snug-text-primary))] hover:bg-[hsl(var(--snug-light-gray))]'
                          }`}
                        >
                          {currency.code} · {currency.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showLanguageDropdown || showCurrencyDropdown) && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setShowLanguageDropdown(false);
            setShowCurrencyDropdown(false);
          }}
        />
      )}

      {/* Toast */}
      {showToast && (
        <div
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 text-white text-sm rounded-lg shadow-lg z-50 flex items-center gap-2 ${
            toastType === 'success'
              ? 'bg-green-600'
              : toastType === 'error'
                ? 'bg-red-600'
                : 'bg-[#3D3D3D]'
          }`}
        >
          {toastType === 'success' && <Check className="w-4 h-4" />}
          {toastType === 'error' && <AlertCircle className="w-4 h-4" />}
          {toastMessage}
        </div>
      )}
    </div>
  );
}
