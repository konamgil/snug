import { IsString, IsOptional, IsUrl, IsIn, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 사용자 프로필 업데이트 DTO
 * User 테이블 + GuestProfile 테이블 필드 포함
 */
export class UpdateUserDto {
  // === User 테이블 필드 ===
  @ApiPropertyOptional({ description: '이름' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ description: '성' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ description: '전화번호' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: '국가 코드', example: '+82' })
  @IsString()
  @IsOptional()
  countryCode?: string;

  @ApiPropertyOptional({ description: '이메일 인증 여부' })
  @IsBoolean()
  @IsOptional()
  emailVerified?: boolean;

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

  // === GuestProfile 테이블 필드 ===
  @ApiPropertyOptional({ description: '자기소개' })
  @IsString()
  @IsOptional()
  aboutMe?: string;

  @ApiPropertyOptional({
    description: '체류 목적',
    enum: ['WORK', 'STUDY', 'BUSINESS', 'FAMILY', 'TOURISM', 'MEDICAL', 'OTHER'],
  })
  @IsString()
  @IsOptional()
  @IsIn(['WORK', 'STUDY', 'BUSINESS', 'FAMILY', 'TOURISM', 'MEDICAL', 'OTHER'])
  purposeOfStay?: string;

  @ApiPropertyOptional({ description: '여권 번호' })
  @IsString()
  @IsOptional()
  passportNumber?: string;

  @ApiPropertyOptional({ description: '국적' })
  @IsString()
  @IsOptional()
  nationality?: string;
}

/**
 * 사용자 프로필 응답 타입
 */
export interface ProfileResponse {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  countryCode: string | null;
  emailVerified: boolean;
  avatarUrl: string | null;
  preferredCurrency: string;
  preferredLanguage: string;
  // GuestProfile
  aboutMe: string | null;
  purposeOfStay: string | null;
  passportNumber: string | null;
  nationality: string | null;
}
