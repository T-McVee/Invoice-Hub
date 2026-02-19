import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGetInvoiceById, mockGetClientById, mockUpdateInvoice, mockSendInvoiceEmail } =
  vi.hoisted(() => ({
    mockGetInvoiceById: vi.fn(),
    mockGetClientById: vi.fn(),
    mockUpdateInvoice: vi.fn(),
    mockSendInvoiceEmail: vi.fn(),
  }));

vi.mock('../../../../../lib/db', () => ({
  getInvoiceById: mockGetInvoiceById,
  getClientById: mockGetClientById,
  updateInvoice: mockUpdateInvoice,
}));

vi.mock('../../../../../lib/email/send-invoice', () => ({
  sendInvoiceEmail: mockSendInvoiceEmail,
}));

import { POST } from './route';

function createParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe('POST /api/invoices/[id]/send', () => {
  const invoiceId = 'invoice-123';
  const clientId = 'client-456';

  const invoice = {
    id: invoiceId,
    clientId,
    timesheetId: 'ts-789',
    invoiceNumber: '1001',
    month: '2026-01',
    amount: 4000,
    status: 'draft' as const,
    pdfUrl: 'https://blob.storage/invoices/client-456/1001.pdf',
    sentAt: null,
    paidAt: null,
    createdAt: new Date('2026-01-24T12:00:00Z'),
  };

  const client = {
    id: clientId,
    name: 'Acme Corp',
    contacts: [
      {
        id: 'contact-1',
        name: 'Alice',
        email: 'alice@acme.com',
        role: 'billing',
        isPrimaryBilling: true,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-24T12:00:00Z'));
    mockGetInvoiceById.mockResolvedValue(invoice);
    mockGetClientById.mockResolvedValue(client);
    mockSendInvoiceEmail.mockResolvedValue({ status: 'sent' });
    mockUpdateInvoice.mockImplementation(async (id, updates) => ({
      ...invoice,
      id,
      ...updates,
    }));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('sends email and updates invoice to sent', async () => {
    const response = await POST(new Request('http://localhost'), createParams(invoiceId));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.invoice.status).toBe('sent');
    expect(data.invoice.sentAt).toBe('2026-01-24T12:00:00.000Z');
    expect(mockSendInvoiceEmail).toHaveBeenCalledWith(client, invoice);
    expect(mockUpdateInvoice).toHaveBeenCalledWith(invoiceId, {
      status: 'sent',
      sentAt: expect.any(Date),
    });
  });

  it('returns 404 when invoice not found', async () => {
    mockGetInvoiceById.mockResolvedValue(undefined);

    const response = await POST(new Request('http://localhost'), createParams('nonexistent'));
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Invoice not found');
    expect(mockSendInvoiceEmail).not.toHaveBeenCalled();
  });

  it('returns 404 when client not found', async () => {
    mockGetClientById.mockResolvedValue(undefined);

    const response = await POST(new Request('http://localhost'), createParams(invoiceId));
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Client not found');
    expect(mockSendInvoiceEmail).not.toHaveBeenCalled();
  });

  it('returns 422 when no billing contact configured', async () => {
    mockSendInvoiceEmail.mockResolvedValue({
      status: 'skipped',
      error: 'No primary billing contact configured',
    });

    const response = await POST(new Request('http://localhost'), createParams(invoiceId));
    const data = await response.json();

    expect(response.status).toBe(422);
    expect(data.error).toBe('No primary billing contact configured');
    expect(mockUpdateInvoice).not.toHaveBeenCalled();
  });

  it('returns 502 when email send fails', async () => {
    mockSendInvoiceEmail.mockResolvedValue({ status: 'failed', error: 'SMTP timeout' });

    const response = await POST(new Request('http://localhost'), createParams(invoiceId));
    const data = await response.json();

    expect(response.status).toBe(502);
    expect(data.error).toBe('SMTP timeout');
    expect(mockUpdateInvoice).not.toHaveBeenCalled();
  });

  it('returns generic error message when failed result has no error string', async () => {
    mockSendInvoiceEmail.mockResolvedValue({ status: 'failed' });

    const response = await POST(new Request('http://localhost'), createParams(invoiceId));
    const data = await response.json();

    expect(response.status).toBe(502);
    expect(data.error).toBe('Email send failed');
  });
});
