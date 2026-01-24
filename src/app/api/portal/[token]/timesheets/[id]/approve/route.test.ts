import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Create hoisted mock functions
const { mockVerifyPortalToken, mockGetTimesheetById, mockUpdateTimesheet } = vi.hoisted(() => ({
  mockVerifyPortalToken: vi.fn(),
  mockGetTimesheetById: vi.fn(),
  mockUpdateTimesheet: vi.fn(),
}));

// Mock using relative paths (7 levels up from approve/ to src/)
vi.mock('../../../../../../../lib/auth/jwt', () => ({
  verifyPortalToken: mockVerifyPortalToken,
}));

vi.mock('../../../../../../../lib/db', () => ({
  getTimesheetById: mockGetTimesheetById,
  updateTimesheet: mockUpdateTimesheet,
}));

// Import route after mocks are set up
import { POST } from './route';

function createParams(token: string, id: string) {
  return { params: Promise.resolve({ token, id }) };
}

describe('POST /api/portal/[token]/timesheets/[id]/approve', () => {
  const clientId = 'client-123';
  const timesheetId = 'ts-456';

  beforeEach(() => {
    vi.stubEnv('JWT_SECRET', 'test-secret-key-for-jwt-signing');
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-24T12:00:00Z'));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it('successfully approves a pending timesheet', async () => {
    const timesheet = {
      id: timesheetId,
      clientId,
      month: '2026-01',
      status: 'pending',
      totalHours: 40,
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
    expect(mockUpdateTimesheet).toHaveBeenCalledWith(timesheetId, {
      status: 'approved',
      approvedAt: expect.any(Date),
    });
  });

  it('successfully approves a sent timesheet', async () => {
    const timesheet = {
      id: timesheetId,
      clientId,
      month: '2026-01',
      status: 'sent',
      totalHours: 40,
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
});
