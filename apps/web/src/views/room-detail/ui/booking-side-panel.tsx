'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { CalendarIcon, UserIcon, ChatIcon, SearchIcon } from '@/shared/ui/icons';
import { PriceSkeleton } from '@/shared/ui';
import { DatePicker } from '@/features/search/ui/date-picker';
import {
  GuestPicker,
  formatGuestSummary,
  type GuestCount,
} from '@/features/search/ui/guest-picker';
import { useCurrencySafe } from '@/shared/providers';
import { SERVICE_FEE_PERCENT, getLongStayDiscountPercent } from '@/shared/config';

interface PriceBreakdown {
  pricePerNight: number;
  nights: number;
  cleaningFee: number;
}

export type RoomTypeVariant = 'shared-room' | 'shared-house' | 'house';

interface BookingSidePanelProps {
  roomType: string;
  roomTypeDescription: string;
  roomTypeVariant?: RoomTypeVariant;
  priceBreakdown: PriceBreakdown;
  isPriceLoading?: boolean;
  initialCheckIn?: Date | null;
  initialCheckOut?: Date | null;
  initialGuests?: GuestCount;
  onBook: () => void;
  onChatWithHost: () => void;
}

function formatDate(date: Date): string {
  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = date.getDate();
  const year = date.getFullYear().toString().slice(-2);
  return `${month} ${day}, ${year}`;
}

function formatDateRange(
  checkIn: Date | null,
  checkOut: Date | null,
  selectDatesText: string,
): string {
  if (checkIn && checkOut) {
    return `${formatDate(checkIn)} - ${formatDate(checkOut)}`;
  }
  if (checkIn) {
    return formatDate(checkIn);
  }
  return selectDatesText;
}

const roomTypeColors: Record<RoomTypeVariant, string> = {
  'shared-room': 'text-[hsl(var(--snug-orange))]',
  'shared-house': 'text-[#F472B6]',
  house: 'text-[#78350F]',
};

