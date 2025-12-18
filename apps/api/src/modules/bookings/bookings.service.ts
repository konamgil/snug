import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookingDto, UpdateBookingStatusDto } from './dto';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(guestId: string, data: CreateBookingDto) {
    const room = await this.prisma.room.findUnique({
      where: { id: data.roomId },
    });

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
    const overlapping = await this.prisma.booking.findFirst({
      where: {
        roomId: data.roomId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        OR: [
          {
            AND: [{ checkIn: { lte: checkIn } }, { checkOut: { gt: checkIn } }],
          },
          {
            AND: [{ checkIn: { lt: checkOut } }, { checkOut: { gte: checkOut } }],
          },
          {
            AND: [{ checkIn: { gte: checkIn } }, { checkOut: { lte: checkOut } }],
          },
        ],
      },
    });

    if (overlapping) {
      throw new BadRequestException('Room is not available for selected dates');
    }

    // Calculate total price (monthly rate)
    const months = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24 * 30));
    const totalPrice = room.price * months + room.deposit;

    // Create booking with chat room
    const booking = await this.prisma.booking.create({
      data: {
        roomId: data.roomId,
        guestId,
        checkIn,
        checkOut,
        totalPrice,
        status: 'PENDING',
        chatRoom: {
          create: {
            participants: {
              connect: [{ id: guestId }, { id: room.hostId }],
            },
          },
        },
      },
      include: {
        room: {
          include: {
            host: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        guest: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        chatRoom: true,
      },
    });

    return booking;
  }

  async findAll(userId: string, role: 'guest' | 'host') {
    const where = role === 'guest' ? { guestId: userId } : { room: { hostId: userId } };

    return this.prisma.booking.findMany({
      where,
      include: {
        room: {
          include: {
            host: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        guest: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        room: {
          include: {
            host: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        guest: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        payment: true,
        chatRoom: true,
      },
    });

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
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        room: true,
      },
    });

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

    return this.prisma.booking.update({
      where: { id },
      data: { status: data.status },
      include: {
        room: true,
        guest: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
  }

  async createReview(bookingId: string, userId: string, data: { rating: number; comment: string }) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { room: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.guestId !== userId) {
      throw new ForbiddenException('Only guest can write reviews');
    }

    if (booking.status !== 'COMPLETED') {
      throw new BadRequestException('Can only review completed bookings');
    }

    const existingReview = await this.prisma.review.findFirst({
      where: { bookingId },
    });

    if (existingReview) {
      throw new BadRequestException('Review already exists for this booking');
    }

    return this.prisma.review.create({
      data: {
        bookingId,
        roomId: booking.roomId,
        guestId: userId,
        rating: data.rating,
        comment: data.comment,
      },
      include: {
        guest: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
  }
}
