import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 숙소 그룹 생성 DTO
 */
export class CreateAccommodationGroupDto {
  @ApiProperty({ description: '그룹 이름', example: '강남 셰어하우스' })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ description: '공통 주소' })
  @IsOptional()
  @IsString()
  address?: string;
}

/**
 * 숙소 그룹 수정 DTO
 */
export class UpdateAccommodationGroupDto {
  @ApiPropertyOptional({ description: '그룹 이름' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: '공통 주소' })
  @IsOptional()
  @IsString()
  address?: string | null;
}
