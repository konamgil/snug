import { IsString, IsOptional, IsUrl, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: '이름' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ description: '성' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ description: '프로필 이미지 URL' })
  @IsUrl()
  @IsOptional()
  avatarUrl?: string;

  @ApiPropertyOptional({
    description: '선호 통화',
    enum: ['KRW', 'USD', 'JPY', 'CNY', 'EUR'],
  })
  @IsString()
  @IsOptional()
  @IsIn(['KRW', 'USD', 'JPY', 'CNY', 'EUR'])
  preferredCurrency?: string;

  @ApiPropertyOptional({
    description: '선호 언어',
    enum: ['ko', 'en', 'ja', 'zh', 'vi'],
  })
  @IsString()
  @IsOptional()
  @IsIn(['ko', 'en', 'ja', 'zh', 'vi'])
  preferredLanguage?: string;
}
