import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

interface SupabaseJwtPayload {
  sub: string;
  email?: string;
  role?: string;
  aud?: string;
  iat: number;
  exp: number;
}

@Injectable()
export class SupabaseJwtStrategy extends PassportStrategy(Strategy, 'supabase-jwt') {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('SUPABASE_JWT_SECRET') || 'fallback-supabase-jwt-secret',
    });
  }

  async validate(payload: SupabaseJwtPayload) {
    // Supabase JWT의 sub는 Supabase user UUID
    // 데이터베이스에서 해당 supabaseId로 사용자 조회
    const user = await this.usersService.findBySupabaseId(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // 전체 User 객체 반환 (CurrentUser 데코레이터에서 사용)
    return user;
  }
}
