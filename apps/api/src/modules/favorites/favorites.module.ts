import { Module } from '@nestjs/common';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';
import { FavoritesRepository } from './favorites.repository';
import { PrismaModule } from '../../prisma/prisma.module';

/**
 * Favorites Module
 *
 * 찜 목록 및 최근 본 숙소 관리 기능을 제공하는 모듈입니다.
 *
 * ## 제공 기능
 * - 찜 목록 CRUD
 * - 최근 본 숙소 CRUD
 *
 * ## 엔드포인트
 *
 * ### 찜 목록
 * - GET /favorites - 찜 목록 조회
 * - GET /favorites/check?ids=id1,id2 - 여러 숙소 찜 여부 확인
 * - GET /favorites/:accommodationId - 찜 여부 확인
 * - POST /favorites/:accommodationId - 찜 추가
 * - DELETE /favorites/:accommodationId - 찜 삭제
 * - POST /favorites/:accommodationId/toggle - 찜 토글
 *
 * ### 최근 본 숙소
 * - GET /recently-viewed - 최근 본 숙소 조회
 * - POST /recently-viewed/:accommodationId - 조회 기록
 * - DELETE /recently-viewed/:accommodationId - 특정 기록 삭제
 * - DELETE /recently-viewed - 전체 삭제
 */
@Module({
  imports: [PrismaModule],
  controllers: [FavoritesController],
  providers: [FavoritesRepository, FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
