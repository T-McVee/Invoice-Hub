import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Create hoisted mock functions
const { mockVerifyPortalToken, mockGetTimesheetById, mockDownloadPdf, mockGetTimesheetBlobPath } = vi.hoisted(() => ({
  mockVerifyPortalToken: vi.fn(),
  mockGetTimesheetById: vi.fn(),
  mockDownloadPdf: vi.fn(),
  mockGetTimesheetBlobPath: vi.fn(),
}));

// Mock using relative paths (7 levels up from pdf/ to src/)
vi.mock('../../../../../../../lib/auth/jwt', () => ({
  verifyPortalToken: mockVerifyPortalToken,
}));

vi.mock('../../../../../../../lib/db', () => ({
  getTimesheetById: mockGetTimesheetById,
}));

vi.mock('../../../../../../../lib/blob/client', () => ({
  downloadPdf: mockDownloadPdf,
  getTimesheetBlobPath: mockGetTimesheetBlobPath,
}));

// Import route after mocks are set up
import { GET } from './route';

function createParams(token: string, id: string) {
  return { params: Promise.resolve({ token, id }) };
}

describe('GET /api/portal/[token]/timesheets/[id]/pdf', () => {
  const clientId = 'client-123';
  const timesheetId = 'ts-456';
  const pdfBuffer = Buffer.from('fake-pdf-content');

  beforeEach(() => {
    vi.stubEnv('JWT_SECRET', 'test-secret-key-for-jwt-signing');
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('successfully returns PDF for valid token and owned timesheet', async () => {
    const timesheet = {
      id: timesheetId,
      clientId,
      month: '2026-01',
      status: 'sent',
      totalHours: 40,
      pdfUrl: 'https://blob.storage/timesheets/client-123/2026-01.pdf',
    };

    mockVerifyPortalToken.mockReturnValue({ clientId, exp: Date.now() / 1000 + 3600 });
    mockGetTimesheetById.mockResolvedValue(timesheet);
    mockGetTimesheetBlobPath.mockReturnValue('timesheets/client-123/2026-01.pdf');
    mockDownloadPdf.mockResolvedValue(pdfBuffer);

    const response = await GET(new Request('http://localhost'), createParams('valid-token', timesheetId));

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/pdf');
    expect(response.headers.get('Content-Disposition')).toBe('inline; filename="2026-01.pdf"');
    expect(response.headers.get('Content-Length')).toBe(pdfBuffer.length.toString());

    const body = await response.arrayBuffer();
    expect(Buffer.from(body)).toEqual(pdfBuffer);
  });

  it('returns 401 for expired token', async () => {
    mockVerifyPortalToken.mockImplementation(() => {
      throw new Error('jwt expired');
    });

    const response = await GET(new Request('http://localhost'), createParams('expired-token', timesheetId));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Token expired');
    expect(data.expired).toBe(true);
  });

  it('returns 401 for invalid token', async () => {
    mockVerifyPortalToken.mockImplementation(() => {
      throw new Error('invalid signature');
    });

    const response = await GET(new Request('http://localhost'), createParams('invalid-token', timesheetId));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Invalid token');
  });

  it('returns 401 for malformed token', async () => {
    mockVerifyPortalToken.mockImplementation(() => {
      throw new Error('jwt malformed');
    });

    const response = await GET(new Request('http://localhost'), createParams('malformed-token', timesheetId));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Invalid token');
  });

  it('returns 404 when timesheet not found', async () => {
    mockVerifyPortalToken.mockReturnValue({ clientId, exp: Date.now() / 1000 + 3600 });
    mockGetTimesheetById.mockResolvedValue(null);

    const response = await GET(new Request('http://localhost'), createParams('valid-token', 'nonexistent'));
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Timesheet not found');
  });

  it('returns 403 when timesheet belongs to different client', async () => {
    const timesheet = {
      id: timesheetId,
      clientId: 'different-client',
      month: '2026-01',
      status: 'sent',
      pdfUrl: 'https://blob.storage/timesheets/different-client/2026-01.pdf',
    };

    mockVerifyPortalToken.mockReturnValue({ clientId, exp: Date.now() / 1000 + 3600 });
    mockGetTimesheetById.mockResolvedValue(timesheet);

    const response = await GET(new Request('http://localhost'), createParams('valid-token', timesheetId));
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Not authorized to access this timesheet');
  });

  it('returns 404 when timesheet has no PDF', async () => {
    const timesheet = {
      id: timesheetId,
      clientId,
      month: '2026-01',
      status: 'pending',
      totalHours: 40,
      pdfUrl: null,
    };

    mockVerifyPortalToken.mockReturnValue({ clientId, exp: Date.now() / 1000 + 3600 });
    mockGetTimesheetById.mockResolvedValue(timesheet);

    const response = await GET(new Request('http://localhost'), createParams('valid-token', timesheetId));
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('No PDF available for this timesheet');
  });

  it('returns 500 when blob download fails', async () => {
    const timesheet = {
      id: timesheetId,
      clientId,
      month: '2026-01',
      status: 'sent',
      pdfUrl: 'https://blob.storage/timesheets/client-123/2026-01.pdf',
    };

    mockVerifyPortalToken.mockReturnValue({ clientId, exp: Date.now() / 1000 + 3600 });
    mockGetTimesheetById.mockResolvedValue(timesheet);
    mockGetTimesheetBlobPath.mockReturnValue('timesheets/client-123/2026-01.pdf');
    mockDownloadPdf.mockRejectedValue(new Error('Blob storage error'));

    const response = await GET(new Request('http://localhost'), createParams('valid-token', timesheetId));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to retrieve PDF');
  });
});
