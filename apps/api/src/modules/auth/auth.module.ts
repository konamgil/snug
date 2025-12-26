import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SupabaseJwtStrategy } from './strategies/supabase-jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersModule } from '../users/users.module';

/**
 * Auth Module
 *
 * 인증 관련 기능을 제공하는 모듈입니다.
 *
 * ## 인증 전략
 * - SupabaseJwtStrategy: Supabase Auth에서 발급한 JWT 토큰 검증 (주요)
 * - JwtStrategy: 자체 JWT 토큰 검증 (레거시, 필요시 사용)
 *
 * ## 사용법
 * ```typescript
 * // Controller에서 인증 적용
 * @UseGuards(JwtAuthGuard)
 * @Controller('protected')
 * export class ProtectedController {
 *   @Get()
 *   getProtected(@CurrentUser() user: User) {
 *     return user;
 *   }
 * }
 * ```
 */
@Module({
  imports: [
    UsersModule,
    // Supabase JWT를 기본 전략으로 사용
    PassportModule.register({ defaultStrategy: 'supabase-jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => ({
        // Supabase JWT Secret 사용
        secret: configService.get<string>('SUPABASE_JWT_SECRET'),
        signOptions: {
          expiresIn: '7d',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    SupabaseJwtStrategy, // Supabase JWT 검증 (주요)
    JwtStrategy, // 자체 JWT 검증 (레거시)
    JwtAuthGuard,
  ],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
