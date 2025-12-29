import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT', 587);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (!host || !user || !pass) {
      this.logger.warn('SMTP 설정이 없습니다. 이메일 발송이 불가능합니다.');
      // 개발 환경에서는 Ethereal 테스트 계정 사용
      if (this.configService.get('NODE_ENV') !== 'production') {
        this.createTestAccount();
      }
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  private async createTestAccount() {
    try {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      this.logger.log(`개발용 이메일 계정 생성: ${testAccount.user}`);
    } catch (error) {
      this.logger.error('테스트 이메일 계정 생성 실패', error);
    }
  }

  async sendOtpEmail(
    to: string,
    code: string,
    type: 'signup' | 'reset_password' | 'find_id',
  ): Promise<boolean> {
    if (!this.transporter) {
      this.logger.error('이메일 전송 불가: transporter가 초기화되지 않음');
      // 개발 환경에서는 콘솔에 OTP 출력
      if (this.configService.get('NODE_ENV') !== 'production') {
        this.logger.log(`[DEV] OTP for ${to}: ${code}`);
        return true;
      }
      return false;
    }

    const subjects = {
      signup: '[Snug] 회원가입 인증번호',
      reset_password: '[Snug] 비밀번호 재설정 인증번호',
      find_id: '[Snug] 아이디 찾기 인증번호',
    };

    const messages = {
      signup: '회원가입을 위한',
      reset_password: '비밀번호 재설정을 위한',
      find_id: '아이디 찾기를 위한',
    };

    const html = `
      <div style="font-family: 'Pretendard', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: #1a1a1a; font-size: 24px; font-weight: 600; margin: 0;">Snug</h1>
        </div>

        <div style="background: #f8f9fa; border-radius: 12px; padding: 32px; text-align: center;">
          <p style="color: #666; font-size: 14px; margin: 0 0 24px 0;">
            ${messages[type]} 인증번호입니다.
          </p>

          <div style="background: #fff; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
            <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #1a1a1a;">
              ${code}
            </span>
          </div>

          <p style="color: #999; font-size: 12px; margin: 0;">
            이 인증번호는 5분간 유효합니다.<br>
            본인이 요청하지 않았다면 이 이메일을 무시해주세요.
          </p>
        </div>

        <div style="text-align: center; margin-top: 40px;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            © 2024 Snug. All rights reserved.
          </p>
        </div>
      </div>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: this.configService.get('SMTP_FROM', '"Snug" <noreply@snug.com>'),
        to,
        subject: subjects[type],
        html,
      });

      this.logger.log(`이메일 발송 완료: ${info.messageId}`);

      // 개발 환경에서 Ethereal 미리보기 URL 출력
      if (this.configService.get('NODE_ENV') !== 'production') {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          this.logger.log(`이메일 미리보기: ${previewUrl}`);
        }
      }

      return true;
    } catch (error) {
      this.logger.error(`이메일 발송 실패: ${to}`, error);
      return false;
    }
  }
}
