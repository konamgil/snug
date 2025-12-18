import { Injectable } from '@nestjs/common';
import { Prisma } from '@snug/database';
import { PrismaService } from '../../prisma/prisma.service';
import { BaseRepository, PaginatedResult } from '../../common/repositories';
import { SearchRoomsDto } from './dto';

// Select fields for room queries
const roomSelect = {
  id: true,
  title: true,
  description: true,
  type: true,
  price: true,
  deposit: true,
  address: true,
  latitude: true,
  longitude: true,
  images: true,
  amenities: true,
  status: true,
  minStay: true,
  maxStay: true,
  createdAt: true,
  updatedAt: true,
  host: {
    select: {
      id: true,
      name: true,
      avatar: true,
    },
  },
} satisfies Prisma.RoomSelect;

const roomWithCountsSelect = {
  ...roomSelect,
  _count: {
    select: {
      reviews: true,
      favorites: true,
    },
  },
} satisfies Prisma.RoomSelect;

type RoomWithHost = Prisma.RoomGetPayload<{ select: typeof roomSelect }>;
type RoomWithCounts = Prisma.RoomGetPayload<{ select: typeof roomWithCountsSelect }>;

@Injectable()
export class RoomsRepository extends BaseRepository<RoomWithHost> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(hostId: string, data: Prisma.RoomCreateInput): Promise<RoomWithHost> {
    return this.prisma.room.create({
      data: {
        ...data,
        host: { connect: { id: hostId } },
        status: 'DRAFT',
      },
      select: roomSelect,
    });
  }

  async findById(id: string): Promise<RoomWithCounts | null> {
    return this.prisma.room.findUnique({
      where: { id },
      select: {
        ...roomWithCountsSelect,
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            guest: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  async findMany(query: SearchRoomsDto): Promise<PaginatedResult<RoomWithCounts>> {
    const { keyword, type, minPrice, maxPrice, page = 1, limit = 20 } = query;

    const where: Prisma.RoomWhereInput = {
      status: 'ACTIVE',
      ...(keyword && {
        OR: [
          { title: { contains: keyword, mode: 'insensitive' } },
          { description: { contains: keyword, mode: 'insensitive' } },
          { address: { contains: keyword, mode: 'insensitive' } },
        ],
      }),
      ...(type && { type: type as Prisma.EnumRoomTypeFilter }),
      ...(minPrice !== undefined && { price: { gte: minPrice } }),
      ...(maxPrice !== undefined && { price: { lte: maxPrice } }),
    };

    const [data, total] = await Promise.all([
      this.prisma.room.findMany({
        where,
        select: roomWithCountsSelect,
        ...this.paginate(page, limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.room.count({ where }),
    ]);

    return this.createPaginatedResult(data, total, page, limit);
  }

  async findByHostId(hostId: string): Promise<RoomWithCounts[]> {
    return this.prisma.room.findMany({
      where: { hostId },
      select: {
        ...roomWithCountsSelect,
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: Prisma.RoomUpdateInput): Promise<RoomWithHost> {
    return this.prisma.room.update({
      where: { id },
      data,
      select: roomSelect,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.room.delete({ where: { id } });
  }

  async isOwnedBy(roomId: string, userId: string): Promise<boolean> {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      select: { hostId: true },
    });
    return room?.hostId === userId;
  }

  // Favorites
  async findFavorite(userId: string, roomId: string) {
    return this.prisma.favorite.findUnique({
      where: { userId_roomId: { userId, roomId } },
    });
  }

  async addFavorite(userId: string, roomId: string) {
    return this.prisma.favorite.create({
      data: { userId, roomId },
    });
  }

  async removeFavorite(id: string) {
    return this.prisma.favorite.delete({ where: { id } });
  }

  async findUserFavorites(userId: string): Promise<RoomWithHost[]> {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      select: {
        room: { select: roomSelect },
      },
      orderBy: { createdAt: 'desc' },
    });
    return favorites.map((f) => f.room);
  }
}
