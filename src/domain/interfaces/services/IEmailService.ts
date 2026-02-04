export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface IEmailService {
  isConfigured(): boolean;
  send(input: SendEmailInput): Promise<{ success: boolean; messageId?: string }>;
}
