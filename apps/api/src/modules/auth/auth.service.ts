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

    // Supabase Admin API로 사용자 생성 (이메일 인증 완료 상태로)
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseServiceKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new BadRequestException('서버 설정 오류입니다. 관리자에게 문의하세요.');
    }

    // Supabase Auth에 사용자 생성
    const supabaseResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supabaseServiceKey}`,
        apikey: supabaseServiceKey,
      },
      body: JSON.stringify({
        email: registerDto.email,
        password: registerDto.password,
        email_confirm: true, // 이메일 인증 완료 상태로 생성
        user_metadata: {
          first_name: registerDto.firstName,
          last_name: registerDto.lastName,
        },
      }),
    });

    if (!supabaseResponse.ok) {
      const errorData = (await supabaseResponse.json()) as {
        message?: string;
        msg?: string;
        code?: string;
      };
      const errorMessage = (errorData.message || errorData.msg || '').toLowerCase();

      // 이미 등록된 이메일인 경우 (Supabase auth.users에 있음)
      if (
        errorMessage.includes('already registered') ||
        errorMessage.includes('email already') ||
        errorMessage.includes('user already') ||
        errorData.code === 'email_exists'
      ) {
        // Supabase에서 해당 사용자의 provider 확인
        const userResponse = await fetch(
          `${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(registerDto.email)}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${supabaseServiceKey}`,
              apikey: supabaseServiceKey,
            },
          },
        );

        if (userResponse.ok) {
          const userData = (await userResponse.json()) as {
            users?: Array<{ app_metadata?: { provider?: string } }>;
          };
          const existingUser = userData.users?.[0];
          const provider = existingUser?.app_metadata?.provider || 'email';

          if (provider !== 'email') {
            // 소셜 로그인으로 가입된 계정
            throw new BadRequestException(
              JSON.stringify({
                code: 'SOCIAL_LOGIN_EXISTS',
                provider: provider,
                message: `이 이메일은 ${provider}로 가입되어 있습니다. ${provider} 로그인을 이용해주세요.`,
              }),
            );
          } else {
            // 이메일로 이미 가입된 계정
            throw new BadRequestException(
              JSON.stringify({
                code: 'EMAIL_EXISTS',
                message: '이미 가입된 이메일입니다. 로그인해주세요.',
              }),
            );
          }
        }

        throw new BadRequestException('이미 가입된 이메일입니다.');
      }

      throw new BadRequestException(
        errorData.message || errorData.msg || '회원가입에 실패했습니다.',
      );
    }

    const supabaseUser = (await supabaseResponse.json()) as { id: string };

    // Prisma DB에 사용자 생성
    const user = await this.usersService.create({
      ...registerDto,
      emailVerified: true,
      supabaseId: supabaseUser.id,
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

  /**
   * 이메일로 가입 방식(provider) 확인
   * User 테이블과 Supabase auth.users 모두 확인
   */
  async checkProvider(email: string) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseServiceKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    // 먼저 User 테이블에서 사용자 존재 확인
    const user = await this.usersService.findByEmail(email);

    // User 테이블에 없는 경우, Supabase auth.users 직접 확인
    // (소셜 로그인으로 Supabase에만 있고 User 테이블에 동기화 안 된 경우)
    if (!user || !user.supabaseId) {
      if (supabaseUrl && supabaseServiceKey) {
        // Supabase Admin API로 이메일로 사용자 검색
        const searchResponse = await fetch(
          `${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(email)}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${supabaseServiceKey}`,
              apikey: supabaseServiceKey,
            },
          },
        );

        if (searchResponse.ok) {
          const searchData = (await searchResponse.json()) as {
            users?: Array<{ app_metadata?: { provider?: string } }>;
          };

          if (searchData.users && searchData.users.length > 0) {
            const existingUser = searchData.users[0];
            const provider = existingUser?.app_metadata?.provider || 'email';
            const isSocialLogin = provider !== 'email';

            return {
              exists: true,
              provider,
              isSocialLogin,
            };
          }
        }
      } else {
        // 환경변수 없으면 DB 직접 조회
        const result = await this.prisma.$queryRaw<{ provider: string }[]>`
          SELECT raw_app_meta_data->>'provider' as provider
          FROM auth.users
          WHERE email = ${email}
        `;

        if (result.length > 0) {
          const provider = result[0]?.provider || 'email';
          const isSocialLogin = provider !== 'email';

          return {
            exists: true,
            provider,
            isSocialLogin,
          };
        }
      }

      // Supabase에도 없으면 존재하지 않음
      return {
        exists: false,
        provider: null,
        isSocialLogin: false,
      };
    }

    // User 테이블에 있는 경우, Supabase에서 provider 조회

    if (!supabaseUrl || !supabaseServiceKey) {
      // 환경변수 없으면 DB 직접 조회
      const result = await this.prisma.$queryRaw<{ provider: string }[]>`
        SELECT raw_app_meta_data->>'provider' as provider
        FROM auth.users
        WHERE id = ${user.supabaseId}::uuid
      `;

      const provider = result[0]?.provider || 'email';
      const isSocialLogin = provider !== 'email';

      return {
        exists: true,
        provider,
        isSocialLogin,
      };
    }

    // Supabase Admin API로 조회
    const response = await fetch(`${supabaseUrl}/auth/v1/admin/users/${user.supabaseId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${supabaseServiceKey}`,
        apikey: supabaseServiceKey,
      },
    });

    if (!response.ok) {
      // API 실패 시 DB 직접 조회
      const result = await this.prisma.$queryRaw<{ provider: string }[]>`
        SELECT raw_app_meta_data->>'provider' as provider
        FROM auth.users
        WHERE id = ${user.supabaseId}::uuid
      `;

      const provider = result[0]?.provider || 'email';
      const isSocialLogin = provider !== 'email';

      return {
        exists: true,
        provider,
        isSocialLogin,
      };
    }

    const userData = (await response.json()) as { app_metadata?: { provider?: string } };
    const provider = userData.app_metadata?.provider || 'email';
    const isSocialLogin = provider !== 'email';

    return {
      exists: true,
      provider,
      isSocialLogin,
    };
  }
}
