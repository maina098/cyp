import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER && process.env.SMTP_PASSWORD
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined,
  });

  private get sender() {
    const sender = process.env.MAIL_FROM;
    if (!sender) throw new Error('MAIL_FROM must be configured');
    return sender;
  }

  private get appUrl() {
    return (process.env.FRONTEND_URL || 'http://localhost:3000').split(',')[0].replace(/\/$/, '');
  }

  async sendVerificationEmail(email: string, token: string) {
    await this.transporter.sendMail({
      from: this.sender,
      to: email,
      subject: 'Verify your CYP account',
      text: `Verify your email address: ${this.appUrl}/verify-email?token=${encodeURIComponent(token)}`,
    });
    this.logger.log(`Verification email sent to ${email}`);
  }

  async sendPasswordResetEmail(email: string, token: string) {
    await this.transporter.sendMail({
      from: this.sender,
      to: email,
      subject: 'Reset your CYP password',
      text: `Reset your password: ${this.appUrl}/reset-password?token=${encodeURIComponent(token)}`,
    });
    this.logger.log(`Password reset email sent to ${email}`);
  }

  async sendVotingOtpEmail(email: string, code: string, electionTitle: string) {
    await this.transporter.sendMail({
      from: this.sender,
      to: email,
      subject: `Your CYP voting code for ${electionTitle}`,
      text: `Your one-time voting code is ${code}. It expires in 5 minutes. If you did not request this code, ignore this email.`,
    });
    this.logger.log(`Voting OTP email sent to ${email}`);
  }
}
