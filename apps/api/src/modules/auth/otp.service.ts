import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { OtpType } from '@snug/database';

const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 5;

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {
    this.logger.log('OtpService initialized');
  }

  /**
   * OTP 생성 및 이메일 발송
   */
  async sendOtp(email: string, type: OtpType): Promise<{ success: boolean; message: string }> {
    // 기존 미검증 OTP 삭제
    await this.prisma.emailOtp.deleteMany({
      where: {
        email,
        type,
        verified: false,
      },
    });

    // 6자리 OTP 생성
    const code = this.generateOtpCode();

    // OTP 저장
    await this.prisma.emailOtp.create({
      data: {
        email,
        code,
        type,
        expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
      },
    });

    // 이메일 발송
    const typeMap = {
      [OtpType.SIGNUP]: 'signup',
      [OtpType.RESET_PASSWORD]: 'reset_password',
      [OtpType.FIND_ID]: 'find_id',
    } as const;

    const sent = await this.emailService.sendOtpEmail(email, code, typeMap[type]);

    if (!sent) {
      throw new BadRequestException('이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }

    return {
      success: true,
      message: '인증번호가 발송되었습니다.',
    };
  }

  /**
   * OTP 검증
   */
  async verifyOtp(
    email: string,
    code: string,
    type: OtpType,
  ): Promise<{ success: boolean; message: string }> {
    const otp = await this.prisma.emailOtp.findFirst({
      where: {
        email,
        type,
        verified: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otp) {
      throw new BadRequestException('인증번호를 먼저 요청해주세요.');
    }

    // 만료 체크
    if (new Date() > otp.expiresAt) {
      await this.prisma.emailOtp.delete({ where: { id: otp.id } });
      throw new BadRequestException('인증번호가 만료되었습니다. 다시 요청해주세요.');
    }

    // 시도 횟수 체크
    if (otp.attempts >= MAX_ATTEMPTS) {
      await this.prisma.emailOtp.delete({ where: { id: otp.id } });
      throw new BadRequestException('인증 시도 횟수를 초과했습니다. 다시 요청해주세요.');
    }

    // 코드 검증
    if (otp.code !== code) {
      await this.prisma.emailOtp.update({
        where: { id: otp.id },
        data: { attempts: otp.attempts + 1 },
      });
      throw new BadRequestException(
        `인증번호가 일치하지 않습니다. (${MAX_ATTEMPTS - otp.attempts - 1}회 남음)`,
      );
    }

    // 인증 성공
    await this.prisma.emailOtp.update({
      where: { id: otp.id },
      data: { verified: true },
    });

    return {
      success: true,
      message: '인증이 완료되었습니다.',
    };
  }

  /**
   * 이메일 인증 여부 확인 (회원가입 시 사용)
   */
  async isEmailVerified(email: string, type: OtpType): Promise<boolean> {
    const otp = await this.prisma.emailOtp.findFirst({
      where: {
        email,
        type,
        verified: true,
        expiresAt: {
          gt: new Date(Date.now() - 30 * 60 * 1000), // 인증 후 30분 내 유효
        },
      },
    });

    return !!otp;
  }

  /**
   * 인증된 OTP 삭제 (회원가입 완료 후)
   */
  async clearVerifiedOtp(email: string, type: OtpType): Promise<void> {
    await this.prisma.emailOtp.deleteMany({
      where: {
        email,
        type,
        verified: true,
      },
    });
  }

  /**
   * 6자리 숫자 OTP 생성
   */
  private generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
