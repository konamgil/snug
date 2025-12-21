'use client';

import { memo } from 'react';
import { Minus, Plus } from 'lucide-react';

export interface GuestCount {
  adults: number;
  children: number;
  infants: number;
}

interface GuestPickerProps {
  guests: GuestCount;
  onGuestChange: (guests: GuestCount) => void;
  className?: string;
}

interface GuestRowProps {
  label: string;
  description: string;
  count: number;
  onDecrement: () => void;
  onIncrement: () => void;
  minCount?: number;
  maxCount?: number;
}

const GuestRow = memo(function GuestRow({
  label,
  description,
  count,
  onDecrement,
  onIncrement,
  minCount = 0,
  maxCount = 10,
}: GuestRowProps) {
  const canDecrement = count > minCount;
  const canIncrement = count < maxCount;

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (canDecrement) {
      onDecrement();
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (canIncrement) {
      onIncrement();
    }
  };

  return (
    <div className="flex items-center justify-between py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-[hsl(var(--snug-text-primary))] tracking-tight whitespace-nowrap">
          {label}
        </p>
        <p className="text-xs text-[hsl(var(--snug-gray))] tracking-tight whitespace-nowrap">
          {description}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={!canDecrement}
          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
            canDecrement
              ? 'border-[hsl(var(--snug-gray))] text-[hsl(var(--snug-text-primary))] hover:border-[hsl(var(--snug-text-primary))]'
              : 'border-[hsl(var(--snug-border))] text-[hsl(var(--snug-placeholder))] cursor-not-allowed'
          }`}
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-6 text-center text-sm font-medium text-[hsl(var(--snug-text-primary))]">
          {count}
        </span>
        <button
          type="button"
          onClick={handleIncrement}
          disabled={!canIncrement}
          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
            canIncrement
              ? 'border-[hsl(var(--snug-gray))] text-[hsl(var(--snug-text-primary))] hover:border-[hsl(var(--snug-text-primary))]'
              : 'border-[hsl(var(--snug-border))] text-[hsl(var(--snug-placeholder))] cursor-not-allowed'
          }`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});

export const GuestPicker = memo(function GuestPicker({
  guests,
  onGuestChange,
  className,
}: GuestPickerProps) {
  const handleAdultsChange = (delta: number) => {
    const newAdults = Math.max(0, Math.min(10, guests.adults + delta));
    onGuestChange({ ...guests, adults: newAdults });
  };

  const handleChildrenChange = (delta: number) => {
    const newChildren = Math.max(0, Math.min(10, guests.children + delta));
    onGuestChange({ ...guests, children: newChildren });
  };

  const handleInfantsChange = (delta: number) => {
    const newInfants = Math.max(0, Math.min(5, guests.infants + delta));
    onGuestChange({ ...guests, infants: newInfants });
  };

  return (
    <div className={`w-full ${className ?? ''}`}>
      <GuestRow
        label="Adults"
        description="Ages 13 or above"
        count={guests.adults}
        onDecrement={() => handleAdultsChange(-1)}
        onIncrement={() => handleAdultsChange(1)}
        minCount={0}
        maxCount={10}
      />

      <div className="border-t border-[hsl(var(--snug-border))]" />

      <GuestRow
        label="Children"
        description="Ages 2-12"
        count={guests.children}
        onDecrement={() => handleChildrenChange(-1)}
        onIncrement={() => handleChildrenChange(1)}
        minCount={0}
        maxCount={10}
      />

      <div className="border-t border-[hsl(var(--snug-border))]" />

      <GuestRow
        label="Infants"
        description="Under 2 years old"
        count={guests.infants}
        onDecrement={() => handleInfantsChange(-1)}
        onIncrement={() => handleInfantsChange(1)}
        minCount={0}
        maxCount={5}
      />
    </div>
  );
});

export function formatGuestSummary(guests: GuestCount): string | null {
  const { adults, children, infants } = guests;

  // Default state (all zeros)
  if (adults === 0 && children === 0 && infants === 0) {
    return null;
  }

  const parts: string[] = [];

  // Count guests (adults + children)
  const guestCount = adults + children;
  if (guestCount > 0) {
    parts.push(`${guestCount} Guest${guestCount > 1 ? 's' : ''}`);
  }

  // Count infants separately
  if (infants > 0) {
    parts.push(`${infants} Infant${infants > 1 ? 's' : ''}`);
  }

  return parts.join(', ');
}
