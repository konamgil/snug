'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import {
  ImageIcon,
  Calendar,
  Users,
  MessageSquare,
  Plus,
  ChevronRight,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { Header } from '@/widgets/header';
import {
  MastercardIcon,
  VisaIcon,
  ApplePayIcon,
  AliPayIcon,
  WeChatPayIcon,
} from '@/shared/ui/icons';
import { useCurrencySafe } from '@/shared/providers';
import { getAccommodationPublic } from '@/shared/api/accommodation';
import { getAccommodationTypeLabel } from '@/shared/lib';
import type { AccommodationPublic } from '@snug/types';

// Booking reasons keys
const bookingReasonKeys = ['travel', 'study', 'business', 'specify'] as const;
type BookingReasonKey = (typeof bookingReasonKeys)[number];

// Default values for pricing
const DEFAULT_SERVICE_FEE_PERCENT = 10;
const DEFAULT_LONG_STAY_THRESHOLD = 12;
const DEFAULT_LONG_STAY_DISCOUNT = 10;
const DEFAULT_DEPOSIT = 100;

// Payment methods
interface PaymentCard {
  id: string;
  type: 'mastercard' | 'visa';
  cardType: 'Credit card' | 'Debit card';
  lastFour: string;
  isDefault?: boolean;
}

const savedCards: PaymentCard[] = [
  {
    id: '1',
    type: 'mastercard',
    cardType: 'Credit card',
    lastFour: '1234',
    isDefault: true,
  },
  {
    id: '2',
    type: 'visa',
    cardType: 'Debit card',
    lastFour: '1234',
  },
];

type EasyPayment = 'apple' | 'ali' | 'wechat';

const easyPayments = [
  { id: 'apple' as EasyPayment, name: 'Apple Pay', icon: 'apple' },
  { id: 'ali' as EasyPayment, name: 'Ali Pay', icon: 'ali' },
  { id: 'wechat' as EasyPayment, name: 'We Chat Pay', icon: 'wechat' },
];

