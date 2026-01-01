import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface RegisterTokenDto {
  userId: string;
  token: string;
  deviceType?: string;
  userAgent?: string;
}

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  // FCM 토큰 등록/업데이트
  async registerToken(dto: RegisterTokenDto) {
    const { userId, token, deviceType, userAgent } = dto;

    // upsert: 토큰이 있으면 업데이트, 없으면 생성
    return this.prisma.fcmToken.upsert({
      where: { token },
      update: {
        userId,
        deviceType,
        userAgent,
        isActive: true,
        updatedAt: new Date(),
      },
      create: {
        userId,
        token,
        deviceType,
        userAgent,
        isActive: true,
      },
    });
  }

  // FCM 토큰 비활성화 (로그아웃 시)
  async deactivateToken(token: string) {
    return this.prisma.fcmToken.update({
      where: { token },
      data: { isActive: false },
    });
  }

  // 사용자의 모든 활성 토큰 조회
  async getActiveTokensByUserId(userId: string) {
    return this.prisma.fcmToken.findMany({
      where: {
        userId,
        isActive: true,
      },
    });
  }

  // 사용자의 모든 토큰 삭제
  async deleteTokensByUserId(userId: string) {
    return this.prisma.fcmToken.deleteMany({
      where: { userId },
    });
  }

  // 특정 토큰 삭제
  async deleteToken(token: string) {
    return this.prisma.fcmToken.delete({
      where: { token },
    });
  }
}
