import { IsString, IsNumber, IsOptional, Min, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 숙소 사진 추가 DTO
 */
export class AddPhotoDto {
  @ApiProperty({
    description: '사진 카테고리',
    example: 'main',
    enum: ['main', 'room', 'living_room', 'kitchen', 'bathroom', 'other'],
  })
  @IsString()
  category!: string;

  @ApiProperty({
    description: '사진 URL (Supabase Storage)',
    example: 'https://xxx.supabase.co/storage/v1/object/public/snug-uploads/...',
  })
  @IsUrl()
  url!: string;

  @ApiPropertyOptional({
    description: '사진 순서',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;
}
