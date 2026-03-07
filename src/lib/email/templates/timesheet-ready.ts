import type { SendEmailOptions } from '../client';

function getAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (!url) {
    throw new Error('NEXT_PUBLIC_APP_URL environment variable is not set');
  }
  return url.replace(/\/+$/, '');
}

function formatMonth(month: string): string {
  const [year, monthNum] = month.split('-');
  const date = new Date(Number(year), Number(monthNum) - 1);
  return date.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });
}

export interface TimesheetReadyParams {
  primaryContactName: string;
  to: string;
  cc?: string[];
  month: string;
  portalToken: string;
}

export function buildTimesheetReadyEmail(params: TimesheetReadyParams): SendEmailOptions {
  const { primaryContactName, to, cc, month, portalToken } = params;
  const appUrl = getAppUrl();
  const portalLink = `${appUrl}/portal/${portalToken}`;
  const formattedMonth = formatMonth(month);

  const text = `Hi ${primaryContactName},\n\nMy ${formattedMonth} timesheet is ready for review and approval in your portal: ${portalLink}\n\nThanks again, Tim.`;

  const html = `<p>Hi ${primaryContactName},</p>
<p>My ${formattedMonth} timesheet is ready for review and approval in your portal:</p>
<p style="margin: 24px 0;">
  <a href="${portalLink}" style="background-color: #e54a00; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Review Timesheet</a>
</p>
<p>Thanks again, Tim.</p>`;

  return {
    to,
    cc: cc && cc.length > 0 ? cc : undefined,
    subject: `${formattedMonth} timesheet`,
    text,
    html,
  };
}
