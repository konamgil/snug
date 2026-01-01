import { IsString, IsOptional } from 'class-validator';

export class RegisterTokenDto {
  @IsString()
  token!: string;

  @IsOptional()
  @IsString()
  deviceType?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;
}
