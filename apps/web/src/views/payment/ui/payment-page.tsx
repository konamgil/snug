'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ImageIcon, Calendar, Users, MessageSquare, Plus } from 'lucide-react';

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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-[hsl(var(--snug-border))]">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center">
          <button
            type="button"
            onClick={handleBack}
            className="p-2 hover:bg-[hsl(var(--snug-light-gray))] rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-12">
          {/* Left Column - Form */}
          <div className="flex-1 max-w-xl">
            {/* Title */}
            <h1 className="text-xl font-bold text-[hsl(var(--snug-text-primary))] mb-2">
              Additional information
            </h1>
            <p className="text-sm text-[hsl(var(--snug-gray))] mb-8">
              Please let the host know what to keep in mind.
            </p>

            {/* Reason for booking */}
            <div className="mb-8">
              <h2 className="text-base font-semibold text-[hsl(var(--snug-text-primary))] mb-3">
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
                        ? 'bg-[hsl(var(--snug-orange))] text-white'
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-[hsl(var(--snug-text-primary))]">
                  Final information
                </h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sameAsAccount}
                    onChange={(e) => setSameAsAccount(e.target.checked)}
                    className="w-4 h-4 rounded border-[hsl(var(--snug-border))] text-[hsl(var(--snug-orange))] focus:ring-[hsl(var(--snug-orange))]"
                  />
                  <span className="text-sm text-[hsl(var(--snug-gray))]">Same as Account Info</span>
                </label>
              </div>

              <h3 className="text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-3">
                Your information
              </h3>

              {/* Name */}
              <div className="mb-4">
                <label className="block text-xs text-[hsl(var(--snug-gray))] mb-1.5">Name</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="flex-1 px-4 py-2.5 border border-[hsl(var(--snug-border))] rounded-lg text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                  />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="flex-1 px-4 py-2.5 border border-[hsl(var(--snug-border))] rounded-lg text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className="block text-xs text-[hsl(var(--snug-gray))] mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-4 py-2.5 border border-[hsl(var(--snug-border))] rounded-lg text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                />
              </div>

              {/* Phone */}
              <div className="mb-4">
                <label className="block text-xs text-[hsl(var(--snug-gray))] mb-1.5">
                  Phone number
                </label>
                <div className="flex gap-3">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-[160px] px-3 py-2.5 border border-[hsl(var(--snug-border))] rounded-lg text-sm bg-white focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                  >
                    <option value="+82 (South Korea)">+82 (South Korea)</option>
                    <option value="+1 (USA)">+1 (USA)</option>
                    <option value="+86 (China)">+86 (China)</option>
                    <option value="+81 (Japan)">+81 (Japan)</option>
                  </select>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010-1234-5678"
                    className="flex-1 px-4 py-2.5 border border-[hsl(var(--snug-border))] rounded-lg text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                  />
                </div>
              </div>

              {/* Passport */}
              <div className="mb-4">
                <label className="block text-xs text-[hsl(var(--snug-gray))] mb-1.5">
                  Passport number
                </label>
                <input
                  type="text"
                  value={passport}
                  onChange={(e) => setPassport(e.target.value)}
                  placeholder="M 123456"
                  className="w-full max-w-[280px] px-4 py-2.5 border border-[hsl(var(--snug-border))] rounded-lg text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-[hsl(var(--snug-text-primary))]">
                  Payer name
                </h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={payerSameAsAccount}
                    onChange={(e) => setPayerSameAsAccount(e.target.checked)}
                    className="w-4 h-4 rounded border-[hsl(var(--snug-border))] text-[hsl(var(--snug-orange))] focus:ring-[hsl(var(--snug-orange))]"
                  />
                  <span className="text-sm text-[hsl(var(--snug-gray))]">Same as Account Info</span>
                </label>
              </div>

              <label className="block text-xs text-[hsl(var(--snug-gray))] mb-1.5">Name</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={payerFirstName}
                  onChange={(e) => setPayerFirstName(e.target.value)}
                  placeholder="First name"
                  className="flex-1 px-4 py-2.5 border border-[hsl(var(--snug-border))] rounded-lg text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                />
                <input
                  type="text"
                  value={payerLastName}
                  onChange={(e) => setPayerLastName(e.target.value)}
                  placeholder="Last name"
                  className="flex-1 px-4 py-2.5 border border-[hsl(var(--snug-border))] rounded-lg text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
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

          {/* Right Column - Payment Summary */}
          <div className="w-[340px] flex-shrink-0">
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
    </div>
  );
}
