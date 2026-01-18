import { describe, it, expect } from 'vitest'
import { GET, POST } from './route'
import { createClient } from '@/lib/db'

describe('GET /api/clients', () => {

  it('returns empty array when no clients exist', async () => {
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.clients).toEqual([])
  })

  it('returns all clients', async () => {
    await createClient({
      name: 'Client A',
      togglClientId: null,
      togglProjectId: null,
      timesheetRecipients: [],
      invoiceRecipients: [],
      notes: null,
      contacts: [],
    })
    await createClient({
      name: 'Client B',
      togglClientId: null,
      togglProjectId: null,
      timesheetRecipients: [],
      invoiceRecipients: [],
      notes: null,
      contacts: [],
    })

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.clients).toHaveLength(2)
  })
})

describe('POST /api/clients', () => {
  it('creates a client with valid data', async () => {
    const request = new Request('http://localhost/api/clients', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test Client' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.client.name).toBe('Test Client')
    expect(data.client.id).toBeDefined()
  })

  it('creates a client with all optional fields', async () => {
    const request = new Request('http://localhost/api/clients', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Full Client',
        togglClientId: 'toggl-123',
        togglProjectId: 'project-456',
        timesheetRecipients: ['timesheet@example.com'],
        invoiceRecipients: ['invoice@example.com'],
        notes: 'Some notes',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.client.togglClientId).toBe('toggl-123')
    expect(data.client.togglProjectId).toBe('project-456')
    expect(data.client.timesheetRecipients).toEqual(['timesheet@example.com'])
    expect(data.client.invoiceRecipients).toEqual(['invoice@example.com'])
    expect(data.client.notes).toBe('Some notes')
  })

  it('rejects request without name', async () => {
    const request = new Request('http://localhost/api/clients', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Client name is required')
  })

  it('rejects empty name', async () => {
    const request = new Request('http://localhost/api/clients', {
      method: 'POST',
      body: JSON.stringify({ name: '   ' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Client name is required')
  })

  it('rejects invalid email addresses', async () => {
    const request = new Request('http://localhost/api/clients', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Client',
        timesheetRecipients: ['not-an-email', 'valid@example.com'],
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid email address(es) provided')
    expect(data.invalidEmails).toContain('not-an-email')
  })

  it('rejects duplicate Toggl client ID', async () => {
    await createClient({
      name: 'Existing Client',
      togglClientId: 'toggl-123',
      togglProjectId: null,
      timesheetRecipients: [],
      invoiceRecipients: [],
      notes: null,
      contacts: [],
    })

    const request = new Request('http://localhost/api/clients', {
      method: 'POST',
      body: JSON.stringify({
        name: 'New Client',
        togglClientId: 'toggl-123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error).toBe('A client with this Toggl client ID already exists')
  })

  it('trims whitespace from name', async () => {
    const request = new Request('http://localhost/api/clients', {
      method: 'POST',
      body: JSON.stringify({ name: '  Trimmed Name  ' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.client.name).toBe('Trimmed Name')
  })
})
