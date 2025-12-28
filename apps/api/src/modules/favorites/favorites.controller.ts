import { Controller, Get, Post, Delete, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators';

@ApiTags('favorites')
@ApiBearerAuth('JWT-auth')
@Controller()
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  // ========== 찜 목록 (Favorites) ==========

  @Get('favorites')
  @ApiOperation({ summary: '찜 목록 조회', description: '사용자의 찜 목록을 조회합니다.' })
  @ApiResponse({ status: 200, description: '찜 목록 조회 성공' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getFavorites(@CurrentUser('id') userId: string) {
    return this.favoritesService.getFavorites(userId);
  }

  @Get('favorites/check')
  @ApiOperation({
    summary: '여러 숙소 찜 여부 확인',
    description: '여러 숙소의 찜 여부를 한번에 확인합니다.',
  })
  @ApiQuery({
    name: 'ids',
    description: '숙소 ID 목록 (쉼표로 구분)',
    type: String,
    example: 'id1,id2,id3',
  })
  @ApiResponse({ status: 200, description: '찜 여부 확인 성공' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  checkFavorites(@CurrentUser('id') userId: string, @Query('ids') ids: string) {
    const accommodationIds = ids.split(',').filter(Boolean);
    return this.favoritesService.checkFavorites(userId, accommodationIds);
  }

  @Get('favorites/:accommodationId')
  @ApiOperation({ summary: '찜 여부 확인', description: '특정 숙소의 찜 여부를 확인합니다.' })
  @ApiParam({ name: 'accommodationId', description: '숙소 ID', type: String })
  @ApiResponse({ status: 200, description: '찜 여부 확인 성공' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  isFavorite(@CurrentUser('id') userId: string, @Param('accommodationId') accommodationId: string) {
    return this.favoritesService.isFavorite(userId, accommodationId);
  }

  @Post('favorites/:accommodationId')
  @ApiOperation({ summary: '찜 추가', description: '숙소를 찜 목록에 추가합니다.' })
  @ApiParam({ name: 'accommodationId', description: '숙소 ID', type: String })
  @ApiResponse({ status: 201, description: '찜 추가 성공' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: '이미 찜한 숙소' })
  addFavorite(
    @CurrentUser('id') userId: string,
    @Param('accommodationId') accommodationId: string,
  ) {
    return this.favoritesService.addFavorite(userId, accommodationId);
  }

  @Delete('favorites/:accommodationId')
  @ApiOperation({ summary: '찜 삭제', description: '숙소를 찜 목록에서 삭제합니다.' })
  @ApiParam({ name: 'accommodationId', description: '숙소 ID', type: String })
  @ApiResponse({ status: 200, description: '찜 삭제 성공' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: '찜 목록에 없는 숙소' })
  removeFavorite(
    @CurrentUser('id') userId: string,
    @Param('accommodationId') accommodationId: string,
  ) {
    return this.favoritesService.removeFavorite(userId, accommodationId);
  }

  @Post('favorites/:accommodationId/toggle')
  @ApiOperation({
    summary: '찜 토글',
    description: '숙소 찜 상태를 토글합니다 (추가/삭제).',
  })
  @ApiParam({ name: 'accommodationId', description: '숙소 ID', type: String })
  @ApiResponse({ status: 200, description: '찜 토글 성공' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  toggleFavorite(
    @CurrentUser('id') userId: string,
    @Param('accommodationId') accommodationId: string,
  ) {
    return this.favoritesService.toggleFavorite(userId, accommodationId);
  }

  // ========== 최근 본 숙소 (Recently Viewed) ==========

  @Get('recently-viewed')
  @ApiOperation({
    summary: '최근 본 숙소 조회',
    description: '사용자가 최근 조회한 숙소 목록을 조회합니다.',
  })
  @ApiQuery({
    name: 'limit',
    description: '조회할 개수 (기본값: 20)',
    type: Number,
    required: false,
  })
  @ApiResponse({ status: 200, description: '최근 본 숙소 조회 성공' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getRecentlyViewed(@CurrentUser('id') userId: string, @Query('limit') limit?: string) {
    return this.favoritesService.getRecentlyViewed(userId, limit ? parseInt(limit, 10) : 20);
  }

  @Post('recently-viewed/:accommodationId')
  @ApiOperation({
    summary: '최근 본 숙소 기록',
    description: '숙소 조회 기록을 저장합니다.',
  })
  @ApiParam({ name: 'accommodationId', description: '숙소 ID', type: String })
  @ApiResponse({ status: 201, description: '조회 기록 저장 성공' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  recordView(@CurrentUser('id') userId: string, @Param('accommodationId') accommodationId: string) {
    return this.favoritesService.recordView(userId, accommodationId);
  }

  @Delete('recently-viewed/:accommodationId')
  @ApiOperation({
    summary: '최근 본 숙소 삭제',
    description: '특정 숙소를 최근 본 목록에서 삭제합니다.',
  })
  @ApiParam({ name: 'accommodationId', description: '숙소 ID', type: String })
  @ApiResponse({ status: 200, description: '삭제 성공' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  removeFromRecentlyViewed(
    @CurrentUser('id') userId: string,
    @Param('accommodationId') accommodationId: string,
  ) {
    return this.favoritesService.removeFromRecentlyViewed(userId, accommodationId);
  }

  @Delete('recently-viewed')
  @ApiOperation({
    summary: '최근 본 숙소 전체 삭제',
    description: '모든 최근 본 숙소 기록을 삭제합니다.',
  })
  @ApiResponse({ status: 200, description: '전체 삭제 성공' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  clearRecentlyViewed(@CurrentUser('id') userId: string) {
    return this.favoritesService.clearRecentlyViewed(userId);
  }
}
