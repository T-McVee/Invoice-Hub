import { Resend } from 'resend';

function getResendApiKey(): string {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error('RESEND_API_KEY environment variable is not set');
  }
  return key;
}

function getFromEmail(): string {
  const email = process.env.FROM_EMAIL;
  if (!email) {
    throw new Error('FROM_EMAIL environment variable is not set');
  }
  return email;
}

export interface SendEmailOptions {
  to: string;
  cc?: string[];
  subject: string;
  text: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const resend = new Resend(getResendApiKey());
  const from = getFromEmail();

  const { data, error } = await resend.emails.send({
    from,
    to: options.to,
    cc: options.cc,
    subject: options.subject,
    text: options.text,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, messageId: data?.id };
}
