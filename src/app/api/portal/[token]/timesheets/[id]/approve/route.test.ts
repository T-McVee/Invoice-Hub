import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Create hoisted mock functions
const {
  mockVerifyPortalToken,
  mockGetTimesheetById,
  mockUpdateTimesheet,
  mockGetClientById,
  mockCreateInvoice,
  mockUpdateInvoice,
  mockGenerateInvoice,
  mockSendInvoiceEmail,
} = vi.hoisted(() => ({
  mockVerifyPortalToken: vi.fn(),
  mockGetTimesheetById: vi.fn(),
  mockUpdateTimesheet: vi.fn(),
  mockGetClientById: vi.fn(),
  mockCreateInvoice: vi.fn(),
  mockUpdateInvoice: vi.fn(),
  mockGenerateInvoice: vi.fn(),
  mockSendInvoiceEmail: vi.fn(),
}));

// Mock using relative paths (7 levels up from approve/ to src/)
vi.mock('../../../../../../../lib/auth/jwt', () => ({
  verifyPortalToken: mockVerifyPortalToken,
}));

vi.mock('../../../../../../../lib/db', () => ({
  getTimesheetById: mockGetTimesheetById,
  updateTimesheet: mockUpdateTimesheet,
  getClientById: mockGetClientById,
  createInvoice: mockCreateInvoice,
  updateInvoice: mockUpdateInvoice,
}));

vi.mock('../../../../../../../lib/invoice-generator', () => ({
  generateInvoice: mockGenerateInvoice,
}));

vi.mock('../../../../../../../lib/email/send-invoice', () => ({
  sendInvoiceEmail: mockSendInvoiceEmail,
}));

// Import route after mocks are set up
import { POST } from './route';

function createParams(token: string, id: string) {
  return { params: Promise.resolve({ token, id }) };
}

