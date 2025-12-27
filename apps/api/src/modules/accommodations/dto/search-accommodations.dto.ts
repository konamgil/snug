import { IsString, IsNumber, IsArray, IsEnum, IsOptional, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 숙소 검색 DTO
 *
 * 공개 숙소 목록 조회 시 사용하는 검색 파라미터
 * Query Parameter로 전달됨
 */
export class SearchAccommodationsDto {
  // ============================================
  // 페이지네이션
  // ============================================

  @ApiPropertyOptional({ description: '페이지 번호', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '페이지당 개수', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  // ============================================
  // 위치 검색
  // ============================================

  @ApiPropertyOptional({ description: '지역명 (예: 강남구, 서울시)' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: '지도 중심 위도' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: '지도 중심 경도' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ description: '검색 반경 (km)', default: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  @Max(50)
  radius?: number;

  // ============================================
  // 날짜/인원
  // ============================================

  @ApiPropertyOptional({ description: '체크인 날짜 (ISO date)' })
  @IsOptional()
  @IsString()
  checkIn?: string;

  @ApiPropertyOptional({ description: '체크아웃 날짜 (ISO date)' })
  @IsOptional()
  @IsString()
  checkOut?: string;

  @ApiPropertyOptional({ description: '인원 수' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  guests?: number;

  // ============================================
  // 필터
  // ============================================

  @ApiPropertyOptional({
    description: '숙소 유형',
    enum: ['HOUSE', 'SHARE_ROOM', 'SHARE_HOUSE', 'APARTMENT'],
    isArray: true,
  })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @IsEnum(['HOUSE', 'SHARE_ROOM', 'SHARE_HOUSE', 'APARTMENT'], { each: true })
  accommodationType?: ('HOUSE' | 'SHARE_ROOM' | 'SHARE_HOUSE' | 'APARTMENT')[];

  @ApiPropertyOptional({
    description: '건물 유형',
    enum: ['APARTMENT', 'VILLA', 'HOUSE', 'OFFICETEL'],
    isArray: true,
  })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @IsEnum(['APARTMENT', 'VILLA', 'HOUSE', 'OFFICETEL'], { each: true })
  buildingType?: ('APARTMENT' | 'VILLA' | 'HOUSE' | 'OFFICETEL')[];

  @ApiPropertyOptional({ description: '최소 가격' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: '최대 가격' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    description: '성별/반려동물 규칙',
    enum: ['MALE_ONLY', 'FEMALE_ONLY', 'PET_ALLOWED'],
    isArray: true,
  })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @IsEnum(['MALE_ONLY', 'FEMALE_ONLY', 'PET_ALLOWED'], { each: true })
  genderRules?: ('MALE_ONLY' | 'FEMALE_ONLY' | 'PET_ALLOWED')[];

  // ============================================
  // 정렬
  // ============================================

  @ApiPropertyOptional({
    description: '정렬 기준',
    enum: ['price_asc', 'price_desc', 'newest', 'recommended'],
    default: 'recommended',
  })
  @IsOptional()
  @IsEnum(['price_asc', 'price_desc', 'newest', 'recommended'])
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'recommended' = 'recommended';
}
