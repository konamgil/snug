import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import type { User } from '@snug/database';
import { AccommodationsService } from './accommodations.service';
import {
  CreateAccommodationDto,
  UpdateAccommodationDto,
  CreateAccommodationGroupDto,
  UpdateAccommodationGroupDto,
  SearchAccommodationsDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, Public } from '../../common/decorators';

/**
 * Accommodations Controller
 *
 * 숙소 관리 API 엔드포인트
 * - 숙소 CRUD
 * - 숙소 그룹 CRUD
 * - 공개 API (SEO용)
 */
@ApiTags('accommodations')
@Controller('accommodations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AccommodationsController {
  constructor(private readonly accommodationsService: AccommodationsService) {}

  // ============================================
  // ACCOMMODATION ENDPOINTS
  // ============================================

  /**
   * 내 숙소 목록 조회
   */
  @Get()
  @ApiOperation({ summary: 'Get my accommodations list' })
  @ApiResponse({ status: 200, description: 'Returns list of accommodations' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@CurrentUser() user: User) {
    return this.accommodationsService.findAllByHost(user.id);
  }

  /**
   * 주소 자동완성 (한글/영문 지원)
   * 인증 불필요
   */
  @Get('address/autocomplete')
  @Public()
  @ApiOperation({ summary: 'Address autocomplete for search' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query (Korean or English)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Max results (default: 10)' })
  @ApiResponse({ status: 200, description: 'Returns matching addresses' })
  async addressAutocomplete(@Query('q') query: string, @Query('limit') limit?: string) {
    return this.accommodationsService.searchAddresses(query, limit ? parseInt(limit, 10) : 10);
  }

  /**
   * 공개 숙소 목록 조회 (검색 페이지용)
   * 인증 불필요
   * NOTE: 이 라우트는 반드시 :id 라우트보다 먼저 정의되어야 함
   */
  @Get('public')
  @Public()
  @ApiOperation({ summary: 'Get public accommodations list with search/filter' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'location', required: false, description: 'Location search' })
  @ApiQuery({ name: 'guests', required: false, description: 'Number of guests' })
  @ApiQuery({ name: 'accommodationType', required: false, isArray: true })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['price_asc', 'price_desc', 'newest', 'recommended'],
  })
  @ApiResponse({ status: 200, description: 'Returns paginated public accommodations list' })
  async findPublicList(@Query() dto: SearchAccommodationsDto) {
    return this.accommodationsService.findPublicList(dto);
  }

  /**
   * 유사 숙소 조회 (같은 지역 + 같은 타입)
   * 인증 불필요
   */
  @Get('public/similar/:id')
  @Public()
  @ApiOperation({ summary: 'Get similar accommodations (same region + type)' })
  @ApiParam({ name: 'id', description: 'Accommodation ID to find similar ones' })
  @ApiQuery({ name: 'limit', required: false, description: 'Max results (default: 6)' })
  @ApiResponse({ status: 200, description: 'Returns similar accommodations' })
  @ApiResponse({ status: 404, description: 'Accommodation not found' })
  async findSimilar(@Param('id') id: string, @Query('limit') limit?: string) {
    return this.accommodationsService.findSimilar(id, limit ? parseInt(limit, 10) : 6);
  }

  /**
   * 숙소 가격 정보 조회 (실시간 가격 확인용)
   * 인증 불필요
   * NOTE: 별도 API로 분리하여 가격 정보만 짧은 캐시로 관리
   */
  @Get('public/:id/price')
  @Public()
  @ApiOperation({ summary: 'Get accommodation price info (for real-time price check)' })
  @ApiParam({ name: 'id', description: 'Accommodation ID' })
  @ApiResponse({ status: 200, description: 'Returns accommodation price info' })
  @ApiResponse({ status: 404, description: 'Accommodation not found or not active' })
  async findPublicPrice(@Param('id') id: string) {
    return this.accommodationsService.findPublicPrice(id);
  }

  /**
   * 숙소 공개 정보 조회 (SEO용)
   * 인증 불필요
   */
  @Get('public/:id')
  @Public()
  @ApiOperation({ summary: 'Get public accommodation info (for SEO)' })
  @ApiParam({ name: 'id', description: 'Accommodation ID' })
  @ApiResponse({ status: 200, description: 'Returns public accommodation info' })
  @ApiResponse({ status: 404, description: 'Accommodation not found or not active' })
  async findPublic(@Param('id') id: string) {
    return this.accommodationsService.findPublic(id);
  }

  /**
   * 숙소 상세 조회
   * NOTE: 이 라우트는 public 라우트들보다 뒤에 정의되어야 함
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get accommodation details' })
  @ApiParam({ name: 'id', description: 'Accommodation ID' })
  @ApiResponse({ status: 200, description: 'Returns accommodation details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not the owner' })
  @ApiResponse({ status: 404, description: 'Accommodation not found' })
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.accommodationsService.findOne(id, user);
  }

  /**
   * 숙소 생성
   * GUEST → HOST 역할 자동 업그레이드
   */
  @Post()
  @ApiOperation({ summary: 'Create a new accommodation' })
  @ApiResponse({
    status: 201,
    description: 'Accommodation created successfully',
    schema: {
      type: 'object',
      properties: {
        accommodation: { type: 'object' },
        roleUpgraded: {
          type: 'boolean',
          description: 'True if user role was upgraded from GUEST to HOST',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@CurrentUser() user: User, @Body() dto: CreateAccommodationDto) {
    return this.accommodationsService.create(user, dto);
  }

  /**
   * 숙소 수정
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update accommodation' })
  @ApiParam({ name: 'id', description: 'Accommodation ID' })
  @ApiResponse({ status: 200, description: 'Accommodation updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not the owner' })
  @ApiResponse({ status: 404, description: 'Accommodation not found' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateAccommodationDto,
  ) {
    return this.accommodationsService.update(id, user, dto);
  }

  /**
   * 숙소 삭제
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete accommodation' })
  @ApiParam({ name: 'id', description: 'Accommodation ID' })
  @ApiResponse({ status: 204, description: 'Accommodation deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not the owner' })
  @ApiResponse({ status: 404, description: 'Accommodation not found' })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.accommodationsService.remove(id, user);
  }

  // ============================================
  // ACCOMMODATION GROUP ENDPOINTS
  // ============================================

  /**
   * 숙소 그룹 목록 조회
   */
  @Get('groups/list')
  @ApiOperation({ summary: 'Get my accommodation groups list' })
  @ApiResponse({ status: 200, description: 'Returns list of accommodation groups' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAllGroups(@CurrentUser() user: User) {
    return this.accommodationsService.findAllGroups(user.id);
  }

  /**
   * 숙소 그룹 생성
   */
  @Post('groups')
  @ApiOperation({ summary: 'Create a new accommodation group' })
  @ApiResponse({ status: 201, description: 'Accommodation group created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createGroup(@CurrentUser() user: User, @Body() dto: CreateAccommodationGroupDto) {
    return this.accommodationsService.createGroup(user, dto);
  }

  /**
   * 숙소 그룹 수정
   */
  @Patch('groups/:id')
  @ApiOperation({ summary: 'Update accommodation group' })
  @ApiParam({ name: 'id', description: 'Accommodation Group ID' })
  @ApiResponse({ status: 200, description: 'Accommodation group updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not the owner' })
  @ApiResponse({ status: 404, description: 'Accommodation group not found' })
  async updateGroup(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateAccommodationGroupDto,
  ) {
    return this.accommodationsService.updateGroup(id, user, dto);
  }

  /**
   * 숙소 그룹 삭제
   */
  @Delete('groups/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete accommodation group' })
  @ApiParam({ name: 'id', description: 'Accommodation Group ID' })
  @ApiResponse({ status: 204, description: 'Accommodation group deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not the owner' })
  @ApiResponse({ status: 404, description: 'Accommodation group not found' })
  async removeGroup(@Param('id') id: string, @CurrentUser() user: User) {
    await this.accommodationsService.removeGroup(id, user);
  }
}
