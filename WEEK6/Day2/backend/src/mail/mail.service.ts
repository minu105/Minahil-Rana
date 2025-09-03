import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter?: nodemailer.Transporter;
  private from?: string;

  constructor(private config: ConfigService) {
    const host = this.config.get<string>('MAIL_HOST');
    const port = Number(this.config.get<string>('MAIL_PORT')) || 587;
    const user = this.config.get<string>('MAIL_USER');
    const pass = this.config.get<string>('MAIL_PASS');
    this.from = this.config.get<string>('MAIL_FROM') || user;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    } else {
      // eslint-disable-next-line no-console
      console.warn('Mail not configured: set MAIL_HOST/MAIL_PORT/MAIL_USER/MAIL_PASS');
    }
  }

  async sendOtp(to: string, otp: string) {
    const subject = 'Your OTP Code';
    const text = `Your verification code is ${otp}. It will expire in 5 minutes.`;
    const html = `<p>Your verification code is <b>${otp}</b>.</p><p>It will expire in 5 minutes.</p>`;

    if (!this.transporter || !this.from) {
      // Fallback for dev
      // eslint-disable-next-line no-console
      console.log(`[DEV MAIL] To: ${to} | ${subject} | ${text}`);
      return { dev: true };
    }

    await this.transporter.sendMail({ from: this.from, to, subject, text, html });
    return { success: true };
  }
}
