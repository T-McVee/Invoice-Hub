import type { SendEmailOptions } from '../client';

function getAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (!url) {
    throw new Error('NEXT_PUBLIC_APP_URL environment variable is not set');
  }
  return url;
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

  return {
    to,
    cc: cc && cc.length > 0 ? cc : undefined,
    subject: `${formattedMonth} timesheet`,
    text: `Hi ${primaryContactName},\n\nPlease find my ${formattedMonth} timesheet is ready for review and approval in your portal: ${portalLink}\n\nThanks again, Tim.`,
  };
}
