import {
  IsString,
  IsNumber,
  IsArray,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsObject,
  Min,
  MaxLength,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AddPhotoDto } from './add-photo.dto';

/**
 * 숙소 생성 DTO
 *
 * class-validator 데코레이터로 유효성 검사
 * packages/types의 CreateAccommodationInput과 동일한 구조
 */
export class CreateAccommodationDto {
  @ApiPropertyOptional({ description: '숙소 그룹 ID' })
  @IsOptional()
  @IsString()
  groupId?: string;

  @ApiProperty({ description: '방 이름', example: '101호' })
  @IsString()
  @MaxLength(100)
  roomName!: string;

  @ApiProperty({
    description: '숙소 유형',
    enum: ['HOUSE', 'SHARE_ROOM', 'SHARE_HOUSE', 'APARTMENT'],
  })
  @IsEnum(['HOUSE', 'SHARE_ROOM', 'SHARE_HOUSE', 'APARTMENT'])
  accommodationType!: 'HOUSE' | 'SHARE_ROOM' | 'SHARE_HOUSE' | 'APARTMENT';

  @ApiPropertyOptional({
    description: '건물 유형',
    enum: ['APARTMENT', 'VILLA', 'HOUSE', 'OFFICETEL'],
  })
  @IsOptional()
  @IsEnum(['APARTMENT', 'VILLA', 'HOUSE', 'OFFICETEL'])
  buildingType?: 'APARTMENT' | 'VILLA' | 'HOUSE' | 'OFFICETEL';

  @ApiProperty({
    description: '이용 유형',
    enum: ['STAY', 'SHORT_TERM'],
    isArray: true,
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(['STAY', 'SHORT_TERM'], { each: true })
  usageTypes!: ('STAY' | 'SHORT_TERM')[];

  @ApiPropertyOptional({ description: '최소 예약 일수', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  minReservationDays?: number;

  @ApiProperty({ description: '주소' })
  @IsString()
  address!: string;

  @ApiPropertyOptional({ description: '상세 주소' })
  @IsOptional()
  @IsString()
  addressDetail?: string;

  @ApiPropertyOptional({ description: '우편번호' })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiPropertyOptional({ description: '도로명 주소' })
  @IsOptional()
  @IsString()
  roadAddress?: string;

  @ApiPropertyOptional({ description: '시/도 (예: 서울특별시)' })
  @IsOptional()
  @IsString()
  sido?: string;

  @ApiPropertyOptional({ description: '시/군/구 (예: 강남구)' })
  @IsOptional()
  @IsString()
  sigungu?: string;

  @ApiPropertyOptional({ description: '법정동/리 (예: 역삼동)' })
  @IsOptional()
  @IsString()
  bname?: string;

  @ApiPropertyOptional({ description: '건물명' })
  @IsOptional()
  @IsString()
  buildingName?: string;

  @ApiPropertyOptional({ description: '위도' })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: '경도' })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ description: '가장 가까운 역' })
  @IsOptional()
  @IsString()
  nearestStation?: string;

  @ApiPropertyOptional({ description: '도보 시간 (분)' })
  @IsOptional()
  @IsNumber()
  walkingMinutes?: number;

  @ApiProperty({ description: '기본 가격 (원)', example: 50000 })
  @IsNumber()
  @Min(0)
  basePrice!: number;

  @ApiPropertyOptional({ description: '공과금 포함 여부', default: false })
  @IsOptional()
  @IsBoolean()
  includesUtilities?: boolean;

  @ApiPropertyOptional({ description: '주말 가격' })
  @IsOptional()
  @IsNumber()
  weekendPrice?: number;

  @ApiPropertyOptional({ description: '주말 요일', example: ['fri', 'sat'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  weekendDays?: string[];

  @ApiPropertyOptional({ description: '관리비' })
  @IsOptional()
  @IsNumber()
  managementFee?: number;

  @ApiPropertyOptional({ description: '청소비' })
  @IsOptional()
  @IsNumber()
  cleaningFee?: number;

  @ApiPropertyOptional({ description: '추가 인원 요금' })
  @IsOptional()
  @IsNumber()
  extraPersonFee?: number;

  @ApiPropertyOptional({ description: '반려동물 요금' })
  @IsOptional()
  @IsNumber()
  petFee?: number;

  @ApiPropertyOptional({ description: '최대 수용 인원', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  capacity?: number;

  @ApiPropertyOptional({
    description: '성별/반려동물 규칙',
    enum: ['MALE_ONLY', 'FEMALE_ONLY', 'PET_ALLOWED'],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(['MALE_ONLY', 'FEMALE_ONLY', 'PET_ALLOWED'], { each: true })
  genderRules?: ('MALE_ONLY' | 'FEMALE_ONLY' | 'PET_ALLOWED')[];

  @ApiPropertyOptional({ description: '면적 (m2)' })
  @IsOptional()
  @IsNumber()
  sizeM2?: number;

  @ApiPropertyOptional({ description: '면적 (평)' })
  @IsOptional()
  @IsNumber()
  sizePyeong?: number;

  @ApiPropertyOptional({ description: '방 개수', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  roomCount?: number;

  @ApiPropertyOptional({ description: '거실 개수', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  livingRoomCount?: number;

  @ApiPropertyOptional({ description: '주방 개수', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  kitchenCount?: number;

  @ApiPropertyOptional({ description: '화장실 개수', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  bathroomCount?: number;

  @ApiPropertyOptional({ description: '테라스 개수', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  terraceCount?: number;

  @ApiPropertyOptional({
    description: '침대 개수',
    example: { king: 1, single: 2 },
  })
  @IsOptional()
  @IsObject()
  bedCounts?: Record<string, number>;

  @ApiPropertyOptional({ description: '이용 규칙' })
  @IsOptional()
  @IsString()
  houseRules?: string;

  @ApiPropertyOptional({ description: '숙소 소개' })
  @IsOptional()
  @IsString()
  introduction?: string;

  @ApiPropertyOptional({
    description: '상태',
    enum: ['DRAFT', 'ACTIVE', 'INACTIVE'],
    default: 'DRAFT',
  })
  @IsOptional()
  @IsEnum(['DRAFT', 'ACTIVE', 'INACTIVE'])
  status?: 'DRAFT' | 'ACTIVE' | 'INACTIVE';

  @ApiPropertyOptional({ description: '운영 중 여부', default: false })
  @IsOptional()
  @IsBoolean()
  isOperating?: boolean;

  @ApiPropertyOptional({
    description: '숙소 사진 목록',
    type: [AddPhotoDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddPhotoDto)
  photos?: AddPhotoDto[];
}
