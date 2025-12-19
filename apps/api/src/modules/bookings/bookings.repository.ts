import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../common/repositories';
import { PrismaService } from '../../prisma/prisma.service';
import { Booking, BookingStatus, Review } from '@prisma/client';

const USER_SELECT = {
  id: true,
  name: true,
  avatar: true,
} as const;

const BOOKING_INCLUDE = {
  room: {
    include: {
      host: { select: USER_SELECT },
    },
  },
  guest: { select: USER_SELECT },
  payment: true,
  chatRoom: true,
} as const;

@Injectable()
export class BookingsRepository extends BaseRepository<Booking> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findRoomById(roomId: string) {
    return this.prisma.room.findUnique({
      where: { id: roomId },
    });
  }

  async findOverlappingBooking(roomId: string, checkIn: Date, checkOut: Date) {
    return this.prisma.booking.findFirst({
      where: {
        roomId,
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
  }

  async create(data: {
    roomId: string;
    guestId: string;
    hostId: string;
    checkIn: Date;
    checkOut: Date;
    totalMonths: number;
    monthlyPrice: number;
    deposit: number;
    totalPrice: number;
    specialRequests?: string;
  }) {
    return this.prisma.booking.create({
      data: {
        roomId: data.roomId,
        guestId: data.guestId,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        totalMonths: data.totalMonths,
        monthlyPrice: data.monthlyPrice,
        deposit: data.deposit,
        totalPrice: data.totalPrice,
        specialRequests: data.specialRequests,
        status: 'PENDING',
        chatRoom: {
          create: {
            participants: {
              connect: [{ id: data.guestId }, { id: data.hostId }],
            },
          },
        },
      },
      include: {
        ...BOOKING_INCLUDE,
        chatRoom: true,
      },
    });
  }

  async findByGuestId(guestId: string) {
    return this.prisma.booking.findMany({
      where: { guestId },
      include: BOOKING_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByHostId(hostId: string) {
    return this.prisma.booking.findMany({
      where: { room: { hostId } },
      include: BOOKING_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.booking.findUnique({
      where: { id },
      include: BOOKING_INCLUDE,
    });
  }

  async findByIdWithRoom(id: string) {
    return this.prisma.booking.findUnique({
      where: { id },
      include: { room: true },
    });
  }

  async updateStatus(id: string, status: BookingStatus) {
    return this.prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        room: true,
        guest: { select: USER_SELECT },
      },
    });
  }

  async findReviewByRoomAndAuthor(roomId: string, authorId: string) {
    return this.prisma.review.findUnique({
      where: { roomId_authorId: { roomId, authorId } },
    });
  }

  async createReview(data: {
    roomId: string;
    authorId: string;
    targetId: string;
    rating: number;
    comment?: string;
  }): Promise<Review> {
    return this.prisma.review.create({
      data,
      include: {
        author: { select: USER_SELECT },
      },
    }) as unknown as Review;
  }
}
