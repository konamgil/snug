import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FavoritesRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 찜 목록 조회
   */
  async findByUserId(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: {
        accommodation: {
          include: {
            photos: {
              orderBy: { order: 'asc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 찜 여부 확인
   */
  async findOne(userId: string, accommodationId: string) {
    return this.prisma.favorite.findFirst({
      where: { userId, accommodationId },
    });
  }

  /**
   * 여러 숙소의 찜 여부 확인
   */
  async findByAccommodationIds(userId: string, accommodationIds: string[]) {
    return this.prisma.favorite.findMany({
      where: {
        userId,
        accommodationId: { in: accommodationIds },
      },
      select: { accommodationId: true },
    });
  }

  /**
   * 찜 추가
   */
  async create(userId: string, accommodationId: string) {
    return this.prisma.favorite.create({
      data: {
        userId,
        accommodationId,
      },
    });
  }

  /**
   * 찜 삭제
   */
  async delete(userId: string, accommodationId: string) {
    return this.prisma.favorite.deleteMany({
      where: { userId, accommodationId },
    });
  }

  /**
   * 최근 본 숙소 조회
   */
  async findRecentlyViewed(userId: string, limit = 20) {
    return this.prisma.recentlyViewed.findMany({
      where: { userId },
      include: {
        accommodation: {
          include: {
            photos: {
              orderBy: { order: 'asc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { viewedAt: 'desc' },
      take: limit,
    });
  }

  /**
   * 최근 본 숙소 추가/업데이트
   */
  async upsertRecentlyViewed(userId: string, accommodationId: string) {
    return this.prisma.recentlyViewed.upsert({
      where: {
        userId_accommodationId: { userId, accommodationId },
      },
      create: {
        userId,
        accommodationId,
      },
      update: {
        viewedAt: new Date(),
      },
    });
  }

  /**
   * 최근 본 숙소 삭제
   */
  async deleteRecentlyViewed(userId: string, accommodationId: string) {
    return this.prisma.recentlyViewed.deleteMany({
      where: { userId, accommodationId },
    });
  }

  /**
   * 최근 본 숙소 전체 삭제
   */
  async clearRecentlyViewed(userId: string) {
    return this.prisma.recentlyViewed.deleteMany({
      where: { userId },
    });
  }
}
