'use client';

import { useState, useMemo, memo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  checkIn: Date | null;
  checkOut: Date | null;
  onDateSelect: (checkIn: Date | null, checkOut: Date | null) => void;
  className?: string;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function isDateInRange(date: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;
  return date > start && date < end;
}

function isDateBefore(date: Date, compareDate: Date): boolean {
  const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const d2 = new Date(compareDate.getFullYear(), compareDate.getMonth(), compareDate.getDate());
  return d1 < d2;
}

interface CalendarMonthProps {
  year: number;
  month: number;
  today: Date;
  checkIn: Date | null;
  checkOut: Date | null;
  onDateClick: (date: Date) => void;
}

const CalendarMonth = memo(function CalendarMonth({
  year,
  month,
  today,
  checkIn,
  checkOut,
  onDateClick,
}: CalendarMonthProps) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const days: (number | null)[] = [];

  // Add empty slots for days before the first day of month
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <div className="w-full">
      {/* Month Header */}
      <div className="text-center mb-3">
        <span className="text-sm font-semibold text-[hsl(var(--snug-text-primary))] tracking-tight">
          {MONTH_NAMES[month]} {year}
        </span>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-0 mb-1">
        {WEEKDAYS.map((day, index) => (
          <div
            key={`${day}-${index}`}
            className="h-8 flex items-center justify-center text-xs text-[hsl(var(--snug-gray))] font-medium"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-0">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="h-8" />;
          }

          const date = new Date(year, month, day);
          const isToday = isSameDay(date, today);
          const isPast = isDateBefore(date, today);
          const isCheckIn = checkIn && isSameDay(date, checkIn);
          const isCheckOut = checkOut && isSameDay(date, checkOut);
          const isInRange = isDateInRange(date, checkIn, checkOut);
          const isSelected = isCheckIn || isCheckOut;
          const isDisabled = isPast;
          const hasRange = checkIn && checkOut;

          // Range connection styles
          const isRangeStart = isCheckIn && hasRange;
          const isRangeEnd = isCheckOut && hasRange;

          return (
            <button
              key={`day-${day}`}
              type="button"
              disabled={isDisabled}
              onClick={() => !isDisabled && onDateClick(date)}
              className={`
                h-8 flex items-center justify-center text-sm relative
                transition-colors duration-150
                ${isDisabled ? 'text-[hsl(var(--snug-placeholder))] cursor-not-allowed' : 'cursor-pointer'}
                ${isToday && !isSelected ? 'text-[#F5A3B5] font-semibold' : ''}
                ${isSelected ? 'text-white font-semibold' : ''}
                ${!isDisabled && !isSelected && !isToday ? 'text-[hsl(var(--snug-text-primary))] hover:bg-[hsl(var(--snug-light-gray))] rounded-full' : ''}
              `}
            >
              {/* Range background - full width for middle dates */}
              {isInRange && <span className="absolute inset-0 bg-[#FDF0F2]" />}
              {/* Range start - right half background */}
              {isRangeStart && (
                <span className="absolute top-0 right-0 w-1/2 h-full bg-[#FDF0F2]" />
              )}
              {/* Range end - left half background */}
              {isRangeEnd && <span className="absolute top-0 left-0 w-1/2 h-full bg-[#FDF0F2]" />}
              {/* Selection Circle */}
              {isSelected && (
                <span className="absolute inset-0 flex items-center justify-center z-10">
                  <span className="w-8 h-8 rounded-full bg-[#F5A3B5]" />
                </span>
              )}
              {/* Today Circle (outline only) */}
              {isToday && !isSelected && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="w-8 h-8 rounded-full border-2 border-[#F5A3B5]" />
                </span>
              )}
              <span className="relative z-20">{day}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

export const DatePicker = memo(function DatePicker({
  checkIn,
  checkOut,
  onDateSelect,
  className,
}: DatePickerProps) {
  const today = useMemo(() => new Date(), []);
  const [baseMonth, setBaseMonth] = useState(() => ({
    year: today.getFullYear(),
    month: today.getMonth(),
  }));

  const nextMonth = useMemo(() => {
    const next = new Date(baseMonth.year, baseMonth.month + 1, 1);
    return { year: next.getFullYear(), month: next.getMonth() };
  }, [baseMonth]);

  const handlePrevMonth = () => {
    const prev = new Date(baseMonth.year, baseMonth.month - 1, 1);
    // Don't allow going before current month
    if (
      prev.getFullYear() > today.getFullYear() ||
      (prev.getFullYear() === today.getFullYear() && prev.getMonth() >= today.getMonth())
    ) {
      setBaseMonth({ year: prev.getFullYear(), month: prev.getMonth() });
    }
  };

  const handleNextMonth = () => {
    const next = new Date(baseMonth.year, baseMonth.month + 1, 1);
    setBaseMonth({ year: next.getFullYear(), month: next.getMonth() });
  };

  const handleDateClick = (date: Date) => {
    // If no check-in date or both dates are selected, start fresh with new check-in
    if (!checkIn || (checkIn && checkOut)) {
      onDateSelect(date, null);
      return;
    }

    // If check-in is selected and clicked date is before check-in, make it new check-in
    if (isDateBefore(date, checkIn)) {
      onDateSelect(date, null);
      return;
    }

    // Otherwise, set as check-out
    onDateSelect(checkIn, date);
  };

  const canGoPrev =
    baseMonth.year > today.getFullYear() ||
    (baseMonth.year === today.getFullYear() && baseMonth.month > today.getMonth());

  return (
    <div className={`w-full ${className ?? ''}`}>
      {/* Navigation */}
      <div className="flex items-center justify-between mb-2 px-1">
        <button
          type="button"
          onClick={handlePrevMonth}
          disabled={!canGoPrev}
          className={`p-1 rounded-full transition-colors ${
            canGoPrev
              ? 'hover:bg-[hsl(var(--snug-light-gray))] text-[hsl(var(--snug-text-primary))]'
              : 'text-[hsl(var(--snug-placeholder))] cursor-not-allowed'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleNextMonth}
          className="p-1 rounded-full hover:bg-[hsl(var(--snug-light-gray))] text-[hsl(var(--snug-text-primary))] transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Two Month Calendar */}
      <div className="space-y-4">
        <CalendarMonth
          year={baseMonth.year}
          month={baseMonth.month}
          today={today}
          checkIn={checkIn}
          checkOut={checkOut}
          onDateClick={handleDateClick}
        />
        <CalendarMonth
          year={nextMonth.year}
          month={nextMonth.month}
          today={today}
          checkIn={checkIn}
          checkOut={checkOut}
          onDateClick={handleDateClick}
        />
      </div>
    </div>
  );
});