export function BookingSidePanel({
  roomType,
  roomTypeDescription,
  roomTypeVariant = 'shared-room',
  priceBreakdown,
  isPriceLoading = false,
  initialCheckIn = null,
  initialCheckOut = null,
  initialGuests = { adults: 1, children: 0, infants: 0 },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onBook,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onChatWithHost,
}: BookingSidePanelProps) {
  const t = useTranslations();
  const { format } = useCurrencySafe();
  const [activeDropdown, setActiveDropdown] = useState<'dates' | 'guests' | null>(null);
  const [lastDropdown, setLastDropdown] = useState<'dates' | 'guests' | null>(null);
  const [checkIn, setCheckIn] = useState<Date | null>(initialCheckIn);
  const [checkOut, setCheckOut] = useState<Date | null>(initialCheckOut);
  const [guests, setGuests] = useState<GuestCount>(initialGuests);

  const panelRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const guestPickerRef = useRef<HTMLDivElement>(null);

  // Calculate nights from dates
  const nights =
    checkIn && checkOut
      ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
      : priceBreakdown.nights;

  // Price calculations
  const subtotal = priceBreakdown.pricePerNight * nights;

  // Long-term stay discount calculation using config
  const discountPercent = getLongStayDiscountPercent(nights);
  const longStayDiscount = Math.round(subtotal * (discountPercent / 100));

  // Service fee calculation using config
  const serviceFee = Math.round(subtotal * (SERVICE_FEE_PERCENT / 100));
  const total = subtotal + priceBreakdown.cleaningFee + serviceFee - longStayDiscount;

  // Handle click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }

    if (activeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);

  // Update last dropdown for animation
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (activeDropdown) {
      timer = setTimeout(() => {
        setLastDropdown(activeDropdown);
      }, 0);
    } else {
      timer = setTimeout(() => {
        setLastDropdown(null);
      }, 300);
    }
    return () => clearTimeout(timer);
  }, [activeDropdown]);

  const visibleDropdown = activeDropdown || lastDropdown;
  const isExpanded = activeDropdown !== null;

  const handleDateSelect = useCallback((newCheckIn: Date | null, newCheckOut: Date | null) => {
    setCheckIn(newCheckIn);
    setCheckOut(newCheckOut);
  }, []);

  const handleGuestChange = useCallback((newGuests: GuestCount) => {
    setGuests(newGuests);
  }, []);

  const handleApply = () => {
    setActiveDropdown(null);
  };

  const guestSummary = formatGuestSummary(guests) || t('roomDetail.guest', { count: 1 });
  const dateDisplay = formatDateRange(checkIn, checkOut, t('roomDetail.selectDates'));

  return (
    <div ref={panelRef} className="w-full">
      {/* Date & Guest Selector */}
      <div
        className={`bg-white border rounded-[20px] w-full transition-all duration-300 ease-out mb-4 ${
          isExpanded ? 'border-[hsl(var(--snug-orange))]' : 'border-[hsl(var(--snug-border))]'
        }`}
      >
        {/* Selector Row */}
        <div className="flex items-center h-11 px-4">
          {/* Date Selector */}
          <button
            type="button"
            onClick={() => {
              setActiveDropdown(activeDropdown === 'dates' ? null : 'dates');
            }}
            className="flex items-center gap-1.5 flex-1 min-w-0"
          >
            <CalendarIcon
              className={`w-3 h-3 flex-shrink-0 transition-colors ${
                activeDropdown === 'dates'
                  ? 'text-[hsl(var(--snug-orange))]'
                  : 'text-[hsl(var(--snug-gray))]'
              }`}
            />
            <span
              className={`text-xs tracking-tight truncate transition-colors ${
                activeDropdown === 'dates'
                  ? 'text-[hsl(var(--snug-orange))]'
                  : 'text-[hsl(var(--snug-text-primary))]'
              }`}
            >
              {dateDisplay}
            </span>
          </button>

          {/* Divider */}
          <div className="w-px h-4 bg-[hsl(var(--snug-border))] mx-3" />

          {/* Guest Selector */}
          <button
            type="button"
            onClick={() => {
              setActiveDropdown(activeDropdown === 'guests' ? null : 'guests');
            }}
            className="flex items-center gap-1.5"
          >
            <UserIcon
              className={`w-3 h-3 flex-shrink-0 transition-colors ${
                activeDropdown === 'guests'
                  ? 'text-[hsl(var(--snug-orange))]'
                  : 'text-[hsl(var(--snug-gray))]'
              }`}
            />
            <span
              className={`text-xs tracking-tight whitespace-nowrap transition-colors ${
                activeDropdown === 'guests'
                  ? 'text-[hsl(var(--snug-orange))]'
                  : 'text-[hsl(var(--snug-text-primary))]'
              }`}
            >
              {guestSummary}
            </span>
          </button>

          {/* Apply Button */}
          <button
            type="button"
            onClick={handleApply}
            className="w-8 h-8 ml-3 rounded-full bg-[hsl(var(--snug-orange))] flex items-center justify-center hover:opacity-90 transition-opacity flex-shrink-0"
          >
            <SearchIcon className="w-3.5 h-3.5 text-white" />
          </button>
        </div>

        {/* Expandable Dropdown */}
        <div
          className={`grid transition-[grid-template-rows] duration-300 ease-out ${
            isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div className="overflow-hidden">
            {visibleDropdown && <div className="border-t border-[hsl(var(--snug-border))]" />}

            {/* Date Picker */}
            {visibleDropdown === 'dates' && (
              <div className="p-4" ref={datePickerRef}>
                <DatePicker checkIn={checkIn} checkOut={checkOut} onDateSelect={handleDateSelect} />
              </div>
            )}

            {/* Guest Picker */}
            {visibleDropdown === 'guests' && (
              <div className="p-4" ref={guestPickerRef}>
                <GuestPicker guests={guests} onGuestChange={handleGuestChange} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Price Breakdown Card */}
      <div className="border border-[hsl(var(--snug-border))] rounded-[20px] p-5 mb-4">
        {isPriceLoading ? (
          <PriceSkeleton variant="card" />
        ) : (
          <div className="space-y-3.5">
            {/* Rent for 1 Night */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-[hsl(var(--snug-gray))]">
                  {t('roomDetail.booking.rentPerNight')}
                </p>
                <p className="text-xs text-[hsl(var(--snug-gray))]">
                  {t('roomDetail.booking.includingMaintenance')}
                </p>
              </div>
              <span className="text-sm font-extrabold text-[hsl(var(--snug-orange))]">
                {format(priceBreakdown.pricePerNight)}
              </span>
            </div>

            <div className="h-px bg-[#f0f0f0]" />

            {/* Nights calculation */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-[hsl(var(--snug-gray))] tracking-tight">
                {t('roomDetail.booking.nightsCalculation', {
                  nights,
                  price: format(priceBreakdown.pricePerNight),
                })}
              </span>
              <span className="text-xs text-[hsl(var(--snug-gray))] tracking-tight">
                {format(subtotal)}
              </span>
            </div>

            {/* Cleaning fee */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-[hsl(var(--snug-gray))]">
                {t('roomDetail.booking.cleaningFee')}
              </span>
              <span className="text-xs text-[hsl(var(--snug-gray))]">
                {format(priceBreakdown.cleaningFee)}
              </span>
            </div>

            {/* Long-stay Discount */}
            {longStayDiscount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-[hsl(var(--snug-gray))] tracking-tight">
                  {t('roomDetail.booking.longStayDiscountApplied', {
                    percent: discountPercent,
                  })}
                </span>
                <span className="text-xs text-[hsl(var(--snug-orange))]">
                  -{format(longStayDiscount)}
                </span>
              </div>
            )}

            {/* Service fee */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-[hsl(var(--snug-gray))] tracking-tight">
                {t('roomDetail.booking.serviceFee', { percent: SERVICE_FEE_PERCENT })}
              </span>
              <span className="text-xs text-[hsl(var(--snug-gray))]">{format(serviceFee)}</span>
            </div>

            <div className="h-px bg-[#f0f0f0]" />

            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-extrabold text-[hsl(var(--snug-text-primary))] tracking-tight">
                {t('roomDetail.booking.total')}
              </span>
              <span className="text-sm font-extrabold text-[hsl(var(--snug-text-primary))] tracking-tight">
                {format(total)}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons - Disabled until official launch */}
        <div className="flex flex-col gap-2 mt-4">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={true}
              className="flex items-center justify-center gap-1 h-8 px-2.5 bg-white rounded text-xs font-extrabold text-[hsl(var(--snug-text-primary))] opacity-50 cursor-not-allowed tracking-tight"
            >
              <ChatIcon className="w-3.5 h-3.5" />
              <span>{t('roomDetail.booking.chatWithHost')}</span>
            </button>
            <button
              type="button"
              disabled={true}
              className="flex-1 h-8 bg-[hsl(var(--snug-orange))] text-white text-xs font-extrabold rounded-full opacity-50 cursor-not-allowed tracking-tight"
            >
              {t('roomDetail.booking.book')}
            </button>
          </div>
          <p className="text-[10px] text-center text-[hsl(var(--snug-gray))]">
            {t('roomDetail.booking.comingSoon')}
          </p>
        </div>
      </div>

      {/* Room Type Card */}
      <div className="border border-[hsl(var(--snug-border))] rounded-full py-4 px-6 text-center">
        <p className={`text-sm font-bold mb-1 ${roomTypeColors[roomTypeVariant]}`}>{roomType}</p>
        <p className="text-xs text-[hsl(var(--snug-gray))] leading-relaxed">
          {roomTypeDescription}
        </p>
      </div>
    </div>
  );
}
