'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import { Header } from '@/widgets/header';
import { MypageSidebar } from './mypage-sidebar';

interface LanguageOption {
  code: string;
  label: string;
  country: string;
}

interface CurrencyOption {
  code: string;
  name: string;
}

export function SettingsPage() {
  const t = useTranslations('mypage.settings');
  const [isHostMode] = useState(false); // This would come from user context/state

  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [aiAutoResponder, setAiAutoResponder] = useState(true);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  const languages: LanguageOption[] = [
    { code: 'ko', label: '한국어', country: '대한민국' },
    { code: 'en', label: 'English', country: 'United States' },
    { code: 'ja', label: '日本語', country: '日本' },
    { code: 'zh', label: '简体中文', country: '中国' },
    { code: 'vi', label: 'Tiếng Việt', country: 'Việt Nam' },
  ];

  const currencies: CurrencyOption[] = [
    { code: 'KRW', name: 'South Korean won' },
    { code: 'USD', name: 'United States dollar' },
    { code: 'JPY', name: 'Japanese yen' },
    { code: 'CNY', name: 'Chinese Yuan' },
    { code: 'EUR', name: 'Euro' },
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
              <h1 className="text-xl font-bold text-[hsl(var(--snug-text-primary))]">
                {t('title')}
              </h1>
            </div>

            {/* Settings Content */}
            <div className="space-y-8">
              {/* AI Auto-Responder - Host Mode Only */}
              {isHostMode && (
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-[hsl(var(--snug-text-primary))]">
                      {t('aiAutoResponder')}
                    </h3>
                    <p className="text-sm text-[hsl(var(--snug-gray))] mt-1 max-w-[400px]">
                      {t('aiAutoResponderDesc')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAiAutoResponder(!aiAutoResponder)}
                    className={`relative w-[48px] h-[26px] rounded-full transition-colors flex-shrink-0 ${
                      aiAutoResponder
                        ? 'bg-[hsl(var(--snug-orange))]'
                        : 'bg-[hsl(var(--snug-border))]'
                    }`}
                  >
                    <span
                      className={`absolute top-[3px] left-[3px] w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
                        aiAutoResponder ? 'translate-x-[22px]' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              )}

              {/* Preferred Language */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[hsl(var(--snug-text-primary))]">
                    {t('preferredLanguage')}
                  </h3>
                  <p className="text-sm text-[hsl(var(--snug-gray))] mt-1">
                    {t('preferredLanguageDesc')}
                  </p>
                </div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowLanguageDropdown(!showLanguageDropdown);
                      setShowCurrencyDropdown(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 border border-[hsl(var(--snug-border))] rounded-full hover:border-[hsl(var(--snug-gray))] transition-colors min-w-[180px] justify-between"
                  >
                    <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                      {getSelectedLanguageLabel()}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[hsl(var(--snug-gray))] transition-transform ${
                        showLanguageDropdown ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Language Dropdown */}
                  {showLanguageDropdown && (
                    <div className="absolute top-full right-0 mt-2 bg-white border border-[hsl(var(--snug-border))] rounded-2xl shadow-lg p-2 min-w-[200px] z-10">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => {
                            setSelectedLanguage(lang.code);
                            setShowLanguageDropdown(false);
                          }}
                          className={`w-full px-3 py-2.5 text-left text-sm hover:bg-[hsl(var(--snug-light-gray))] rounded-lg transition-colors ${
                            selectedLanguage === lang.code
                              ? 'text-[hsl(var(--snug-text-primary))] font-medium'
                              : 'text-[hsl(var(--snug-text-primary))]'
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
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[hsl(var(--snug-text-primary))]">
                    {t('preferredCurrency')}
                  </h3>
                  <p className="text-sm text-[hsl(var(--snug-gray))] mt-1">
                    {t('preferredCurrencyDesc')}
                  </p>
                </div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCurrencyDropdown(!showCurrencyDropdown);
                      setShowLanguageDropdown(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 border border-[hsl(var(--snug-border))] rounded-full hover:border-[hsl(var(--snug-gray))] transition-colors min-w-[200px] justify-between"
                  >
                    <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                      {getSelectedCurrencyLabel()}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[hsl(var(--snug-gray))] transition-transform ${
                        showCurrencyDropdown ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Currency Dropdown */}
                  {showCurrencyDropdown && (
                    <div className="absolute top-full right-0 mt-2 bg-white border border-[hsl(var(--snug-border))] rounded-2xl shadow-lg p-2 min-w-[220px] z-10">
                      {currencies.map((currency) => (
                        <button
                          key={currency.code}
                          type="button"
                          onClick={() => {
                            setSelectedCurrency(currency.code);
                            setShowCurrencyDropdown(false);
                          }}
                          className={`w-full px-3 py-2.5 text-left text-sm hover:bg-[hsl(var(--snug-light-gray))] rounded-lg transition-colors ${
                            selectedCurrency === currency.code
                              ? 'text-[hsl(var(--snug-text-primary))] font-medium'
                              : 'text-[hsl(var(--snug-text-primary))]'
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
    </div>
  );
}
