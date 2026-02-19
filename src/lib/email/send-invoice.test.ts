import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendInvoiceEmail } from './send-invoice';
import type { Client, Invoice } from '@/types';

const { mockSendEmail, mockDownloadPdf, mockBuildInvoiceReadyEmail } = vi.hoisted(() => ({
  mockSendEmail: vi.fn(),
  mockDownloadPdf: vi.fn(),
  mockBuildInvoiceReadyEmail: vi.fn(),
}));

vi.mock('./client', () => ({
  sendEmail: mockSendEmail,
}));

vi.mock('../blob/client', () => ({
  downloadPdf: mockDownloadPdf,
  getInvoiceBlobPath: (clientId: string, invoiceNumber: string) =>
    `invoices/${clientId}/${invoiceNumber}.pdf`,
}));

vi.mock('./templates/invoice-ready', () => ({
  buildInvoiceReadyEmail: mockBuildInvoiceReadyEmail,
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

function makeInvoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: 'inv-1',
    clientId: 'client-1',
    timesheetId: 'ts-1',
    invoiceNumber: '42',
    month: '2026-01',
    amount: 5500,
    status: 'draft',
    pdfUrl: 'https://blob.example.com/invoices/client-1/42.pdf',
    sentAt: null,
    paidAt: null,
    createdAt: new Date(),
    ...overrides,
  };
}

const fakePdfBuffer = Buffer.from('fake-pdf');

describe('sendInvoiceEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDownloadPdf.mockResolvedValue(fakePdfBuffer);
    mockBuildInvoiceReadyEmail.mockReturnValue({
      to: 'alice@example.com',
      subject: 'Invoice #42 - January 2026',
      text: 'Hi Alice, ...',
      attachments: [{ filename: 'invoice-42-jan-2026.pdf', content: fakePdfBuffer }],
    });
  });

  it('skips when no primary billing contact exists', async () => {
    const client = makeClient([
      {
        id: '1',
        clientId: 'client-1',
        name: 'Alice',
        email: 'alice@example.com',
        role: 'billing',
        isPrimaryApprover: false,
        isPrimaryBilling: false,
      },
    ]);

    const result = await sendInvoiceEmail(client, makeInvoice());
    expect(result.status).toBe('skipped');
    expect(result.error).toBe('No primary billing contact configured');
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it('skips when no billing contacts exist', async () => {
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

    const result = await sendInvoiceEmail(client, makeInvoice());
    expect(result.status).toBe('skipped');
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it('skips when client has no contacts', async () => {
    const result = await sendInvoiceEmail(makeClient([]), makeInvoice());
    expect(result.status).toBe('skipped');
  });

  it('downloads PDF from blob and sends to primary billing contact', async () => {
    mockSendEmail.mockResolvedValueOnce({ success: true, messageId: 'msg-1' });

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

    const result = await sendInvoiceEmail(client, makeInvoice());

    expect(result.status).toBe('sent');
    expect(mockDownloadPdf).toHaveBeenCalledWith('invoices/client-1/42.pdf');
    expect(mockBuildInvoiceReadyEmail).toHaveBeenCalledWith({
      primaryContactName: 'Alice',
      to: 'alice@example.com',
      cc: [],
      invoiceNumber: '42',
      month: '2026-01',
      pdfBuffer: fakePdfBuffer,
    });
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
  });

  it('CCs other billing/both contacts but not approver-only contacts', async () => {
    mockSendEmail.mockResolvedValueOnce({ success: true, messageId: 'msg-1' });

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
      {
        id: '2',
        clientId: 'client-1',
        name: 'Bob',
        email: 'bob@example.com',
        role: 'both',
        isPrimaryApprover: true,
        isPrimaryBilling: false,
      },
      {
        id: '3',
        clientId: 'client-1',
        name: 'Carol',
        email: 'carol@example.com',
        role: 'approver',
        isPrimaryApprover: false,
        isPrimaryBilling: false,
      },
    ]);

    await sendInvoiceEmail(client, makeInvoice());

    // Bob (role=both) should be CC'd; Carol (role=approver) should NOT
    expect(mockBuildInvoiceReadyEmail).toHaveBeenCalledWith(
      expect.objectContaining({ cc: ['bob@example.com'] })
    );
  });

  it('returns failed when email sending returns an error', async () => {
    mockSendEmail.mockResolvedValueOnce({ success: false, error: 'API error' });

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

    const result = await sendInvoiceEmail(client, makeInvoice());
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
        role: 'billing',
        isPrimaryApprover: false,
        isPrimaryBilling: true,
      },
    ]);

    const result = await sendInvoiceEmail(client, makeInvoice());
    expect(result.status).toBe('failed');
    expect(result.error).toBe('Network error');
  });

  it('returns failed when PDF download fails', async () => {
    mockDownloadPdf.mockRejectedValueOnce(new Error('Blob storage unavailable'));

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

    const result = await sendInvoiceEmail(client, makeInvoice());
    expect(result.status).toBe('failed');
    expect(result.error).toBe('Blob storage unavailable');
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it('sends to "both" contact as primary billing', async () => {
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

    const result = await sendInvoiceEmail(client, makeInvoice());
    expect(result.status).toBe('sent');
  });
});
