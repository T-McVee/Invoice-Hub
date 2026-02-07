import type { Client } from '@/types';
import { sendEmail } from '@/lib/email/client';
import { buildTimesheetReadyEmail } from '@/lib/email/templates/timesheet-ready';

export interface NotificationResult {
  status: 'sent' | 'failed' | 'skipped';
  error?: string;
}

export async function sendTimesheetNotification(
  client: Client,
  month: string,
  portalToken: string
): Promise<NotificationResult> {
  // Find approver contacts (role = 'approver' or 'both')
  const approverContacts = client.contacts.filter(
    (c) => c.role === 'approver' || c.role === 'both'
  );

  // Find the primary approver
  const primaryApprover = approverContacts.find((c) => c.isPrimaryApprover);

  if (!primaryApprover) {
    return { status: 'skipped', error: 'No primary approver contact configured' };
  }

  // CC: all other approver/both contacts
  const ccContacts = approverContacts
    .filter((c) => c.id !== primaryApprover.id)
    .map((c) => c.email);

  const emailOptions = buildTimesheetReadyEmail({
    primaryContactName: primaryApprover.name,
    to: primaryApprover.email,
    cc: ccContacts,
    month,
    portalToken,
  });

  try {
    const result = await sendEmail(emailOptions);
    if (result.success) {
      return { status: 'sent' };
    }
    return { status: 'failed', error: result.error };
  } catch (error) {
    console.error('Failed to send timesheet notification:', error);
    return {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown email error',
    };
  }
}
