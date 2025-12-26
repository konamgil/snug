import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { User } from '@snug/database';

/**
 * CurrentUser 데코레이터
 *
 * JWT 인증 후 req.user에 설정된 사용자 정보를 가져옵니다.
 * JwtAuthGuard와 함께 사용해야 합니다.
 *
 * @example
 * // 전체 User 객체 가져오기
 * @UseGuards(JwtAuthGuard)
 * @Get('profile')
 * getProfile(@CurrentUser() user: User) {
 *   return user;
 * }
 *
 * @example
 * // 특정 필드만 가져오기
 * @UseGuards(JwtAuthGuard)
 * @Get('my-id')
 * getMyId(@CurrentUser('id') userId: string) {
 *   return { userId };
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as User;

    // 특정 필드가 요청된 경우 해당 필드만 반환
    if (data) {
      return user?.[data];
    }

    // 전체 User 객체 반환
    return user;
  },
);
