// Booking Types

import type { Room, RoomListItem } from './room';
import type { UserProfile } from './user';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'REFUNDED';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'STRIPE' | 'TOSS' | 'BANK_TRANSFER';

export interface Booking {
  id: string;
  checkIn: Date;
  checkOut: Date;
  totalMonths: number;
  monthlyPrice: number;
  deposit: number;
  totalPrice: number;
  status: BookingStatus;
  guestCount: number;
  specialRequests: string | null;
  cancelledAt: Date | null;
  cancelReason: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  roomId: string;
  room?: Room | RoomListItem;
  guestId: string;
  guest?: UserProfile;
  payment?: Payment;
}

export interface BookingListItem extends Pick<
  Booking,
  'id' | 'checkIn' | 'checkOut' | 'totalMonths' | 'totalPrice' | 'status' | 'createdAt'
> {
  room?: RoomListItem;
  guest?: UserProfile;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId: string | null;
  receiptUrl: string | null;
  refundedAt: Date | null;
  refundAmount: number | null;
  refundReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  bookingId: string;
}

export interface CreateBookingInput {
  roomId: string;
  checkIn: Date;
  checkOut: Date;
  guestCount?: number;
  specialRequests?: string;
}

export interface UpdateBookingInput {
  status?: BookingStatus;
  cancelReason?: string;
}

export interface CreatePaymentInput {
  bookingId: string;
  method: PaymentMethod;
}
