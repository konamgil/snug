import { Controller, Post, Body, UseGuards, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { RegisterTokenDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators';

@ApiTags('notifications')
@ApiBearerAuth('JWT-auth')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('fcm-token')
  @ApiOperation({
    summary: 'FCM 토큰 등록',
    description: '푸시 알림을 위한 FCM 토큰을 등록합니다.',
  })
  @ApiResponse({ status: 201, description: '토큰 등록 성공' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async registerToken(
    @CurrentUser('id') userId: string,
    @Body() dto: RegisterTokenDto,
    @Headers('user-agent') userAgent?: string,
  ) {
    return this.notificationsService.registerToken({
      userId,
      token: dto.token,
      deviceType: dto.deviceType || 'web',
      userAgent: dto.userAgent || userAgent,
    });
  }

  @Post('fcm-token/deactivate')
  @ApiOperation({
    summary: 'FCM 토큰 비활성화',
    description: '로그아웃 시 FCM 토큰을 비활성화합니다.',
  })
  @ApiResponse({ status: 200, description: '토큰 비활성화 성공' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deactivateToken(@Body() dto: RegisterTokenDto) {
    return this.notificationsService.deactivateToken(dto.token);
  }
}
