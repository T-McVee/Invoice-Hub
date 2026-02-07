import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendTimesheetNotification } from './notify-helper';
import type { Client } from '@/types';

const { mockSendEmail, mockBuildTimesheetReadyEmail } = vi.hoisted(() => ({
  mockSendEmail: vi.fn(),
  mockBuildTimesheetReadyEmail: vi.fn(),
}));

vi.mock('../../../lib/email/client', () => ({
  sendEmail: mockSendEmail,
}));

vi.mock('../../../lib/email/templates/timesheet-ready', () => ({
  buildTimesheetReadyEmail: mockBuildTimesheetReadyEmail,
}));

function makeClient(contacts: Client['contacts'] = []): Client {
  return {
    id: 'client-1',
    name: 'Test Client',
    togglClientId: null,
    togglProjectId: 'proj-1',
    timesheetRecipients: [],
    invoiceRecipients: [],
    notes: null,
    billingAddress: null,
    portalToken: 'token-123',
    contacts,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe('sendTimesheetNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBuildTimesheetReadyEmail.mockReturnValue({
      to: 'alice@example.com',
      cc: ['bob@example.com'],
      subject: 'January 2026 timesheet',
      text: 'Hi Alice, ...',
    });
  });

  it('skips when no primary approver exists', async () => {
    const client = makeClient([
      {
        id: '1',
        clientId: 'client-1',
        name: 'Alice',
        email: 'alice@example.com',
        role: 'approver',
        isPrimaryApprover: false,
        isPrimaryBilling: false,
      },
    ]);

    const result = await sendTimesheetNotification(client, '2026-01', 'token');
    expect(result.status).toBe('skipped');
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it('skips when no approver contacts exist', async () => {
    const client = makeClient([
      {
        id: '1',
        clientId: 'client-1',
        name: 'Alice',
        email: 'alice@example.com',
        role: 'billing',
        isPrimaryApprover: false,
        isPrimaryBilling: true,
      },
    ]);

    const result = await sendTimesheetNotification(client, '2026-01', 'token');
    expect(result.status).toBe('skipped');
  });

  it('sends TO primary approver and CC to other approver contacts', async () => {
    mockSendEmail.mockResolvedValueOnce({ success: true, messageId: 'msg-1' });

    const client = makeClient([
      {
        id: '1',
        clientId: 'client-1',
        name: 'Alice',
        email: 'alice@example.com',
        role: 'approver',
        isPrimaryApprover: true,
        isPrimaryBilling: false,
      },
      {
        id: '2',
        clientId: 'client-1',
        name: 'Bob',
        email: 'bob@example.com',
        role: 'both',
        isPrimaryApprover: false,
        isPrimaryBilling: true,
      },
      {
        id: '3',
        clientId: 'client-1',
        name: 'Carol',
        email: 'carol@example.com',
        role: 'billing',
        isPrimaryApprover: false,
        isPrimaryBilling: false,
      },
    ]);

    const result = await sendTimesheetNotification(client, '2026-01', 'token');
    expect(result.status).toBe('sent');
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    // Bob (role=both) should be in CC; Carol (role=billing) should NOT be in CC
    expect(mockBuildTimesheetReadyEmail).toHaveBeenCalledWith({
      primaryContactName: 'Alice',
      to: 'alice@example.com',
      cc: ['bob@example.com'],
      month: '2026-01',
      portalToken: 'token',
    });
  });

  it('returns failed when email sending fails', async () => {
    mockSendEmail.mockResolvedValueOnce({ success: false, error: 'API error' });

    const client = makeClient([
      {
        id: '1',
        clientId: 'client-1',
        name: 'Alice',
        email: 'alice@example.com',
        role: 'approver',
        isPrimaryApprover: true,
        isPrimaryBilling: false,
      },
    ]);

    const result = await sendTimesheetNotification(client, '2026-01', 'token');
    expect(result.status).toBe('failed');
    expect(result.error).toBe('API error');
  });

  it('returns failed when sendEmail throws', async () => {
    mockSendEmail.mockRejectedValueOnce(new Error('Network error'));

    const client = makeClient([
      {
        id: '1',
        clientId: 'client-1',
        name: 'Alice',
        email: 'alice@example.com',
        role: 'approver',
        isPrimaryApprover: true,
        isPrimaryBilling: false,
      },
    ]);

    const result = await sendTimesheetNotification(client, '2026-01', 'token');
    expect(result.status).toBe('failed');
    expect(result.error).toBe('Network error');
  });

  it('sends to "both" contact as primary approver', async () => {
    mockSendEmail.mockResolvedValueOnce({ success: true, messageId: 'msg-1' });

    const client = makeClient([
      {
        id: '1',
        clientId: 'client-1',
        name: 'Alice',
        email: 'alice@example.com',
        role: 'both',
        isPrimaryApprover: true,
        isPrimaryBilling: true,
      },
    ]);

    const result = await sendTimesheetNotification(client, '2026-01', 'token');
    expect(result.status).toBe('sent');
  });

  it('skips when client has no contacts', async () => {
    const client = makeClient([]);
    const result = await sendTimesheetNotification(client, '2026-01', 'token');
    expect(result.status).toBe('skipped');
  });
});
