import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Create hoisted mock functions
const {
  mockVerifyPortalToken,
  mockGetTimesheetById,
  mockUpdateTimesheet,
  mockGetClientById,
  mockCreateInvoice,
  mockGenerateInvoice,
} = vi.hoisted(() => ({
  mockVerifyPortalToken: vi.fn(),
  mockGetTimesheetById: vi.fn(),
  mockUpdateTimesheet: vi.fn(),
  mockGetClientById: vi.fn(),
  mockCreateInvoice: vi.fn(),
  mockGenerateInvoice: vi.fn(),
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
}));

vi.mock('../../../../../../../lib/invoice-generator', () => ({
  generateInvoice: mockGenerateInvoice,
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

    const response = await POST(new Request('http://localhost'), createParams('valid-token', timesheetId));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.timesheet.status).toBe('approved');
    expect(data.timesheet.approvedAt).toBe('2026-01-24T12:00:00.000Z');
    expect(data.invoice).not.toBeNull();
    expect(data.invoice.invoiceNumber).toBe('1001');
    expect(data.invoice.amount).toBe(4000);
    expect(data.invoiceError).toBeNull();
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

    const response = await POST(new Request('http://localhost'), createParams('valid-token', timesheetId));

    expect(response.status).toBe(200);
  });

  it('returns 401 for expired token', async () => {
    mockVerifyPortalToken.mockImplementation(() => {
      throw new Error('jwt expired');
    });

    const response = await POST(new Request('http://localhost'), createParams('expired-token', timesheetId));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Token expired');
    expect(data.expired).toBe(true);
  });

  it('returns 401 for invalid token', async () => {
    mockVerifyPortalToken.mockImplementation(() => {
      throw new Error('invalid signature');
    });

    const response = await POST(new Request('http://localhost'), createParams('invalid-token', timesheetId));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Invalid token');
  });

  it('returns 404 when timesheet not found', async () => {
    mockVerifyPortalToken.mockReturnValue({ clientId, exp: Date.now() / 1000 + 3600 });
    mockGetTimesheetById.mockResolvedValue(null);

    const response = await POST(new Request('http://localhost'), createParams('valid-token', 'nonexistent'));
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

    const response = await POST(new Request('http://localhost'), createParams('valid-token', timesheetId));
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

    const response = await POST(new Request('http://localhost'), createParams('valid-token', timesheetId));
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

    const response = await POST(new Request('http://localhost'), createParams('valid-token', timesheetId));
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

      const response = await POST(new Request('http://localhost'), createParams('valid-token', timesheetId));
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

      const response = await POST(new Request('http://localhost'), createParams('valid-token', timesheetId));
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

      const response = await POST(new Request('http://localhost'), createParams('valid-token', timesheetId));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.timesheet.status).toBe('approved');
      expect(data.invoice).toBeNull();
      expect(data.invoiceError).toBe('Hourly rate not configured');
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

      const response = await POST(new Request('http://localhost'), createParams('valid-token', timesheetId));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.timesheet.status).toBe('approved');
      expect(data.invoice).toBeNull();
      expect(data.invoiceError).toBe('Database connection failed');
    });
  });
});