describe('POST /api/portal/[token]/timesheets/[id]/approve', () => {
  const clientId = 'client-123';
  const timesheetId = 'ts-456';
  const clientData = { id: clientId, name: 'Test Client' };

  beforeEach(() => {
    vi.stubEnv('JWT_SECRET', 'test-secret-key-for-jwt-signing');
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-24T12:00:00Z'));
    // Default mocks for invoice generation
    mockGetClientById.mockResolvedValue(clientData);
    mockGenerateInvoice.mockResolvedValue({
      invoiceNumber: '1001',
      amount: 4000,
      pdfUrl: 'https://blob.storage/invoices/client-123/1001.pdf',
      blobPath: 'invoices/client-123/1001.pdf',
    });
    mockCreateInvoice.mockImplementation(async (data) => ({
      id: 'invoice-789',
      ...data,
      createdAt: new Date('2026-01-24T12:00:00Z'),
    }));
    mockUpdateInvoice.mockImplementation(async (id, updates) => ({
      id,
      clientId,
      timesheetId,
      invoiceNumber: '1001',
      month: '2026-01',
      amount: 4000,
      pdfUrl: 'https://blob.storage/invoices/client-123/1001.pdf',
      sentAt: null,
      paidAt: null,
      createdAt: new Date('2026-01-24T12:00:00Z'),
      ...updates,
    }));
    // Default: email sends successfully
    mockSendInvoiceEmail.mockResolvedValue({ status: 'sent' });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it('successfully approves a pending timesheet and generates invoice', async () => {
    const timesheet = {
      id: timesheetId,
      clientId,
      month: '2026-01',
      status: 'pending',
      totalHours: 40,
      invoiceNumber: 1001,
      approvedAt: null,
    };
    const updatedTimesheet = {
      ...timesheet,
      status: 'approved',
      approvedAt: new Date('2026-01-24T12:00:00Z'),
    };

    mockVerifyPortalToken.mockReturnValue({ clientId, exp: Date.now() / 1000 + 3600 });
    mockGetTimesheetById.mockResolvedValue(timesheet);
    mockUpdateTimesheet.mockResolvedValue(updatedTimesheet);

    const response = await POST(
      new Request('http://localhost'),
      createParams('valid-token', timesheetId)
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.timesheet.status).toBe('approved');
    expect(data.timesheet.approvedAt).toBe('2026-01-24T12:00:00.000Z');
    expect(data.invoice).not.toBeNull();
    expect(data.invoice.invoiceNumber).toBe('1001');
    expect(data.invoice.amount).toBe(4000);
    expect(data.invoiceError).toBeNull();
    expect(data.invoiceEmailError).toBeNull();
    expect(mockUpdateTimesheet).toHaveBeenCalledWith(timesheetId, {
      status: 'approved',
      approvedAt: expect.any(Date),
    });
    expect(mockGenerateInvoice).toHaveBeenCalledWith({
      invoiceNumber: '1001',
      month: '2026-01',
      totalHours: 40,
      client: { id: clientId, name: 'Test Client' },
    });
    expect(mockCreateInvoice).toHaveBeenCalledWith({
      clientId,
      timesheetId,
      invoiceNumber: '1001',
      month: '2026-01',
      amount: 4000,
      status: 'draft',
      pdfUrl: 'https://blob.storage/invoices/client-123/1001.pdf',
      sentAt: null,
      paidAt: null,
    });
  });

  it('successfully approves a sent timesheet', async () => {
    const timesheet = {
      id: timesheetId,
      clientId,
      month: '2026-01',
      status: 'sent',
      totalHours: 40,
      invoiceNumber: 1001,
    };
    const updatedTimesheet = { ...timesheet, status: 'approved', approvedAt: new Date() };

    mockVerifyPortalToken.mockReturnValue({ clientId, exp: Date.now() / 1000 + 3600 });
    mockGetTimesheetById.mockResolvedValue(timesheet);
    mockUpdateTimesheet.mockResolvedValue(updatedTimesheet);

    const response = await POST(
      new Request('http://localhost'),
      createParams('valid-token', timesheetId)
    );

    expect(response.status).toBe(200);
  });

  it('returns 401 for expired token', async () => {
    mockVerifyPortalToken.mockImplementation(() => {
      throw new Error('jwt expired');
    });

    const response = await POST(
      new Request('http://localhost'),
      createParams('expired-token', timesheetId)
    );
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Token expired');
    expect(data.expired).toBe(true);
  });

  it('returns 401 for invalid token', async () => {
    mockVerifyPortalToken.mockImplementation(() => {
      throw new Error('invalid signature');
    });

    const response = await POST(
      new Request('http://localhost'),
      createParams('invalid-token', timesheetId)
    );
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Invalid token');
  });

  it('returns 404 when timesheet not found', async () => {
    mockVerifyPortalToken.mockReturnValue({ clientId, exp: Date.now() / 1000 + 3600 });
    mockGetTimesheetById.mockResolvedValue(null);

    const response = await POST(
      new Request('http://localhost'),
      createParams('valid-token', 'nonexistent')
    );
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Timesheet not found');
  });

  it('returns 403 when timesheet belongs to different client', async () => {
    const timesheet = {
      id: timesheetId,
      clientId: 'different-client',
      month: '2026-01',
      status: 'pending',
    };

    mockVerifyPortalToken.mockReturnValue({ clientId, exp: Date.now() / 1000 + 3600 });
    mockGetTimesheetById.mockResolvedValue(timesheet);

    const response = await POST(
      new Request('http://localhost'),
      createParams('valid-token', timesheetId)
    );
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Not authorized to approve this timesheet');
  });

  it('returns 400 when timesheet is already approved', async () => {
    const timesheet = {
      id: timesheetId,
      clientId,
      month: '2026-01',
      status: 'approved',
      approvedAt: new Date('2026-01-20'),
    };

    mockVerifyPortalToken.mockReturnValue({ clientId, exp: Date.now() / 1000 + 3600 });
    mockGetTimesheetById.mockResolvedValue(timesheet);

    const response = await POST(
      new Request('http://localhost'),
      createParams('valid-token', timesheetId)
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Timesheet is already approved');
  });

  it('returns 400 when trying to approve a rejected timesheet', async () => {
    const timesheet = {
      id: timesheetId,
      clientId,
      month: '2026-01',
      status: 'rejected',
    };

    mockVerifyPortalToken.mockReturnValue({ clientId, exp: Date.now() / 1000 + 3600 });
    mockGetTimesheetById.mockResolvedValue(timesheet);

    const response = await POST(
      new Request('http://localhost'),
      createParams('valid-token', timesheetId)
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Cannot approve a rejected timesheet');
  });

  describe('invoice generation', () => {
    it('returns invoiceError when timesheet has no invoice number', async () => {
      const timesheet = {
        id: timesheetId,
        clientId,
        month: '2026-01',
        status: 'pending',
        totalHours: 40,
        invoiceNumber: null,
      };
      const updatedTimesheet = { ...timesheet, status: 'approved', approvedAt: new Date() };

      mockVerifyPortalToken.mockReturnValue({ clientId, exp: Date.now() / 1000 + 3600 });
      mockGetTimesheetById.mockResolvedValue(timesheet);
      mockUpdateTimesheet.mockResolvedValue(updatedTimesheet);

      const response = await POST(
        new Request('http://localhost'),
        createParams('valid-token', timesheetId)
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.timesheet.status).toBe('approved');
      expect(data.invoice).toBeNull();
      expect(data.invoiceError).toBe('Timesheet does not have an invoice number');
    });

    it('returns invoiceError when client not found', async () => {
      const timesheet = {
        id: timesheetId,
        clientId,
        month: '2026-01',
        status: 'pending',
        totalHours: 40,
        invoiceNumber: 1001,
      };
      const updatedTimesheet = { ...timesheet, status: 'approved', approvedAt: new Date() };

      mockVerifyPortalToken.mockReturnValue({ clientId, exp: Date.now() / 1000 + 3600 });
      mockGetTimesheetById.mockResolvedValue(timesheet);
      mockUpdateTimesheet.mockResolvedValue(updatedTimesheet);
      mockGetClientById.mockResolvedValue(null);

      const response = await POST(
        new Request('http://localhost'),
        createParams('valid-token', timesheetId)
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.timesheet.status).toBe('approved');
      expect(data.invoice).toBeNull();
      expect(data.invoiceError).toBe('Client not found');
    });

    it('returns invoiceError when invoice generation fails', async () => {
      const timesheet = {
        id: timesheetId,
        clientId,
        month: '2026-01',
        status: 'pending',
        totalHours: 40,
        invoiceNumber: 1001,
      };
      const updatedTimesheet = { ...timesheet, status: 'approved', approvedAt: new Date() };

      mockVerifyPortalToken.mockReturnValue({ clientId, exp: Date.now() / 1000 + 3600 });
      mockGetTimesheetById.mockResolvedValue(timesheet);
      mockUpdateTimesheet.mockResolvedValue(updatedTimesheet);
      mockGenerateInvoice.mockRejectedValue(new Error('Hourly rate not configured'));

      const response = await POST(
        new Request('http://localhost'),
        createParams('valid-token', timesheetId)
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.timesheet.status).toBe('approved');
      expect(data.invoice).toBeNull();
      expect(data.invoiceError).toBe('Hourly rate not configured');
    });

    it('updates invoice status to sent and sets sentAt after successful email', async () => {
      const timesheet = {
        id: timesheetId,
        clientId,
        month: '2026-01',
        status: 'pending',
        totalHours: 40,
        invoiceNumber: 1001,
      };
      const updatedTimesheet = { ...timesheet, status: 'approved', approvedAt: new Date() };

      mockVerifyPortalToken.mockReturnValue({ clientId, exp: Date.now() / 1000 + 3600 });
      mockGetTimesheetById.mockResolvedValue(timesheet);
      mockUpdateTimesheet.mockResolvedValue(updatedTimesheet);

      const response = await POST(
        new Request('http://localhost'),
        createParams('valid-token', timesheetId)
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.invoiceEmailError).toBeNull();
      expect(mockUpdateInvoice).toHaveBeenCalledWith('invoice-789', {
        status: 'sent',
        sentAt: expect.any(Date),
      });
    });

    it('returns invoiceError when database insert fails', async () => {
      const timesheet = {
        id: timesheetId,
        clientId,
        month: '2026-01',
        status: 'pending',
        totalHours: 40,
        invoiceNumber: 1001,
      };
      const updatedTimesheet = { ...timesheet, status: 'approved', approvedAt: new Date() };

      mockVerifyPortalToken.mockReturnValue({ clientId, exp: Date.now() / 1000 + 3600 });
      mockGetTimesheetById.mockResolvedValue(timesheet);
      mockUpdateTimesheet.mockResolvedValue(updatedTimesheet);
      mockCreateInvoice.mockRejectedValue(new Error('Database connection failed'));

      const response = await POST(
        new Request('http://localhost'),
        createParams('valid-token', timesheetId)
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.timesheet.status).toBe('approved');
      expect(data.invoice).toBeNull();
      expect(data.invoiceError).toBe('Database connection failed');
    });
  });

  describe('invoice email sending', () => {
    const baseTimesheet = {
      id: timesheetId,
      clientId,
      month: '2026-01',
      status: 'pending',
      totalHours: 40,
      invoiceNumber: 1001,
    };
    const updatedTimesheet = { ...baseTimesheet, status: 'approved', approvedAt: new Date() };

    beforeEach(() => {
      mockVerifyPortalToken.mockReturnValue({ clientId, exp: Date.now() / 1000 + 3600 });
      mockGetTimesheetById.mockResolvedValue(baseTimesheet);
      mockUpdateTimesheet.mockResolvedValue(updatedTimesheet);
    });

    it('sets invoiceEmailError and does not update invoice when email fails', async () => {
      mockSendInvoiceEmail.mockResolvedValue({ status: 'failed', error: 'SMTP timeout' });

      const response = await POST(
        new Request('http://localhost'),
        createParams('valid-token', timesheetId)
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.invoiceEmailError).toBe('SMTP timeout');
      expect(mockUpdateInvoice).not.toHaveBeenCalled();
    });

    it('sets invoiceEmailError to null when email is skipped (no billing contact)', async () => {
      mockSendInvoiceEmail.mockResolvedValue({
        status: 'skipped',
        error: 'No primary billing contact configured',
      });

      const response = await POST(
        new Request('http://localhost'),
        createParams('valid-token', timesheetId)
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.invoiceEmailError).toBeNull();
      expect(mockUpdateInvoice).not.toHaveBeenCalled();
    });

    it('does not attempt email when invoice creation fails', async () => {
      mockCreateInvoice.mockRejectedValue(new Error('DB error'));

      const response = await POST(
        new Request('http://localhost'),
        createParams('valid-token', timesheetId)
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.invoiceError).toBe('DB error');
      expect(mockSendInvoiceEmail).not.toHaveBeenCalled();
    });
  });
});
