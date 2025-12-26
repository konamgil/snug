import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../prisma/prisma.service';

/**
 * Supabase JWT Payload 구조
 * Supabase Auth에서 발급하는 JWT 토큰의 payload
 */
interface SupabaseJwtPayload {
  /** Supabase User ID (UUID) */
  sub: string;
  /** 사용자 이메일 */
  email?: string;
  /** Audience (프로젝트 식별자) */
  aud: string;
  /** 역할 (authenticated, anon 등) */
  role: string;
  /** 발급 시간 */
  iat: number;
  /** 만료 시간 */
  exp: number;
  /** 앱 메타데이터 */
  app_metadata?: {
    provider?: string;
    providers?: string[];
  };
  /** 사용자 메타데이터 */
  user_metadata?: {
    avatar_url?: string;
    email?: string;
    email_verified?: boolean;
    full_name?: string;
    name?: string;
    preferred_username?: string;
    provider_id?: string;
    sub?: string;
  };
}

/**
 * Supabase JWT Strategy
 *
 * Supabase Auth에서 발급한 JWT 토큰을 검증하고,
 * 우리 DB의 User 정보를 req.user에 설정합니다.
 *
 * @example
 * // Controller에서 사용
 * @UseGuards(JwtAuthGuard)
 * @Get('profile')
 * getProfile(@CurrentUser() user: User) {
 *   return user;
 * }
 */
@Injectable()
export class SupabaseJwtStrategy extends PassportStrategy(Strategy, 'supabase-jwt') {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const jwtSecret = configService.get<string>('SUPABASE_JWT_SECRET');

    if (!jwtSecret) {
      throw new Error('SUPABASE_JWT_SECRET is not configured');
    }

    super({
      // Authorization 헤더에서 Bearer 토큰 추출
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 토큰 만료 검사 활성화
      ignoreExpiration: false,
      // Supabase JWT Secret으로 검증
      secretOrKey: jwtSecret,
    });
  }

  /**
   * JWT 토큰 검증 후 호출되는 메서드
   * payload의 sub (Supabase ID)로 우리 DB의 User를 조회합니다.
   *
   * @param payload - Supabase JWT payload
   * @returns DB User 객체 (req.user에 설정됨)
   * @throws UnauthorizedException - 사용자를 찾을 수 없는 경우
   */
  async validate(payload: SupabaseJwtPayload) {
    // Supabase ID로 우리 DB의 User 조회
    const user = await this.prisma.user.findUnique({
      where: { supabaseId: payload.sub },
      include: {
        hostProfile: true,
        guestProfile: true,
      },
    });

    if (!user) {
      // 사용자가 DB에 없는 경우
      // (Supabase에만 있고 우리 DB에 아직 생성 안 된 경우)
      throw new UnauthorizedException('User not found in database. Please complete registration.');
    }

    // req.user에 설정될 값
    return user;
  }
}
