import { describe, it, expect } from 'vitest'
import { GET, PATCH, DELETE } from './route'
import { createClient, createTimesheet } from '@/lib/db'

// Helper to create route params
function createParams(id: string) {
  return { params: Promise.resolve({ id }) }
}

describe('GET /api/clients/[id]', () => {
  it('returns client when found', async () => {
    const client = await createClient({
      name: 'Test Client',
      togglClientId: null,
      togglProjectId: null,
      timesheetRecipients: [],
      invoiceRecipients: [],
      notes: null,
      portalToken: null,
      contacts: [],
    })

    const request = new Request(`http://localhost/api/clients/${client.id}`)
    const response = await GET(request, createParams(client.id))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.client.name).toBe('Test Client')
    expect(data.client.id).toBe(client.id)
  })

  it('returns 404 when client not found', async () => {
    const request = new Request('http://localhost/api/clients/non-existent')
    const response = await GET(request, createParams('non-existent'))
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Client not found')
  })
})

describe('PATCH /api/clients/[id]', () => {
  it('updates client name', async () => {
    const client = await createClient({
      name: 'Original Name',
      togglClientId: null,
      togglProjectId: null,
      timesheetRecipients: [],
      invoiceRecipients: [],
      notes: null,
      portalToken: null,
      contacts: [],
    })

    const request = new Request(`http://localhost/api/clients/${client.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Updated Name' }),
    })

    const response = await PATCH(request, createParams(client.id))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.client.name).toBe('Updated Name')
  })

  it('updates multiple fields', async () => {
    const client = await createClient({
      name: 'Original',
      togglClientId: null,
      togglProjectId: null,
      timesheetRecipients: [],
      invoiceRecipients: [],
      notes: null,
      portalToken: null,
      contacts: [],
    })

    const request = new Request(`http://localhost/api/clients/${client.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        togglProjectId: 'proj-123',
        timesheetRecipients: ['new@example.com'],
        notes: 'New notes',
      }),
    })

    const response = await PATCH(request, createParams(client.id))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.client.togglProjectId).toBe('proj-123')
    expect(data.client.timesheetRecipients).toEqual(['new@example.com'])
    expect(data.client.notes).toBe('New notes')
  })

  it('returns 404 when client not found', async () => {
    const request = new Request('http://localhost/api/clients/non-existent', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'New Name' }),
    })

    const response = await PATCH(request, createParams('non-existent'))
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Client not found')
  })

  it('rejects empty name', async () => {
    const client = await createClient({
      name: 'Original',
      togglClientId: null,
      togglProjectId: null,
      timesheetRecipients: [],
      invoiceRecipients: [],
      notes: null,
      portalToken: null,
      contacts: [],
    })

    const request = new Request(`http://localhost/api/clients/${client.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name: '' }),
    })

    const response = await PATCH(request, createParams(client.id))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Client name cannot be empty')
  })

  it('rejects invalid email addresses', async () => {
    const client = await createClient({
      name: 'Test',
      togglClientId: null,
      togglProjectId: null,
      timesheetRecipients: [],
      invoiceRecipients: [],
      notes: null,
      portalToken: null,
      contacts: [],
    })

    const request = new Request(`http://localhost/api/clients/${client.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        invoiceRecipients: ['bad-email'],
      }),
    })

    const response = await PATCH(request, createParams(client.id))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid email address(es) provided')
    expect(data.invalidEmails).toContain('bad-email')
  })

  it('clears togglProjectId when set to empty string', async () => {
    const client = await createClient({
      name: 'Test',
      togglClientId: null,
      togglProjectId: 'proj-123',
      timesheetRecipients: [],
      invoiceRecipients: [],
      notes: null,
      portalToken: null,
      contacts: [],
    })

    const request = new Request(`http://localhost/api/clients/${client.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ togglProjectId: '' }),
    })

    const response = await PATCH(request, createParams(client.id))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.client.togglProjectId).toBeNull()
  })
})

describe('DELETE /api/clients/[id]', () => {
  it('deletes client successfully', async () => {
    const client = await createClient({
      name: 'To Delete',
      togglClientId: null,
      togglProjectId: null,
      timesheetRecipients: [],
      invoiceRecipients: [],
      notes: null,
      portalToken: null,
      contacts: [],
    })

    const request = new Request(`http://localhost/api/clients/${client.id}`, {
      method: 'DELETE',
    })

    const response = await DELETE(request, createParams(client.id))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it('returns 404 when client not found', async () => {
    const request = new Request('http://localhost/api/clients/non-existent', {
      method: 'DELETE',
    })

    const response = await DELETE(request, createParams('non-existent'))
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Client not found')
  })

  it('prevents deletion of client with timesheets', async () => {
    const client = await createClient({
      name: 'Has Timesheets',
      togglClientId: null,
      togglProjectId: 'proj-123',
      timesheetRecipients: [],
      invoiceRecipients: [],
      notes: null,
      portalToken: null,
      contacts: [],
    })

    // Create a timesheet for this client
    await createTimesheet({
      clientId: client.id,
      month: '2024-01',
      status: 'pending',
      pdfUrl: null,
      totalHours: 10,
      sentAt: null,
      approvedAt: null,
    })

    const request = new Request(`http://localhost/api/clients/${client.id}`, {
      method: 'DELETE',
    })

    const response = await DELETE(request, createParams(client.id))
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error).toBe('Cannot delete client with existing timesheets or invoices')
  })
})