export function PaymentPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations('roomDetail.checkout');
  const tBooking = useTranslations('roomDetail.booking');
  const { format } = useCurrencySafe();

  const roomId = (params.id as string) || '';

  // Parse dates from URL search params
  const parseDate = (dateStr: string | null): Date | null => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  };

  const checkInDate = parseDate(searchParams.get('checkIn'));
  const checkOutDate = parseDate(searchParams.get('checkOut'));
  const guestCount = parseInt(searchParams.get('guests') || '1', 10);

  // Calculate nights from dates
  const calculateNights = (checkIn: Date | null, checkOut: Date | null): number => {
    if (!checkIn || !checkOut) return 1;
    const diffTime = checkOut.getTime() - checkIn.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  };

  const nights = calculateNights(checkInDate, checkOutDate);

  // Format date for display
  const formatDateDisplay = (date: Date | null): string => {
    if (!date) return '-';
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear().toString().slice(-2);
    return `${month} ${day}, ${year}`;
  };

  const checkInDisplay = formatDateDisplay(checkInDate);
  const checkOutDisplay = formatDateDisplay(checkOutDate);

  // API data state
  const [accommodation, setAccommodation] = useState<AccommodationPublic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [selectedReason, setSelectedReason] = useState<BookingReasonKey>('travel');
  const [sameAsAccount, setSameAsAccount] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('southKorea');
  const [phone, setPhone] = useState('');
  const [passport, setPassport] = useState('');

  // Payment state
  const [selectedCard, setSelectedCard] = useState<string>(savedCards[0]?.id || '');
  const [selectedEasyPay, setSelectedEasyPay] = useState<EasyPayment | null>(null);
  const [payerSameAsAccount, setPayerSameAsAccount] = useState(true);
  const [payerFirstName, setPayerFirstName] = useState('');
  const [payerLastName, setPayerLastName] = useState('');

  // Mobile UI state
  const [isPriceSheetOpen, setIsPriceSheetOpen] = useState(false);

  // Fetch accommodation data
  useEffect(() => {
    async function fetchData() {
      if (!roomId) {
        setError('Room ID not found');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const data = await getAccommodationPublic(roomId);
        if (!data) {
          setError('Accommodation not found');
        } else {
          setAccommodation(data);
        }
      } catch (err) {
        console.error('Failed to fetch accommodation:', err);
        setError('Failed to load accommodation');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [roomId]);

  // Calculate prices from API data
  const pricePerNight = accommodation?.basePrice ?? 0;
  const cleaningFee = accommodation?.cleaningFee ?? 0;
  const deposit = DEFAULT_DEPOSIT;
  const serviceFeePercent = DEFAULT_SERVICE_FEE_PERCENT;
  const longStayThreshold = DEFAULT_LONG_STAY_THRESHOLD;
  const longStayDiscount = DEFAULT_LONG_STAY_DISCOUNT;

  const rentTotal = pricePerNight * nights;
  const serviceFee = Math.round(rentTotal * (serviceFeePercent / 100));
  const discount = nights >= longStayThreshold ? longStayDiscount : 0;
  const total = rentTotal + cleaningFee + deposit + serviceFee - discount;

  // Display values
  const displayLocation = accommodation
    ? `${accommodation.sigunguEn || ''}, ${accommodation.sidoEn || ''}`
    : '';
  const displayTitle = accommodation?.roomName || '';
  const displayRoomType = accommodation
    ? getAccommodationTypeLabel(accommodation.accommodationType, locale)
    : '';
  const thumbnailUrl = accommodation?.photos?.[0]?.url || '';

  const handleBack = () => {
    router.back();
  };

  const handlePaymentMethodChange = (cardId: string) => {
    setSelectedCard(cardId);
    setSelectedEasyPay(null);
  };

  const handleEasyPayChange = (payId: EasyPayment) => {
    setSelectedEasyPay(payId);
    setSelectedCard('');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header variant="with-search" showSearch={false} onBack={handleBack} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--snug-orange))]" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !accommodation) {
    return (
      <div className="min-h-screen bg-white">
        <Header variant="with-search" showSearch={false} onBack={handleBack} />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-lg text-[hsl(var(--snug-gray))]">{error || tBooking('notFound')}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-[hsl(var(--snug-orange))] text-white rounded-full hover:opacity-90"
          >
            {tBooking('back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Header variant="with-search" showSearch={false} onBack={handleBack} />

      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8 pb-40 lg:pb-8 w-full">
        <div className="flex gap-12">
          {/* Left Column - Form */}
          <div className="flex-1 lg:max-w-xl min-w-0">
            {/* Title with Back Button (PC only) */}
            <div className="flex items-start gap-4 mb-8">
              <button
                type="button"
                onClick={handleBack}
                className="hidden md:flex items-center justify-center w-6 h-6 mt-0.5 hover:opacity-70 transition-opacity flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5 text-[hsl(var(--snug-text-primary))]" />
              </button>
              <div className="flex-1 lg:flex-none">
                <h1 className="text-xl font-bold text-[hsl(var(--snug-text-primary))] mb-2">
                  {t('title')}
                </h1>
                <p className="text-sm text-[hsl(var(--snug-gray))]">{t('subtitle')}</p>
              </div>
            </div>

            {/* Content sections - indented on tablet/PC to align with title */}
            <div className="md:pl-10">
              {/* Reason for booking */}
              <div className="mb-8">
                <h2 className="text-sm lg:text-base font-semibold text-[hsl(var(--snug-text-primary))] mb-3">
                  {t('reasonTitle')}
                </h2>
                <div className="flex flex-wrap gap-2 mb-2">
                  {bookingReasonKeys.map((reasonKey) => (
                    <button
                      key={reasonKey}
                      type="button"
                      onClick={() => setSelectedReason(reasonKey)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedReason === reasonKey
                          ? 'border border-[hsl(var(--snug-orange))] text-[hsl(var(--snug-orange))] bg-white'
                          : 'bg-white border border-[hsl(var(--snug-border))] text-[hsl(var(--snug-text-primary))] hover:border-[hsl(var(--snug-gray))]'
                      }`}
                    >
                      {t(`reasons.${reasonKey}`)}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-[hsl(var(--snug-gray))]">{t('reasonHint')}</p>
              </div>

              {/* Final information */}
              <div className="mb-8">
                <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
                  <h2 className="text-base font-semibold text-[hsl(var(--snug-text-primary))]">
                    {t('guestInfo.title')}
                  </h2>
                  <label className="flex items-center gap-2 cursor-pointer flex-shrink-0">
                    <div
                      onClick={() => setSameAsAccount(!sameAsAccount)}
                      className={`w-5 h-5 rounded flex items-center justify-center transition-colors flex-shrink-0 ${
                        sameAsAccount
                          ? 'bg-[hsl(var(--snug-orange))]'
                          : 'border-2 border-[hsl(var(--snug-border))]'
                      }`}
                    >
                      {sameAsAccount && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="text-xs sm:text-sm text-[hsl(var(--snug-text-primary))] whitespace-nowrap">
                      {t('guestInfo.sameAsAccount')}
                    </span>
                  </label>
                </div>

                <h3 className="text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-3">
                  {t('guestInfo.yourInfo')}
                </h3>

                {/* Name */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-[hsl(var(--snug-text-primary))] mb-2">
                    {t('guestInfo.name')}
                  </label>
                  <div className="flex gap-2 sm:gap-3">
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder={t('guestInfo.firstName')}
                      className="flex-1 min-w-0 px-4 sm:px-5 py-3.5 border border-[hsl(var(--snug-border))] rounded-full text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                    />
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder={t('guestInfo.lastName')}
                      className="flex-1 min-w-0 px-4 sm:px-5 py-3.5 border border-[hsl(var(--snug-border))] rounded-full text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                    />
                  </div>
                  <p className="text-xs text-[hsl(var(--snug-gray))] mt-1.5">
                    {t('guestInfo.nameHint')}
                  </p>
                </div>

                {/* Email */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-[hsl(var(--snug-text-primary))] mb-2">
                    {t('guestInfo.email')}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('guestInfo.emailPlaceholder')}
                    className="w-full px-5 py-3.5 border border-[hsl(var(--snug-border))] rounded-full text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                  />
                </div>

                {/* Phone */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-[hsl(var(--snug-text-primary))] mb-2">
                    {t('guestInfo.phone')}
                  </label>
                  <div className="flex gap-2 sm:gap-3">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-[130px] sm:w-[160px] lg:w-[180px] px-3 sm:px-5 py-3.5 border border-[hsl(var(--snug-border))] rounded-full text-xs sm:text-sm bg-white focus:outline-none focus:border-[hsl(var(--snug-orange))] appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3d%22http%3a%2f%2fwww.w3.org%2f2000%2fsvg%22%20width%3d%2224%22%20height%3d%2224%22%20viewBox%3d%220%200%2024%2024%22%20fill%3d%22none%22%20stroke%3d%22%23999%22%20stroke-width%3d%222%22%20stroke-linecap%3d%22round%22%20stroke-linejoin%3d%22round%22%3e%3cpolyline%20points%3d%226%209%2012%2015%2018%209%22%3e%3c%2fpolyline%3e%3c%2fsvg%3e')] bg-no-repeat bg-[right_0.75rem_center] sm:bg-[right_1rem_center] bg-[length:14px] sm:bg-[length:16px]"
                    >
                      <option value="+82">{t('countryCodes.southKorea')}</option>
                      <option value="+1">{t('countryCodes.usa')}</option>
                      <option value="+86">{t('countryCodes.china')}</option>
                      <option value="+81">{t('countryCodes.japan')}</option>
                    </select>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t('guestInfo.phonePlaceholder')}
                      className="flex-1 min-w-0 px-4 sm:px-5 py-3.5 border border-[hsl(var(--snug-border))] rounded-full text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-1.5 flex-wrap">
                    <span className="text-xs text-[hsl(var(--snug-gray))]">
                      {t('guestInfo.verified')}
                    </span>
                    <button
                      type="button"
                      className="flex items-center gap-1 text-xs sm:text-sm text-[hsl(var(--snug-text-primary))] hover:text-[hsl(var(--snug-orange))]"
                    >
                      {t('guestInfo.identityVerification')}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Passport */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-[hsl(var(--snug-text-primary))] mb-2">
                    {t('guestInfo.passport')}
                  </label>
                  <input
                    type="text"
                    value={passport}
                    onChange={(e) => setPassport(e.target.value)}
                    placeholder={t('guestInfo.passportPlaceholder')}
                    className="w-full px-5 py-3.5 border border-[hsl(var(--snug-border))] rounded-full text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                  />
                </div>
              </div>

              {/* Payment method */}
              <div className="mb-8">
                <h2 className="text-base font-semibold text-[hsl(var(--snug-text-primary))] mb-4">
                  {t('paymentMethod.title')}
                </h2>

                {/* Credit or debit card */}
                <p className="text-xs text-[hsl(var(--snug-gray))] mb-3">
                  {t('paymentMethod.creditDebit')}
                </p>

                <div className="space-y-3 mb-4">
                  {savedCards.map((card) => (
                    <label
                      key={card.id}
                      className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-colors ${
                        selectedCard === card.id
                          ? 'border-[hsl(var(--snug-orange))] bg-[hsl(var(--snug-orange))]/5'
                          : 'border-[hsl(var(--snug-border))] hover:border-[hsl(var(--snug-gray))]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {card.type === 'mastercard' ? (
                          <MastercardIcon className="w-10 h-7" />
                        ) : (
                          <VisaIcon className="w-10 h-7" />
                        )}
                        <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                          {card.type === 'mastercard' ? 'Mastercard' : 'Visa'} ({card.cardType} •{' '}
                          {card.lastFour})
                        </span>
                        {card.isDefault && (
                          <span className="text-xs text-[hsl(var(--snug-orange))]">
                            {t('paymentMethod.default')}
                          </span>
                        )}
                      </div>
                      <input
                        type="radio"
                        name="paymentCard"
                        checked={selectedCard === card.id}
                        onChange={() => handlePaymentMethodChange(card.id)}
                        className="w-5 h-5 text-[hsl(var(--snug-orange))] border-[hsl(var(--snug-border))] focus:ring-[hsl(var(--snug-orange))]"
                      />
                    </label>
                  ))}

                  {/* Add new card */}
                  <button
                    type="button"
                    className="w-full p-4 border border-[hsl(var(--snug-border))] rounded-xl flex items-center justify-center gap-2 text-sm text-[hsl(var(--snug-gray))] hover:border-[hsl(var(--snug-gray))] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Easy Payment */}
                <p className="text-xs text-[hsl(var(--snug-gray))] mb-3">
                  {t('paymentMethod.easyPayment')}
                </p>

                <div className="space-y-3">
                  {easyPayments.map((payment) => (
                    <label
                      key={payment.id}
                      className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-colors ${
                        selectedEasyPay === payment.id
                          ? 'border-[hsl(var(--snug-orange))] bg-[hsl(var(--snug-orange))]/5'
                          : 'border-[hsl(var(--snug-border))] hover:border-[hsl(var(--snug-gray))]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {payment.id === 'apple' ? (
                          <ApplePayIcon className="w-10 h-10" />
                        ) : payment.id === 'ali' ? (
                          <AliPayIcon className="w-10 h-10" />
                        ) : (
                          <WeChatPayIcon className="w-10 h-10" />
                        )}
                        <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                          {payment.name}
                        </span>
                      </div>
                      <input
                        type="radio"
                        name="easyPayment"
                        checked={selectedEasyPay === payment.id}
                        onChange={() => handleEasyPayChange(payment.id)}
                        className="w-5 h-5 text-[hsl(var(--snug-orange))] border-[hsl(var(--snug-border))] focus:ring-[hsl(var(--snug-orange))]"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Payer name */}
              <div className="mb-8">
                <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
                  <h2 className="text-base font-semibold text-[hsl(var(--snug-text-primary))]">
                    {t('payerName.title')}
                  </h2>
                  <label className="flex items-center gap-2 cursor-pointer flex-shrink-0">
                    <div
                      onClick={() => setPayerSameAsAccount(!payerSameAsAccount)}
                      className={`w-5 h-5 rounded flex items-center justify-center transition-colors flex-shrink-0 ${
                        payerSameAsAccount
                          ? 'bg-[hsl(var(--snug-orange))]'
                          : 'border-2 border-[hsl(var(--snug-border))]'
                      }`}
                    >
                      {payerSameAsAccount && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="text-xs sm:text-sm text-[hsl(var(--snug-text-primary))] whitespace-nowrap">
                      {t('payerName.sameAsAccount')}
                    </span>
                  </label>
                </div>

                <label className="block text-sm font-semibold text-[hsl(var(--snug-text-primary))] mb-2">
                  {t('payerName.name')}
                </label>
                <div className="flex gap-2 sm:gap-3">
                  <input
                    type="text"
                    value={payerFirstName}
                    onChange={(e) => setPayerFirstName(e.target.value)}
                    placeholder={t('guestInfo.firstName')}
                    className="flex-1 min-w-0 px-4 sm:px-5 py-3.5 border border-[hsl(var(--snug-border))] rounded-full text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                  />
                  <input
                    type="text"
                    value={payerLastName}
                    onChange={(e) => setPayerLastName(e.target.value)}
                    placeholder={t('guestInfo.lastName')}
                    className="flex-1 min-w-0 px-4 sm:px-5 py-3.5 border border-[hsl(var(--snug-border))] rounded-full text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                  />
                </div>
              </div>

              {/* Information */}
              <div className="mb-8">
                <h2 className="text-base font-semibold text-[hsl(var(--snug-text-primary))] mb-2">
                  {t('information.title')}
                </h2>
                <p className="text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-1">
                  {t('information.maintenanceIncluded')}
                </p>
                <p className="text-sm text-[hsl(var(--snug-gray))] mb-2">
                  {t('information.utilities')}
                </p>
                <p className="text-xs text-[hsl(var(--snug-gray))] leading-relaxed">
                  {t('information.description')}
                </p>
              </div>

              {/* Refund Policy */}
              <div className="mb-8">
                <h2 className="text-base font-semibold text-[hsl(var(--snug-text-primary))] mb-3">
                  {t('refundPolicy.title')}
                </h2>
                <ul className="space-y-1.5 text-xs text-[hsl(var(--snug-gray))]">
                  <li className="flex items-start gap-2">
                    <span className="w-1 h-1 bg-[hsl(var(--snug-gray))] rounded-full mt-1.5 flex-shrink-0" />
                    <span>{t('refundPolicy.over15days')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1 h-1 bg-[hsl(var(--snug-gray))] rounded-full mt-1.5 flex-shrink-0" />
                    <span>{t('refundPolicy.days14to8')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1 h-1 bg-[hsl(var(--snug-gray))] rounded-full mt-1.5 flex-shrink-0" />
                    <span>{t('refundPolicy.days7to1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1 h-1 bg-[hsl(var(--snug-gray))] rounded-full mt-1.5 flex-shrink-0" />
                    <span>{t('refundPolicy.checkInDay')}</span>
                  </li>
                </ul>
              </div>

              {/* Notes */}
              <div className="mb-8">
                <h2 className="text-base font-semibold text-[hsl(var(--snug-text-primary))] mb-3">
                  {t('notes.title')}
                </h2>
                <ul className="space-y-1.5 text-xs text-[hsl(var(--snug-gray))]">
                  <li className="flex items-start gap-2">
                    <span className="w-1 h-1 bg-[hsl(var(--snug-gray))] rounded-full mt-1.5 flex-shrink-0" />
                    <span>{t('notes.sameDayCancellation')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1 h-1 bg-[hsl(var(--snug-gray))] rounded-full mt-1.5 flex-shrink-0" />
                    <span>{t('notes.feesRefundable')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1 h-1 bg-[hsl(var(--snug-gray))] rounded-full mt-1.5 flex-shrink-0" />
                    <span>{t('notes.policyVaries')}</span>
                  </li>
                </ul>
              </div>

              {/* Long-Term Stay Discount */}
              <div className="mb-8">
                <h2 className="text-base font-semibold text-[hsl(var(--snug-text-primary))] mb-3">
                  {t('discountItems.title')}
                </h2>
                <ul className="space-y-1.5 text-xs text-[hsl(var(--snug-gray))]">
                  <li className="flex items-start gap-2">
                    <span className="w-1 h-1 bg-[hsl(var(--snug-gray))] rounded-full mt-1.5 flex-shrink-0" />
                    <span>{t('discountItems.weeks2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1 h-1 bg-[hsl(var(--snug-gray))] rounded-full mt-1.5 flex-shrink-0" />
                    <span>{t('discountItems.weeks4')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1 h-1 bg-[hsl(var(--snug-gray))] rounded-full mt-1.5 flex-shrink-0" />
                    <span>{t('discountItems.weeks12')}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column - Payment Summary (Desktop Only) */}
          <div className="hidden lg:block w-[340px] flex-shrink-0">
            <div className="sticky top-20">
              <h2 className="text-base font-semibold text-[hsl(var(--snug-text-primary))] mb-4">
                {t('summary.paymentAmount')}
              </h2>

              {/* Room Info Card */}
              <div className="border border-[hsl(var(--snug-border))] rounded-xl p-4 mb-4">
                <div className="flex gap-3 mb-4">
                  {thumbnailUrl ? (
                    <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={thumbnailUrl}
                        alt={displayTitle}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-[hsl(var(--snug-light-gray))] flex items-center justify-center flex-shrink-0">
                      <ImageIcon className="w-6 h-6 text-[hsl(var(--snug-gray))]/30" />
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-[hsl(var(--snug-gray))]">{displayLocation}</p>
                    <p className="text-sm font-semibold text-[hsl(var(--snug-text-primary))]">
                      {displayTitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-[hsl(var(--snug-gray))]">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {checkInDisplay} - {checkOutDisplay}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>
                      {guestCount} {t('summary.guest')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border border-[hsl(var(--snug-border))] rounded-xl p-4 mb-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-[hsl(var(--snug-text-primary))]">
                        {t('summary.rentPerNight')}
                      </p>
                      <p className="text-xs text-[hsl(var(--snug-gray))]">
                        {t('summary.includingMaintenance')}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-[hsl(var(--snug-orange))]">
                      {format(pricePerNight)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                      {t('summary.nightsCalculation', { nights, price: format(pricePerNight) })}
                    </span>
                    <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                      {format(rentTotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                      {t('summary.cleaning')}
                    </span>
                    <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                      {format(cleaningFee)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                      {t('summary.deposit')}
                    </span>
                    <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                      {format(deposit)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                      {t('summary.serviceFee', { percent: serviceFeePercent })}
                    </span>
                    <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                      {format(serviceFee)}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                        {t('summary.longStayDiscount', { days: longStayThreshold })}
                      </span>
                      <span className="text-sm text-[hsl(var(--snug-orange))]">
                        -{format(discount)}
                      </span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-[hsl(var(--snug-border))] flex items-center justify-between">
                    <span className="text-base font-semibold text-[hsl(var(--snug-text-primary))]">
                      {t('summary.total')}
                    </span>
                    <span className="text-lg font-bold text-[hsl(var(--snug-text-primary))]">
                      {format(total)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 border border-[hsl(var(--snug-border))] rounded-lg text-sm font-medium text-[hsl(var(--snug-text-primary))] hover:bg-[hsl(var(--snug-light-gray))] transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    {t('summary.chatWithHost')}
                  </button>
                  <button
                    type="button"
                    className="flex-1 py-2.5 bg-[hsl(var(--snug-orange))] text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
                  >
                    {t('summary.book')}
                  </button>
                </div>
              </div>

              {/* Room Type Info */}
              <div className="border border-[hsl(var(--snug-border))] rounded-xl p-4 text-center">
                <p className="text-sm font-semibold text-[hsl(var(--snug-orange))] mb-1">
                  {displayRoomType}
                </p>
                <p className="text-xs text-[hsl(var(--snug-gray))]">
                  {t('summary.roomTypeDescription')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[hsl(var(--snug-border))] z-50">
        {/* Handle - Clickable to open price sheet */}
        <button
          type="button"
          onClick={() => setIsPriceSheetOpen(true)}
          className="w-full flex justify-center py-2"
        >
          <div className="w-10 h-1 bg-[hsl(var(--snug-border))] rounded-full" />
        </button>

        <div className="px-5 pb-4">
          {/* Top Row: Total - Also clickable */}
          <button
            type="button"
            onClick={() => setIsPriceSheetOpen(true)}
            className="w-full flex items-center justify-between mb-3"
          >
            <span className="text-base font-bold text-[hsl(var(--snug-text-primary))]">
              {t('summary.total')}
            </span>
            <span className="text-base font-bold text-[hsl(var(--snug-text-primary))]">
              {format(total)}
            </span>
          </button>
          {/* Bottom Row: Actions */}
          <div className="flex items-center gap-3">
            {/* Chat with Host */}
            <button
              type="button"
              className="flex items-center gap-2 text-sm font-bold text-[hsl(var(--snug-text-primary))] hover:opacity-70 transition-opacity"
            >
              <MessageSquare className="w-5 h-5" />
              <span>{t('summary.chatWithHost')}</span>
            </button>
            {/* Payment Button */}
            <button
              type="button"
              className="flex-1 py-3.5 bg-[hsl(var(--snug-orange))] text-white text-sm font-semibold rounded-full hover:opacity-90 transition-opacity"
            >
              {t('summary.payment')}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Price Sheet */}
      <div
        className={`lg:hidden fixed inset-0 z-[60] transition-opacity duration-300 ${
          isPriceSheetOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/30" onClick={() => setIsPriceSheetOpen(false)} />

        {/* Sheet */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl transition-transform duration-300 ease-out ${
            isPriceSheetOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          {/* Handle - Clickable to close */}
          <button
            type="button"
            onClick={() => setIsPriceSheetOpen(false)}
            className="w-full flex justify-center py-3"
          >
            <div className="w-10 h-1 bg-[hsl(var(--snug-border))] rounded-full" />
          </button>

          <div className="px-5 pb-4 max-h-[60vh] overflow-y-auto">
            {/* Room Info Card */}
            <div className="flex gap-3 mb-5">
              {thumbnailUrl ? (
                <div className="w-20 h-16 rounded-2xl overflow-hidden flex-shrink-0">
                  <Image
                    src={thumbnailUrl}
                    alt={displayTitle}
                    width={80}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-16 rounded-2xl overflow-hidden bg-[hsl(var(--snug-light-gray))] flex items-center justify-center flex-shrink-0">
                  <ImageIcon className="w-6 h-6 text-[hsl(var(--snug-gray))]/30" />
                </div>
              )}
              <div className="flex flex-col justify-center">
                <p className="text-xs text-[hsl(var(--snug-gray))]">{displayLocation}</p>
                <p className="text-sm font-bold text-[hsl(var(--snug-text-primary))]">
                  {displayTitle}
                </p>
              </div>
            </div>

            {/* Booking Details */}
            <div className="flex items-center gap-6 text-sm text-[hsl(var(--snug-text-primary))] mb-5 px-5 py-3.5 border border-[hsl(var(--snug-border))] rounded-full">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
                <span>
                  {checkInDisplay} - {checkOutDisplay}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
                <span>
                  {guestCount} {t('summary.guest')}
                </span>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-4">
              <div className="flex items-start justify-between pb-4 border-b border-[hsl(var(--snug-border))]">
                <div>
                  <p className="text-sm text-[hsl(var(--snug-text-primary))]">
                    {t('summary.rentPerNight')}
                  </p>
                  <p className="text-sm text-[hsl(var(--snug-gray))]">
                    {t('summary.includingMaintenance')}
                  </p>
                </div>
                <span className="text-sm font-semibold text-[hsl(var(--snug-orange))]">
                  {format(pricePerNight)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                  {t('summary.nightsCalculation', { nights, price: format(pricePerNight) })}
                </span>
                <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                  {format(rentTotal)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                  {t('summary.cleaning')}
                </span>
                <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                  {format(cleaningFee)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                  {t('summary.deposit')}
                </span>
                <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                  {format(deposit)}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                    {t('summary.longStayDiscount', { days: longStayThreshold })}
                  </span>
                  <span className="text-sm text-[hsl(var(--snug-orange))]">
                    -{format(discount)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-[hsl(var(--snug-border))]">
                <span className="text-base font-bold text-[hsl(var(--snug-text-primary))]">
                  {t('summary.total')}
                </span>
                <span className="text-base font-bold text-[hsl(var(--snug-text-primary))]">
                  {format(total)}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Actions in Sheet */}
          <div className="px-5 py-4">
            <div className="flex items-center gap-3">
              {/* Chat with Host */}
              <button
                type="button"
                className="flex items-center gap-2 text-sm font-bold text-[hsl(var(--snug-text-primary))] hover:opacity-70 transition-opacity"
              >
                <MessageSquare className="w-5 h-5" />
                <span>{t('summary.chatWithHost')}</span>
              </button>
              {/* Payment Button */}
              <button
                type="button"
                className="flex-1 py-3.5 bg-[hsl(var(--snug-orange))] text-white text-sm font-semibold rounded-full hover:opacity-90 transition-opacity"
              >
                {t('summary.payment')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
