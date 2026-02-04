import { Resend } from 'resend';
import type { IEmailService, SendEmailInput } from '@/domain/interfaces/services/IEmailService';
import { AppConfig } from '@/infrastructure/config/AppConfig';

export class ResendEmailService implements IEmailService {
  private readonly resend: Resend | null;
  private readonly from: string;

  constructor() {
    if (AppConfig.resendApiKey) {
      this.resend = new Resend(AppConfig.resendApiKey);
    } else {
      this.resend = null;
    }
    this.from = AppConfig.emailFrom ?? 'noreply@example.com';
  }

  isConfigured(): boolean {
    return this.resend !== null;
  }

  async send(input: SendEmailInput): Promise<{ success: boolean; messageId?: string }> {
    if (!this.resend) {
      console.warn('Email service not configured. Skipping email send.');
      return { success: false };
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.from,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
      });

      if (error) {
        console.error('Failed to send email:', error);
        return { success: false };
      }

      return { success: true, messageId: data?.id };
    } catch (error) {
      console.error('Email send error:', error);
      return { success: false };
    }
  }
}
