import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';

/**
 * JWT Auth Guard
 *
 * Supabase JWT Strategy를 사용하여 인증을 수행합니다.
 * @Public() 데코레이터가 적용된 엔드포인트는 인증을 건너뜁니다.
 *
 * @example
 * // 인증 필요한 엔드포인트
 * @UseGuards(JwtAuthGuard)
 * @Get('profile')
 * getProfile(@CurrentUser() user: User) {}
 *
 * @example
 * // 인증 불필요한 엔드포인트 (컨트롤러 전체에 Guard가 적용된 경우)
 * @Public()
 * @Get('public-info')
 * getPublicInfo() {}
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('supabase-jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
