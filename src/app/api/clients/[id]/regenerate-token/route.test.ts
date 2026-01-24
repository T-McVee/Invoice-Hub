import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from './route';
import { createClient, getClientById } from '@/lib/db';

// Helper to create route params
function createParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe('POST /api/clients/[id]/regenerate-token', () => {
  beforeEach(() => {
    vi.stubEnv('JWT_SECRET', 'test-secret-key-for-jwt-signing');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('generates a new portal token for existing client', async () => {
    const client = await createClient({
      name: 'Test Client',
      togglClientId: null,
      togglProjectId: null,
      timesheetRecipients: [],
      invoiceRecipients: [],
      notes: null,
      portalToken: null,
      contacts: [],
    });

    const request = new Request(
      `http://localhost/api/clients/${client.id}/regenerate-token`,
      { method: 'POST' }
    );

    const response = await POST(request, createParams(client.id));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.token).toBeDefined();
    expect(typeof data.token).toBe('string');
    expect(data.expiresAt).toBeDefined();

    // Verify the token was saved to the client
    const updatedClient = await getClientById(client.id);
    expect(updatedClient?.portalToken).toBe(data.token);
  });

  it('returns 404 when client not found', async () => {
    const request = new Request(
      'http://localhost/api/clients/non-existent/regenerate-token',
      { method: 'POST' }
    );

    const response = await POST(request, createParams('non-existent'));
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Client not found');
  });

  it('regenerating token updates the client record', async () => {
    const client = await createClient({
      name: 'Test Client',
      togglClientId: null,
      togglProjectId: null,
      timesheetRecipients: [],
      invoiceRecipients: [],
      notes: null,
      portalToken: null,
      contacts: [],
    });

    // Client should have no token initially (may be null or undefined)
    expect(client.portalToken).toBeFalsy();

    // Generate token
    const request = new Request(
      `http://localhost/api/clients/${client.id}/regenerate-token`,
      { method: 'POST' }
    );
    const response = await POST(request, createParams(client.id));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.token).toBeDefined();

    // Client should have the new token saved
    const updatedClient = await getClientById(client.id);
    expect(updatedClient?.portalToken).toBe(data.token);
    expect(updatedClient?.portalToken).not.toBeNull();
  });

  it('returns valid expiry date', async () => {
    const client = await createClient({
      name: 'Test Client',
      togglClientId: null,
      togglProjectId: null,
      timesheetRecipients: [],
      invoiceRecipients: [],
      notes: null,
      portalToken: null,
      contacts: [],
    });

    const request = new Request(
      `http://localhost/api/clients/${client.id}/regenerate-token`,
      { method: 'POST' }
    );

    const response = await POST(request, createParams(client.id));
    const data = await response.json();

    expect(response.status).toBe(200);

    // Expiry should be approximately 45 days from now
    const expiresAt = new Date(data.expiresAt);
    const now = new Date();
    const daysUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    expect(daysUntilExpiry).toBeGreaterThan(44);
    expect(daysUntilExpiry).toBeLessThan(46);
  });
});
