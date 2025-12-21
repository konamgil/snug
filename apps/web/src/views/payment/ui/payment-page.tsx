'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImageIcon, Calendar, Users, MessageSquare, Plus, ChevronRight } from 'lucide-react';
import { Header } from '@/widgets/header';

// Mock room data for payment
const roomData = {
  id: '1',
  title: 'Gangnam Stay',
  location: 'Gangnam-gu, Seoul',
  image: '/images/rooms/room-1.jpg',
  pricePerNight: 40,
  cleaningFee: 20,
  deposit: 100,
  serviceFeePercent: 10,
  longStayDiscount: 10,
  longStayThreshold: 12,
};

// Booking reasons
const bookingReasons = ['Travel', 'Study', 'Business', 'Specify'] as const;
type BookingReason = (typeof bookingReasons)[number];

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

  // Form state
  const [selectedReason, setSelectedReason] = useState<BookingReason>('Travel');
  const [sameAsAccount, setSameAsAccount] = useState(true);
  const [firstName, setFirstName] = useState('Gildong');
  const [lastName, setLastName] = useState('Hong');
  const [email, setEmail] = useState('gildong@gmail.com');
  const [countryCode, setCountryCode] = useState('+82 (South Korea)');
  const [phone, setPhone] = useState('010-1234-5678');
  const [passport, setPassport] = useState('M 123456');

  // Payment state
  const [selectedCard, setSelectedCard] = useState<string>(savedCards[0]?.id || '');
  const [selectedEasyPay, setSelectedEasyPay] = useState<EasyPayment | null>(null);
  const [payerSameAsAccount, setPayerSameAsAccount] = useState(true);
  const [payerFirstName, setPayerFirstName] = useState('Gildong');
  const [payerLastName, setPayerLastName] = useState('Hong');

  // Mobile UI state
  const [isPriceSheetOpen, setIsPriceSheetOpen] = useState(false);

  // Mock booking data
  const checkIn = 'Jun 30, 25';
  const checkOut = 'Jun 30, 25';
  const guests = 1;
  const nights = 8;

  // Calculate prices
  const rentTotal = roomData.pricePerNight * nights;
  const serviceFee = Math.round(rentTotal * (roomData.serviceFeePercent / 100));
  const discount = nights >= roomData.longStayThreshold ? roomData.longStayDiscount : 0;
  const total = rentTotal + roomData.cleaningFee + roomData.deposit + serviceFee - discount;

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

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Header variant="with-search" showSearch={false} onBack={handleBack} />

      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8 pb-40 lg:pb-8 w-full">
        <div className="flex gap-12">
          {/* Left Column - Form */}
          <div className="flex-1 lg:max-w-xl min-w-0">
            {/* Title */}
            <h1 className="text-xl font-bold text-[hsl(var(--snug-text-primary))] mb-2">
              Additional information
            </h1>
            <p className="text-sm text-[hsl(var(--snug-gray))] mb-8">
              Please let the host know what to keep in mind.
            </p>

            {/* Reason for booking */}
            <div className="mb-8">
              <h2 className="text-sm lg:text-base font-semibold text-[hsl(var(--snug-text-primary))] mb-3">
                Reason for booking accommodation
              </h2>
              <div className="flex flex-wrap gap-2 mb-2">
                {bookingReasons.map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setSelectedReason(reason)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedReason === reason
                        ? 'border border-[hsl(var(--snug-orange))] text-[hsl(var(--snug-orange))] bg-white'
                        : 'bg-white border border-[hsl(var(--snug-border))] text-[hsl(var(--snug-text-primary))] hover:border-[hsl(var(--snug-gray))]'
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>
              <p className="text-xs text-[hsl(var(--snug-gray))]">
                We use lifestyle patterns as a reference when assigning roommates.
              </p>
            </div>

            {/* Final information */}
            <div className="mb-8">
              <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
                <h2 className="text-base font-semibold text-[hsl(var(--snug-text-primary))]">
                  Final information
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
                    Same as Account Info
                  </span>
                </label>
              </div>

              <h3 className="text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-3">
                Your information
              </h3>

              {/* Name */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[hsl(var(--snug-text-primary))] mb-2">
                  Name
                </label>
                <div className="flex gap-2 sm:gap-3">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                    className="flex-1 min-w-0 px-4 sm:px-5 py-3.5 border border-[hsl(var(--snug-border))] rounded-full text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                  />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                    className="flex-1 min-w-0 px-4 sm:px-5 py-3.5 border border-[hsl(var(--snug-border))] rounded-full text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                  />
                </div>
                <p className="text-xs text-[hsl(var(--snug-gray))] mt-1.5">
                  Make sure this matches the name on your government ID.
                </p>
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[hsl(var(--snug-text-primary))] mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Please enter your Email address."
                  className="w-full px-5 py-3.5 border border-[hsl(var(--snug-border))] rounded-full text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                />
              </div>

              {/* Phone */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[hsl(var(--snug-text-primary))] mb-2">
                  Phone number
                </label>
                <div className="flex gap-2 sm:gap-3">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-[130px] sm:w-[160px] lg:w-[180px] px-3 sm:px-5 py-3.5 border border-[hsl(var(--snug-border))] rounded-full text-xs sm:text-sm bg-white focus:outline-none focus:border-[hsl(var(--snug-orange))] appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3d%22http%3a%2f%2fwww.w3.org%2f2000%2fsvg%22%20width%3d%2224%22%20height%3d%2224%22%20viewBox%3d%220%200%2024%2024%22%20fill%3d%22none%22%20stroke%3d%22%23999%22%20stroke-width%3d%222%22%20stroke-linecap%3d%22round%22%20stroke-linejoin%3d%22round%22%3e%3cpolyline%20points%3d%226%209%2012%2015%2018%209%22%3e%3c%2fpolyline%3e%3c%2fsvg%3e')] bg-no-repeat bg-[right_0.75rem_center] sm:bg-[right_1rem_center] bg-[length:14px] sm:bg-[length:16px]"
                  >
                    <option value="+82 (South Korea)">(+82) South Korea</option>
                    <option value="+1 (USA)">(+1) USA</option>
                    <option value="+86 (China)">(+86) China</option>
                    <option value="+81 (Japan)">(+81) Japan</option>
                  </select>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    className="flex-1 min-w-0 px-4 sm:px-5 py-3.5 border border-[hsl(var(--snug-border))] rounded-full text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                  />
                </div>
                <div className="flex items-center justify-between gap-2 mt-1.5 flex-wrap">
                  <span className="text-xs text-[hsl(var(--snug-gray))]">Verified</span>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-xs sm:text-sm text-[hsl(var(--snug-text-primary))] hover:text-[hsl(var(--snug-orange))]"
                  >
                    Identity Verification
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Passport */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[hsl(var(--snug-text-primary))] mb-2">
                  Passport number
                </label>
                <input
                  type="text"
                  value={passport}
                  onChange={(e) => setPassport(e.target.value)}
                  placeholder="Please enter your passport number."
                  className="w-full px-5 py-3.5 border border-[hsl(var(--snug-border))] rounded-full text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                />
              </div>
            </div>

            {/* Payment method */}
            <div className="mb-8">
              <h2 className="text-base font-semibold text-[hsl(var(--snug-text-primary))] mb-4">
                Payment method
              </h2>

              {/* Credit or debit card */}
              <p className="text-xs text-[hsl(var(--snug-gray))] mb-3">Credit or debit card</p>

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
                      <div
                        className={`w-10 h-6 rounded flex items-center justify-center text-xs font-bold ${
                          card.type === 'mastercard'
                            ? 'bg-red-500 text-white'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {card.type === 'mastercard' ? 'MC' : 'VISA'}
                      </div>
                      <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                        {card.type === 'mastercard' ? 'Mastercard' : 'Visa'} ({card.cardType} •{' '}
                        {card.lastFour})
                      </span>
                      {card.isDefault && (
                        <span className="text-xs text-[hsl(var(--snug-orange))]">Default</span>
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
              <p className="text-xs text-[hsl(var(--snug-gray))] mb-3">Easy Payment</p>

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
                      <div
                        className={`w-10 h-6 rounded flex items-center justify-center text-[10px] font-bold ${
                          payment.id === 'apple'
                            ? 'bg-black text-white'
                            : payment.id === 'ali'
                              ? 'bg-blue-500 text-white'
                              : 'bg-green-500 text-white'
                        }`}
                      >
                        {payment.id === 'apple' ? 'Pay' : payment.id === 'ali' ? '支' : 'We'}
                      </div>
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
                  Payer name
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
                    Same as Account Info
                  </span>
                </label>
              </div>

              <label className="block text-sm font-semibold text-[hsl(var(--snug-text-primary))] mb-2">
                Name
              </label>
              <div className="flex gap-2 sm:gap-3">
                <input
                  type="text"
                  value={payerFirstName}
                  onChange={(e) => setPayerFirstName(e.target.value)}
                  placeholder="First Name"
                  className="flex-1 min-w-0 px-4 sm:px-5 py-3.5 border border-[hsl(var(--snug-border))] rounded-full text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                />
                <input
                  type="text"
                  value={payerLastName}
                  onChange={(e) => setPayerLastName(e.target.value)}
                  placeholder="Last Name"
                  className="flex-1 min-w-0 px-4 sm:px-5 py-3.5 border border-[hsl(var(--snug-border))] rounded-full text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                />
              </div>
            </div>

            {/* Information */}
            <div className="mb-8">
              <h2 className="text-base font-semibold text-[hsl(var(--snug-text-primary))] mb-2">
                Information
              </h2>
              <p className="text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-1">
                Included in Maintenance Fee
              </p>
              <p className="text-sm text-[hsl(var(--snug-gray))] mb-2">
                (Gas, Water, Internet, Electricity)
              </p>
              <p className="text-xs text-[hsl(var(--snug-gray))] leading-relaxed">
                All utility charges and internet fees are included in the maintenance fee. If any of
                the included services are used excessively, additional charges may apply.
              </p>
            </div>

            {/* Refund Policy */}
            <div className="mb-8">
              <h2 className="text-base font-semibold text-[hsl(var(--snug-text-primary))] mb-3">
                Refund Policy
              </h2>
              <ul className="space-y-1.5 text-xs text-[hsl(var(--snug-gray))]">
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-[hsl(var(--snug-gray))] rounded-full mt-1.5 flex-shrink-0" />
                  <span>
                    More than 15 days before check-in: 90% refund of rent and contract fee
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-[hsl(var(--snug-gray))] rounded-full mt-1.5 flex-shrink-0" />
                  <span>14~8 days before check-in: 70% refund of rent and contract fee</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-[hsl(var(--snug-gray))] rounded-full mt-1.5 flex-shrink-0" />
                  <span>7~1 days before check-in: 50% refund of rent and contract fee</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-[hsl(var(--snug-gray))] rounded-full mt-1.5 flex-shrink-0" />
                  <span>On the check-in date: No refund</span>
                </li>
              </ul>
            </div>

            {/* Notes */}
            <div className="mb-8">
              <h2 className="text-base font-semibold text-[hsl(var(--snug-text-primary))] mb-3">
                Notes
              </h2>
              <ul className="space-y-1.5 text-xs text-[hsl(var(--snug-gray))]">
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-[hsl(var(--snug-gray))] rounded-full mt-1.5 flex-shrink-0" />
                  <span>
                    For same-day cancellations, 10% of the rent and contract fee will be charged as
                    a penalty according to the refund policy. However, if the cancellation falls
                    within the free cancellation period, a full refund will be issued.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-[hsl(var(--snug-gray))] rounded-full mt-1.5 flex-shrink-0" />
                  <span>Maintenance fees, cleaning fees, and deposits are fully refundable.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-[hsl(var(--snug-gray))] rounded-full mt-1.5 flex-shrink-0" />
                  <span>The refund policy may vary depending on the host&apos;s terms.</span>
                </li>
              </ul>
            </div>

            {/* Long-Term Stay Discount */}
            <div className="mb-8">
              <h2 className="text-base font-semibold text-[hsl(var(--snug-text-primary))] mb-3">
                Long-Term Stay Discount
              </h2>
              <ul className="space-y-1.5 text-xs text-[hsl(var(--snug-gray))]">
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-[hsl(var(--snug-gray))] rounded-full mt-1.5 flex-shrink-0" />
                  <span>Contract for 2+ weeks: 5% off</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-[hsl(var(--snug-gray))] rounded-full mt-1.5 flex-shrink-0" />
                  <span>Contract for 4+ weeks: 10% off</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-[hsl(var(--snug-gray))] rounded-full mt-1.5 flex-shrink-0" />
                  <span>Contract for 12+ weeks: 20% off</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column - Payment Summary (Desktop Only) */}
          <div className="hidden lg:block w-[340px] flex-shrink-0">
            <div className="sticky top-20">
              <h2 className="text-base font-semibold text-[hsl(var(--snug-text-primary))] mb-4">
                Payment amount
              </h2>

              {/* Room Info Card */}
              <div className="border border-[hsl(var(--snug-border))] rounded-xl p-4 mb-4">
                <div className="flex gap-3 mb-4">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-[hsl(var(--snug-light-gray))] flex items-center justify-center flex-shrink-0">
                    <ImageIcon className="w-6 h-6 text-[hsl(var(--snug-gray))]/30" />
                  </div>
                  <div>
                    <p className="text-xs text-[hsl(var(--snug-gray))]">{roomData.location}</p>
                    <p className="text-sm font-semibold text-[hsl(var(--snug-text-primary))]">
                      {roomData.title}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-[hsl(var(--snug-gray))]">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {checkIn} - {checkOut}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>{guests} Guest</span>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border border-[hsl(var(--snug-border))] rounded-xl p-4 mb-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-[hsl(var(--snug-text-primary))]">
                        Rent for 1 Night
                      </p>
                      <p className="text-xs text-[hsl(var(--snug-gray))]">
                        (Including Maintenance Fee)
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-[hsl(var(--snug-orange))]">
                      ${roomData.pricePerNight}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                      {nights}nights X ${roomData.pricePerNight}
                    </span>
                    <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                      ${rentTotal}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                      Cleaning(After check-out)
                    </span>
                    <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                      ${roomData.cleaningFee}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                      Deposit(Refundable)
                    </span>
                    <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                      ${roomData.deposit}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                      Snug service fee({roomData.serviceFeePercent}%)
                    </span>
                    <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                      ${serviceFee}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                        Long-stay Discount(Over {roomData.longStayThreshold} days)
                      </span>
                      <span className="text-sm text-[hsl(var(--snug-orange))]">-${discount}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-[hsl(var(--snug-border))] flex items-center justify-between">
                    <span className="text-base font-semibold text-[hsl(var(--snug-text-primary))]">
                      Total
                    </span>
                    <span className="text-lg font-bold text-[hsl(var(--snug-text-primary))]">
                      ${total}
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
                    Chat with Host
                  </button>
                  <button
                    type="button"
                    className="flex-1 py-2.5 bg-[hsl(var(--snug-orange))] text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Book
                  </button>
                </div>
              </div>

              {/* Shared Room Info */}
              <div className="border border-[hsl(var(--snug-border))] rounded-xl p-4 text-center">
                <p className="text-sm font-semibold text-[hsl(var(--snug-orange))] mb-1">
                  Shared Room
                </p>
                <p className="text-xs text-[hsl(var(--snug-gray))]">
                  A shared rouse for living together
                  <br />
                  and connecting with others.
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
            <span className="text-base font-bold text-[hsl(var(--snug-text-primary))]">Total</span>
            <span className="text-base font-bold text-[hsl(var(--snug-text-primary))]">
              ${total}
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
              <span>Chat with Host</span>
            </button>
            {/* Payment Button */}
            <button
              type="button"
              className="flex-1 py-3.5 bg-[hsl(var(--snug-orange))] text-white text-sm font-semibold rounded-full hover:opacity-90 transition-opacity"
            >
              Payment
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
              <div className="w-20 h-16 rounded-2xl overflow-hidden bg-[hsl(var(--snug-light-gray))] flex items-center justify-center flex-shrink-0">
                <ImageIcon className="w-6 h-6 text-[hsl(var(--snug-gray))]/30" />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-xs text-[hsl(var(--snug-gray))]">{roomData.location}</p>
                <p className="text-sm font-bold text-[hsl(var(--snug-text-primary))]">
                  {roomData.title}
                </p>
              </div>
            </div>

            {/* Booking Details */}
            <div className="flex items-center gap-6 text-sm text-[hsl(var(--snug-text-primary))] mb-5 px-5 py-3.5 border border-[hsl(var(--snug-border))] rounded-full">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
                <span>
                  {checkIn} - {checkOut}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
                <span>{guests} Guest</span>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-4">
              <div className="flex items-start justify-between pb-4 border-b border-[hsl(var(--snug-border))]">
                <div>
                  <p className="text-sm text-[hsl(var(--snug-text-primary))]">Rent for 1 Night</p>
                  <p className="text-sm text-[hsl(var(--snug-gray))]">
                    (Including Maintenance Fee)
                  </p>
                </div>
                <span className="text-sm font-semibold text-[hsl(var(--snug-orange))]">
                  ${roomData.pricePerNight}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                  {nights}nights X ${roomData.pricePerNight}
                </span>
                <span className="text-sm text-[hsl(var(--snug-text-primary))]">${rentTotal}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                  Cleaning(After check-out)
                </span>
                <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                  ${roomData.cleaningFee}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                  Deposit(Refundable)
                </span>
                <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                  ${roomData.deposit}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                    Long-stay Discount(Over {roomData.longStayThreshold} days)
                  </span>
                  <span className="text-sm text-[hsl(var(--snug-orange))]">-${discount}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-[hsl(var(--snug-border))]">
                <span className="text-base font-bold text-[hsl(var(--snug-text-primary))]">
                  Total
                </span>
                <span className="text-base font-bold text-[hsl(var(--snug-text-primary))]">
                  ${total}
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
                <span>Chat with Host</span>
              </button>
              {/* Payment Button */}
              <button
                type="button"
                className="flex-1 py-3.5 bg-[hsl(var(--snug-orange))] text-white text-sm font-semibold rounded-full hover:opacity-90 transition-opacity"
              >
                Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
