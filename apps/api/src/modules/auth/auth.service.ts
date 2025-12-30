import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OtpType } from '@snug/database';
import { UsersService } from '../users/users.service';
import { OtpService } from './otp.service';
import { LoginDto, RegisterDto } from './dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly otpService: OtpService,
  ) {}

  async register(registerDto: RegisterDto) {
    // 이메일 인증 확인
    const isVerified = await this.otpService.isEmailVerified(registerDto.email, OtpType.SIGNUP);
    if (!isVerified) {
      throw new BadRequestException('이메일 인증이 필요합니다.');
    }

    const user = await this.usersService.create({
      ...registerDto,
      emailVerified: true,
    });

    // 인증 완료된 OTP 삭제
    await this.otpService.clearVerifiedOtp(registerDto.email, OtpType.SIGNUP);

    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
      },
      tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // TODO: Implement proper password verification with Supabase Auth
    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      tokens,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const tokens = await this.generateTokens(payload.sub, payload.email);
      return { tokens };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        expiresIn: '30d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
    };
  }

  /**
   * 비밀번호 재설정 (OTP 인증 후)
   */
  async resetPassword(email: string, newPassword: string) {
    // OTP 인증 확인
    const isVerified = await this.otpService.isEmailVerified(email, OtpType.RESET_PASSWORD);
    if (!isVerified) {
      throw new BadRequestException('이메일 인증이 필요합니다.');
    }

    // 사용자 존재 확인
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('등록되지 않은 이메일입니다.');
    }

    // Supabase Admin API를 통한 비밀번호 업데이트
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseServiceKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new BadRequestException('서버 설정 오류입니다. 관리자에게 문의하세요.');
    }

    // Supabase Auth Admin API 호출
    const response = await fetch(`${supabaseUrl}/auth/v1/admin/users/${user.supabaseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supabaseServiceKey}`,
        apikey: supabaseServiceKey,
      },
      body: JSON.stringify({ password: newPassword }),
    });

    if (!response.ok) {
      throw new BadRequestException('비밀번호 변경에 실패했습니다. 다시 시도해주세요.');
    }

    // 인증 완료된 OTP 삭제
    await this.otpService.clearVerifiedOtp(email, OtpType.RESET_PASSWORD);

    return {
      success: true,
      message: '비밀번호가 변경되었습니다. 새 비밀번호로 로그인해주세요.',
    };
  }

  /**
   * 아이디 찾기 (전화번호로)
   */
  async findIdByPhone(phone: string, countryCode?: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        phone,
        ...(countryCode && { countryCode }),
      },
      select: {
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new BadRequestException('해당 전화번호로 가입된 계정이 없습니다.');
    }

    // 이메일 일부 마스킹 (abc@example.com -> a**@example.com)
    const [localPart, domain] = user.email.split('@');
    const maskedLocal = localPart.charAt(0) + '*'.repeat(Math.max(localPart.length - 1, 2));
    const maskedEmail = `${maskedLocal}@${domain}`;

    return {
      success: true,
      email: maskedEmail,
      createdAt: user.createdAt,
    };
  }
}
