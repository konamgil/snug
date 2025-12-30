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
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f5f5f5;">
        <div style="font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">

          <!-- Main Card -->
          <div style="background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">

            <!-- Header -->
            <div style="background: #ffffff; padding: 40px 32px 24px; text-align: center; border-bottom: 1px solid #f0f0f0;">
              <img src="https://findsnug.com/images/og_1200x630.png" alt="Snug" style="max-width: 200px; height: auto; margin-bottom: 20px;" />
              <h1 style="color: #ff7900; font-size: 22px; font-weight: 700; margin: 0;">
                ${messages[type]} 인증번호
              </h1>
            </div>

            <!-- Content -->
            <div style="padding: 40px 32px; text-align: center;">
              <p style="color: #666666; font-size: 15px; line-height: 1.6; margin: 0 0 32px 0;">
                아래 인증번호를 입력하여<br>본인 확인을 완료해주세요.
              </p>

              <!-- OTP Code Box -->
              <div style="background: linear-gradient(135deg, #fff8f3 0%, #fff0e6 100%); border: 2px solid #ff7900; border-radius: 16px; padding: 24px 32px; margin-bottom: 32px; display: inline-block;">
                <span style="font-size: 36px; font-weight: 700; letter-spacing: 12px; color: #ff7900; font-family: 'Courier New', monospace;">
                  ${code}
                </span>
              </div>

              <p style="color: #999999; font-size: 13px; line-height: 1.6; margin: 0;">
                ⏱️ 이 인증번호는 <strong style="color: #ff7900;">5분간</strong> 유효합니다.<br>
                본인이 요청하지 않았다면 이 이메일을 무시해주세요.
              </p>
            </div>

            <!-- Footer -->
            <div style="background: #fafafa; padding: 24px 32px; text-align: center; border-top: 1px solid #f0f0f0;">
              <p style="color: #999999; font-size: 12px; margin: 0 0 8px 0;">
                도움이 필요하시면 <a href="mailto:cs@findsnug.com" style="color: #ff7900; text-decoration: none;">cs@findsnug.com</a>으로 문의해주세요.
              </p>
              <p style="color: #cccccc; font-size: 11px; margin: 0;">
                © 2025 Snug. All rights reserved.
              </p>
            </div>

          </div>
        </div>
      </body>
      </html>
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
