'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, ChevronRight, Plus, MoreVertical, X, RotateCcw } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { Header } from '@/widgets/header';
import { MypageSidebar } from './mypage-sidebar';

interface PaymentMethod {
  id: string;
  type: 'visa' | 'mastercard';
  cardType: 'credit' | 'debit';
  lastFour: string;
  expirationDate: string;
  isDefault: boolean;
  isExpired: boolean;
}

export function PaymentPage() {
  const t = useTranslations('mypage.payment');
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Mock data
  const [recentPaymentsCount] = useState(2);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'mastercard',
      cardType: 'credit',
      lastFour: '1234',
      expirationDate: '08/2026',
      isDefault: true,
      isExpired: false,
    },
    {
      id: '2',
      type: 'visa',
      cardType: 'debit',
      lastFour: '1234',
      expirationDate: '08/2026',
      isDefault: false,
      isExpired: false,
    },
    {
      id: '3',
      type: 'mastercard',
      cardType: 'credit',
      lastFour: '1234',
      expirationDate: '07/2024',
      isDefault: false,
      isExpired: true,
    },
  ]);

  // Add Payment Modal state
  const [cardNumber, setCardNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('South Korea');

  const handleSetDefault = (id: string) => {
    setPaymentMethods((prev) =>
      prev.map((method) => ({
        ...method,
        isDefault: method.id === id,
      })),
    );
    setOpenMenuId(null);
  };

  const handleDelete = (id: string) => {
    setPaymentMethods((prev) => prev.filter((method) => method.id !== id));
    setOpenMenuId(null);
  };

  const handleResetForm = () => {
    setCardNumber('');
    setExpirationDate('');
    setCvv('');
    setZipCode('');
    setCountry('South Korea');
  };

  const handleAddPayment = () => {
    // Mock add payment
    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      type: cardNumber.startsWith('4') ? 'visa' : 'mastercard',
      cardType: 'credit',
      lastFour: cardNumber.slice(-4),
      expirationDate: expirationDate,
      isDefault: paymentMethods.length === 0,
      isExpired: false,
    };
    setPaymentMethods((prev) => [...prev, newMethod]);
    setShowAddModal(false);
    handleResetForm();
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const CardIcon = ({ type }: { type: 'visa' | 'mastercard' }) => {
    if (type === 'visa') {
      return (
        <div className="w-12 h-8 bg-white border border-[hsl(var(--snug-border))] rounded flex items-center justify-center">
          <span className="text-[#1A1F71] font-bold text-sm italic">VISA</span>
        </div>
      );
    }
    return (
      <div className="w-12 h-8 bg-[#1A1F71] rounded flex items-center justify-center">
        <div className="flex">
          <div className="w-3 h-3 rounded-full bg-[#EB001B]" />
          <div className="w-3 h-3 rounded-full bg-[#F79E1B] -ml-1" />
        </div>
      </div>
    );
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

            {/* Payment History */}
            <div className="mb-6 md:mb-8">
              <h2 className="text-base font-semibold text-[hsl(var(--snug-text-primary))] mb-3">
                {t('paymentHistory')}
              </h2>
              <button
                type="button"
                onClick={() => router.push('/mypage/payment/history')}
                className="flex items-center justify-between w-auto px-5 py-3 border border-[hsl(var(--snug-border))] rounded-full hover:bg-gray-50 active:bg-gray-100 active:scale-[0.98] transition-all duration-150"
              >
                <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                  {t('recentPayments')}
                </span>
                <div className="flex items-center gap-2 ml-8">
                  <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                    {recentPaymentsCount}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
                </div>
              </button>
            </div>

            {/* Payment Method */}
            <div>
              <h2 className="text-base font-semibold text-[hsl(var(--snug-text-primary))] mb-3">
                {t('paymentMethod')}
              </h2>

              {paymentMethods.length === 0 ? (
                /* Empty State */
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="w-full py-16 border-2 border-dashed border-[hsl(var(--snug-border))] rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-[hsl(var(--snug-gray))] active:scale-[0.99] transition-all duration-150"
                >
                  <p className="text-sm text-[hsl(var(--snug-gray))] text-center">
                    {t('noPaymentMethod')}
                    <br />
                    {t('pleaseAddOne')}
                  </p>
                  <Plus className="w-6 h-6 text-[hsl(var(--snug-gray))]" />
                </button>
              ) : (
                /* Payment Methods List */
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="flex items-center justify-between gap-2 p-4 border border-[hsl(var(--snug-border))] rounded-3xl"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <CardIcon type={method.type} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-[hsl(var(--snug-text-primary))]">
                              {method.type === 'mastercard' ? 'Mastercard' : 'Visa'} (
                              {method.cardType === 'credit' ? t('creditCard') : t('debitCard')} •{' '}
                              {method.lastFour})
                            </span>
                            {method.isDefault && (
                              <span className="text-xs font-bold text-[hsl(var(--snug-orange))] bg-[hsl(var(--snug-orange))]/10 px-2 py-0.5 rounded-full flex-shrink-0">
                                {t('default')}
                              </span>
                            )}
                          </div>
                          <span
                            className={`text-xs ${method.isExpired ? 'text-red-500' : 'text-[hsl(var(--snug-gray))]'}`}
                          >
                            {t('expirationDate')}: {method.expirationDate}
                          </span>
                        </div>
                      </div>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setOpenMenuId(openMenuId === method.id ? null : method.id)}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <MoreVertical className="w-5 h-5 text-[hsl(var(--snug-gray))]" />
                        </button>
                        {openMenuId === method.id && (
                          <div className="absolute right-0 top-full mt-1 bg-white border border-[hsl(var(--snug-border))] rounded-xl shadow-lg z-10 py-1 min-w-[140px]">
                            {!method.isDefault && (
                              <button
                                type="button"
                                onClick={() => handleSetDefault(method.id)}
                                className="w-full px-4 py-2 text-sm text-left text-[hsl(var(--snug-text-primary))] hover:bg-gray-50"
                              >
                                {t('useAsDefault')}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDelete(method.id)}
                              className="w-full px-4 py-2 text-sm text-left text-[hsl(var(--snug-text-primary))] hover:bg-gray-50"
                            >
                              {t('delete')}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Add New Card Button */}
                  <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="w-full py-6 border border-[hsl(var(--snug-border))] rounded-3xl flex items-center justify-center hover:bg-gray-50 active:scale-[0.99] transition-all duration-150"
                  >
                    <Plus className="w-6 h-6 text-[hsl(var(--snug-gray))]" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Payment Method Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-[400px] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--snug-border))]">
              <h3 className="text-base font-semibold text-[hsl(var(--snug-text-primary))]">
                {t('addPaymentMethod')}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  handleResetForm();
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-[hsl(var(--snug-gray))]" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4">
              {/* Card Icons */}
              <div className="flex items-center gap-2">
                <span className="text-[#1A1F71] font-bold text-lg italic">VISA</span>
                <div className="flex">
                  <div className="w-4 h-4 rounded-full bg-[#EB001B]" />
                  <div className="w-4 h-4 rounded-full bg-[#F79E1B] -ml-1" />
                </div>
              </div>

              {/* Card Number */}
              <div>
                <label className="block text-xs text-[hsl(var(--snug-gray))] mb-1">
                  {t('cardNumber')}
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  maxLength={19}
                  placeholder="•••• •••• •••• ••••"
                  className="w-full px-4 py-3 border border-[hsl(var(--snug-border))] rounded-xl text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                />
              </div>

              {/* Expiration Date & CVV */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-[hsl(var(--snug-gray))] mb-1">
                    {t('expirationDateLabel')}
                  </label>
                  <input
                    type="text"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    placeholder="MM YYYY"
                    className="w-full px-4 py-3 border border-[hsl(var(--snug-border))] rounded-xl text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-[hsl(var(--snug-gray))] mb-1">
                    {t('cvv')}
                  </label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    maxLength={4}
                    placeholder="•••"
                    className="w-full px-4 py-3 border border-[hsl(var(--snug-border))] rounded-xl text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                  />
                </div>
              </div>

              {/* ZIP Code */}
              <div>
                <label className="block text-xs text-[hsl(var(--snug-gray))] mb-1">
                  {t('zipCode')}
                </label>
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="01234"
                  className="w-full px-4 py-3 border border-[hsl(var(--snug-border))] rounded-xl text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                />
              </div>

              {/* Country / State */}
              <div>
                <label className="block text-xs text-[hsl(var(--snug-gray))] mb-1">
                  {t('countryState')}
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-3 border border-[hsl(var(--snug-border))] rounded-xl text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))] bg-white appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '20px',
                  }}
                >
                  <option value="South Korea">South Korea</option>
                  <option value="United States">United States</option>
                  <option value="Japan">Japan</option>
                  <option value="China">China</option>
                  <option value="Vietnam">Vietnam</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-5 border-t border-[hsl(var(--snug-border))]">
              <button
                type="button"
                onClick={handleResetForm}
                className="flex items-center gap-2 text-sm text-[hsl(var(--snug-text-primary))]"
              >
                <RotateCcw className="w-4 h-4" />
                {t('reset')}
              </button>
              <button
                type="button"
                onClick={handleAddPayment}
                disabled={!cardNumber || !expirationDate || !cvv || !zipCode}
                className="px-12 py-3 bg-[hsl(var(--snug-orange))] text-white text-sm font-medium rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('add')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
