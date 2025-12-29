import { IsEmail, IsString, MinLength, IsOptional, IsEnum, Length, Matches } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  countryCode?: string;

  @IsEnum(['GUEST', 'HOST'])
  @IsOptional()
  role?: 'GUEST' | 'HOST';
}

// ============================================
// OTP DTOs
// ============================================

export class SendOtpDto {
  @IsEmail()
  email!: string;

  @IsEnum(['SIGNUP', 'RESET_PASSWORD', 'FIND_ID'])
  type!: 'SIGNUP' | 'RESET_PASSWORD' | 'FIND_ID';
}

export class VerifyOtpDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: '인증번호는 6자리 숫자입니다.' })
  code!: string;

  @IsEnum(['SIGNUP', 'RESET_PASSWORD', 'FIND_ID'])
  type!: 'SIGNUP' | 'RESET_PASSWORD' | 'FIND_ID';
}

export class ResetPasswordDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  newPassword!: string;
}

export class FindIdDto {
  @IsString()
  phone!: string;

  @IsString()
  @IsOptional()
  countryCode?: string;
}
