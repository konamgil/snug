import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsEnum,
  Min,
  IsLatitude,
  IsLongitude,
} from 'class-validator';

export class CreateRoomDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(['STUDIO', 'ONE_ROOM', 'TWO_ROOM', 'OFFICETEL', 'APARTMENT', 'HOUSE'])
  type: 'STUDIO' | 'ONE_ROOM' | 'TWO_ROOM' | 'OFFICETEL' | 'APARTMENT' | 'HOUSE';

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  deposit: number;

  @IsString()
  address: string;

  @IsLatitude()
  @IsOptional()
  latitude?: number;

  @IsLongitude()
  @IsOptional()
  longitude?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  amenities?: string[];

  @IsNumber()
  @Min(1)
  @IsOptional()
  minStay?: number;

  @IsNumber()
  @IsOptional()
  maxStay?: number;
}

export class UpdateRoomDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['STUDIO', 'ONE_ROOM', 'TWO_ROOM', 'OFFICETEL', 'APARTMENT', 'HOUSE'])
  @IsOptional()
  type?: 'STUDIO' | 'ONE_ROOM' | 'TWO_ROOM' | 'OFFICETEL' | 'APARTMENT' | 'HOUSE';

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  deposit?: number;

  @IsString()
  @IsOptional()
  address?: string;

  @IsLatitude()
  @IsOptional()
  latitude?: number;

  @IsLongitude()
  @IsOptional()
  longitude?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  amenities?: string[];

  @IsEnum(['DRAFT', 'ACTIVE', 'INACTIVE'])
  @IsOptional()
  status?: 'DRAFT' | 'ACTIVE' | 'INACTIVE';

  @IsNumber()
  @Min(1)
  @IsOptional()
  minStay?: number;

  @IsNumber()
  @IsOptional()
  maxStay?: number;
}

export class SearchRoomsDto {
  @IsString()
  @IsOptional()
  keyword?: string;

  @IsEnum(['STUDIO', 'ONE_ROOM', 'TWO_ROOM', 'OFFICETEL', 'APARTMENT', 'HOUSE'])
  @IsOptional()
  type?: string;

  @IsNumber()
  @IsOptional()
  minPrice?: number;

  @IsNumber()
  @IsOptional()
  maxPrice?: number;

  @IsLatitude()
  @IsOptional()
  latitude?: number;

  @IsLongitude()
  @IsOptional()
  longitude?: number;

  @IsNumber()
  @IsOptional()
  radius?: number;

  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  limit?: number;
}
