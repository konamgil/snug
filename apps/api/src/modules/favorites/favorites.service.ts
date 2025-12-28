import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { FavoritesRepository } from './favorites.repository';

@Injectable()
export class FavoritesService {
  constructor(private readonly favoritesRepository: FavoritesRepository) {}

  /**
   * 찜 목록 조회
   */
  async getFavorites(userId: string) {
    const favorites = await this.favoritesRepository.findByUserId(userId);
    return favorites.map((f) => this.mapAccommodationToResponse(f.accommodation, f.createdAt));
  }

  /**
   * 찜 여부 확인
   */
  async isFavorite(userId: string, accommodationId: string) {
    const favorite = await this.favoritesRepository.findOne(userId, accommodationId);
    return { isFavorite: !!favorite };
  }

  /**
   * 여러 숙소의 찜 여부 확인
   */
  async checkFavorites(userId: string, accommodationIds: string[]) {
    const favorites = await this.favoritesRepository.findByAccommodationIds(
      userId,
      accommodationIds,
    );
    const favoriteSet = new Set(favorites.map((f) => f.accommodationId));
    return accommodationIds.reduce(
      (acc, id) => {
        acc[id] = favoriteSet.has(id);
        return acc;
      },
      {} as Record<string, boolean>,
    );
  }

  /**
   * 찜 추가
   */
  async addFavorite(userId: string, accommodationId: string) {
    const existing = await this.favoritesRepository.findOne(userId, accommodationId);
    if (existing) {
      throw new ConflictException('Already in favorites');
    }

    await this.favoritesRepository.create(userId, accommodationId);
    return { success: true, message: 'Added to favorites' };
  }

  /**
   * 찜 삭제
   */
  async removeFavorite(userId: string, accommodationId: string) {
    const result = await this.favoritesRepository.delete(userId, accommodationId);
    if (result.count === 0) {
      throw new NotFoundException('Not in favorites');
    }
    return { success: true, message: 'Removed from favorites' };
  }

  /**
   * 찜 토글
   */
  async toggleFavorite(userId: string, accommodationId: string) {
    const existing = await this.favoritesRepository.findOne(userId, accommodationId);
    if (existing) {
      await this.favoritesRepository.delete(userId, accommodationId);
      return { isFavorite: false, message: 'Removed from favorites' };
    } else {
      await this.favoritesRepository.create(userId, accommodationId);
      return { isFavorite: true, message: 'Added to favorites' };
    }
  }

  /**
   * 최근 본 숙소 조회
   */
  async getRecentlyViewed(userId: string, limit = 20) {
    const recentlyViewed = await this.favoritesRepository.findRecentlyViewed(userId, limit);
    return recentlyViewed.map((r) => this.mapAccommodationToResponse(r.accommodation, r.viewedAt));
  }

  /**
   * 최근 본 숙소 기록
   */
  async recordView(userId: string, accommodationId: string) {
    await this.favoritesRepository.upsertRecentlyViewed(userId, accommodationId);
    return { success: true };
  }

  /**
   * 최근 본 숙소 삭제
   */
  async removeFromRecentlyViewed(userId: string, accommodationId: string) {
    await this.favoritesRepository.deleteRecentlyViewed(userId, accommodationId);
    return { success: true };
  }

  /**
   * 최근 본 숙소 전체 삭제
   */
  async clearRecentlyViewed(userId: string) {
    await this.favoritesRepository.clearRecentlyViewed(userId);
    return { success: true };
  }

  /**
   * 숙소 응답 형식 매핑
   */
  private mapAccommodationToResponse(accommodation: any, timestamp: Date) {
    return {
      id: accommodation.id,
      roomName: accommodation.roomName,
      address: accommodation.address,
      sido: accommodation.sido,
      sigungu: accommodation.sigungu,
      bname: accommodation.bname,
      basePrice: accommodation.basePrice,
      accommodationType: accommodation.accommodationType,
      capacity: accommodation.capacity,
      nearestStation: accommodation.nearestStation,
      walkingMinutes: accommodation.walkingMinutes,
      thumbnailUrl: accommodation.photos?.[0]?.url || null,
      timestamp,
    };
  }
}
