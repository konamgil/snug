import { IsString, IsDateString, IsOptional, IsEnum } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  roomId!: string;

  @IsDateString()
  checkIn!: string;

  @IsDateString()
  checkOut!: string;

  @IsString()
  @IsOptional()
  message?: string;
}

export class UpdateBookingStatusDto {
  @IsEnum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'REFUNDED'])
  status!: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'REFUNDED';
}
