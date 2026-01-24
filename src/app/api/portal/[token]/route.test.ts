import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Create hoisted mock functions
const { mockVerifyPortalToken, mockGetClientById, mockGetTimesheetsByClientId } = vi.hoisted(() => ({
  mockVerifyPortalToken: vi.fn(),
  mockGetClientById: vi.fn(),
  mockGetTimesheetsByClientId: vi.fn(),
}));

// Mock using relative paths
vi.mock('../../../../lib/auth/jwt', () => ({
  verifyPortalToken: mockVerifyPortalToken,
}));

vi.mock('../../../../lib/db', () => ({
  getClientById: mockGetClientById,
  getTimesheetsByClientId: mockGetTimesheetsByClientId,
}));

// Import route after mocks are set up
import { GET } from './route';

function createParams(token: string) {
  return { params: Promise.resolve({ token }) };
}

describe('GET /api/portal/[token]', () => {
  beforeEach(() => {
    vi.stubEnv('JWT_SECRET', 'test-secret-key-for-jwt-signing');
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns client and timesheets for valid token', async () => {
    const clientId = 'client-123';
    const client = { id: clientId, name: 'Test Client' };
    const timesheets = [
      { id: 'ts-1', clientId, month: '2026-01', status: 'pending', totalHours: 40 },
      { id: 'ts-2', clientId, month: '2025-12', status: 'approved', totalHours: 35 },
    ];

    mockVerifyPortalToken.mockReturnValue({ clientId, exp: Date.now() / 1000 + 3600 });
    mockGetClientById.mockResolvedValue(client);
    mockGetTimesheetsByClientId.mockResolvedValue(timesheets);

    const response = await GET(new Request('http://localhost'), createParams('valid-token'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.client).toEqual({ id: clientId, name: 'Test Client' });
    expect(data.timesheets).toEqual(timesheets);
  });

  it('returns 401 with expired flag for expired token', async () => {
    mockVerifyPortalToken.mockImplementation(() => {
      throw new Error('jwt expired');
    });

    const response = await GET(new Request('http://localhost'), createParams('expired-token'));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Token expired');
    expect(data.expired).toBe(true);
  });

  it('returns 401 for invalid token', async () => {
    mockVerifyPortalToken.mockImplementation(() => {
      throw new Error('invalid signature');
    });

    const response = await GET(new Request('http://localhost'), createParams('invalid-token'));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Invalid token');
    expect(data.expired).toBeUndefined();
  });

  it('returns 401 for malformed token', async () => {
    mockVerifyPortalToken.mockImplementation(() => {
      throw new Error('jwt malformed');
    });

    const response = await GET(new Request('http://localhost'), createParams('malformed'));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Invalid token');
  });

  it('returns 404 when client not found', async () => {
    mockVerifyPortalToken.mockReturnValue({ clientId: 'nonexistent', exp: Date.now() / 1000 + 3600 });
    mockGetClientById.mockResolvedValue(null);

    const response = await GET(new Request('http://localhost'), createParams('valid-token'));
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Client not found');
  });

  it('returns empty timesheets array when client has no timesheets', async () => {
    const clientId = 'client-123';
    mockVerifyPortalToken.mockReturnValue({ clientId, exp: Date.now() / 1000 + 3600 });
    mockGetClientById.mockResolvedValue({ id: clientId, name: 'New Client' });
    mockGetTimesheetsByClientId.mockResolvedValue([]);

    const response = await GET(new Request('http://localhost'), createParams('valid-token'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.timesheets).toEqual([]);
  });
});
