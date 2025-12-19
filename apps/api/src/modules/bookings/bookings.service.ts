import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { BookingsRepository } from './bookings.repository';
import { CreateBookingDto, UpdateBookingStatusDto } from './dto';

@Injectable()
export class BookingsService {
  constructor(private readonly bookingsRepository: BookingsRepository) {}

  async create(guestId: string, data: CreateBookingDto) {
    const room = await this.bookingsRepository.findRoomById(data.roomId);

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.status !== 'ACTIVE') {
      throw new BadRequestException('Room is not available for booking');
    }

    if (room.hostId === guestId) {
      throw new BadRequestException('You cannot book your own room');
    }

    const checkIn = new Date(data.checkIn);
    const checkOut = new Date(data.checkOut);

    if (checkIn >= checkOut) {
      throw new BadRequestException('Check-out date must be after check-in date');
    }

    // Check for overlapping bookings
    const overlapping = await this.bookingsRepository.findOverlappingBooking(
      data.roomId,
      checkIn,
      checkOut,
    );

    if (overlapping) {
      throw new BadRequestException('Room is not available for selected dates');
    }

    // Calculate total months and pricing
    const totalMonths = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24 * 30),
    );
    const monthlyPrice = room.price;
    const deposit = room.deposit;
    const totalPrice = monthlyPrice * totalMonths + deposit;

    return this.bookingsRepository.create({
      roomId: data.roomId,
      guestId,
      hostId: room.hostId,
      checkIn,
      checkOut,
      totalMonths,
      monthlyPrice,
      deposit,
      totalPrice,
      specialRequests: data.message,
    });
  }

  async findAll(userId: string, role: 'guest' | 'host') {
    if (role === 'guest') {
      return this.bookingsRepository.findByGuestId(userId);
    }
    return this.bookingsRepository.findByHostId(userId);
  }

  async findOne(id: string, userId: string) {
    const booking = await this.bookingsRepository.findById(id);

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Check access permission
    if (booking.guestId !== userId && booking.room.hostId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return booking;
  }

  async updateStatus(id: string, userId: string, data: UpdateBookingStatusDto) {
    const booking = await this.bookingsRepository.findByIdWithRoom(id);

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Only host can confirm, both can cancel
    if (data.status === 'CONFIRMED' && booking.room.hostId !== userId) {
      throw new ForbiddenException('Only host can confirm bookings');
    }

    if (
      data.status === 'CANCELLED' &&
      booking.guestId !== userId &&
      booking.room.hostId !== userId
    ) {
      throw new ForbiddenException('Access denied');
    }

    return this.bookingsRepository.updateStatus(id, data.status);
  }

  async createReview(
    bookingId: string,
    userId: string,
    data: { rating: number; comment?: string },
  ) {
    const booking = await this.bookingsRepository.findByIdWithRoom(bookingId);

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.guestId !== userId) {
      throw new ForbiddenException('Only guest can write reviews');
    }

    if (booking.status !== 'COMPLETED') {
      throw new BadRequestException('Can only review completed bookings');
    }

    // Check if user already reviewed this room
    const existingReview = await this.bookingsRepository.findReviewByRoomAndAuthor(
      booking.roomId,
      userId,
    );

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this room');
    }

    return this.bookingsRepository.createReview({
      roomId: booking.roomId,
      authorId: userId,
      targetId: booking.room.hostId,
      rating: data.rating,
      comment: data.comment,
    });
  }
}
