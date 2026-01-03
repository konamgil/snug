import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsArray, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateAccommodationDto } from './create-accommodation.dto';

/**
 * 숙소 수정 DTO
 *
 * CreateAccommodationDto의 모든 필드를 optional로 만든 버전
 */
export class UpdateAccommodationDto extends PartialType(CreateAccommodationDto) {
  // PartialType이 webpack과 함께 제대로 동작하지 않는 경우를 위해 명시적 선언
  @ApiPropertyOptional({
    description: '시설 코드 목록',
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  facilities?: string[];

  @ApiPropertyOptional({
    description: '편의시설 코드 목록',
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];
}
