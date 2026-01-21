import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createClient, createTimesheet } from '@/lib/db'

// Create hoisted mock functions so they're available when vi.mock runs
const { mockFetchTimeEntries, mockFetchTimesheetPdf } = vi.hoisted(() => ({
  mockFetchTimeEntries: vi.fn(),
  mockFetchTimesheetPdf: vi.fn(),
}))

// Mock the Toggl client module (use relative path for proper resolution)
vi.mock('../../../lib/toggl/client', () => ({
  fetchTimeEntries: mockFetchTimeEntries,
  fetchTimesheetPdf: mockFetchTimesheetPdf,
}))

// Import route after mocks are set up
import { GET, POST } from './route'

describe('GET /api/timesheets', () => {
  it('returns empty array when no timesheets exist', async () => {
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.timesheets).toEqual([])
  })

  it('returns all timesheets', async () => {
    const client = await createClient({
      name: 'Test Client',
      togglClientId: null,
      togglProjectId: 'proj-123',
      timesheetRecipients: [],
      invoiceRecipients: [],
      notes: null,
      portalToken: null,
      contacts: [],
    })

    await createTimesheet({
      clientId: client.id,
      month: '2024-01',
      status: 'pending',
      pdfUrl: null,
      totalHours: 40,
      sentAt: null,
      approvedAt: null,
    })

    await createTimesheet({
      clientId: client.id,
      month: '2024-02',
      status: 'approved',
      pdfUrl: '/path/to/pdf',
      totalHours: 35,
      sentAt: new Date(),
      approvedAt: new Date(),
    })

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.timesheets).toHaveLength(2)
  })
})

describe('POST /api/timesheets', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates timesheet with valid data', async () => {
    const client = await createClient({
      name: 'Test Client',
      togglClientId: null,
      togglProjectId: 'proj-123',
      timesheetRecipients: [],
      invoiceRecipients: [],
      notes: null,
      portalToken: null,
      contacts: [],
    })

    mockFetchTimeEntries.mockResolvedValue({
      totalSeconds: 144000,
      totalHours: 40,
      entries: [
        { date: '2024-01-15', description: 'Work', durationSeconds: 28800, durationHours: 8 },
      ],
    })

    mockFetchTimesheetPdf.mockResolvedValue({
      pdfBuffer: Buffer.from('fake pdf'),
      filename: 'timesheet-2024-01-proj-123.pdf',
    })

    const request = new Request('http://localhost/api/timesheets', {
      method: 'POST',
      body: JSON.stringify({
        clientId: client.id,
        month: '2024-01',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.timesheet.clientId).toBe(client.id)
    expect(data.timesheet.month).toBe('2024-01')
    expect(data.timesheet.status).toBe('pending')
    expect(data.timesheet.totalHours).toBe(40)
    expect(data.summary.totalHours).toBe(40)
    expect(data.summary.entryCount).toBe(1)
  })

  it('rejects missing clientId', async () => {
    const request = new Request('http://localhost/api/timesheets', {
      method: 'POST',
      body: JSON.stringify({ month: '2024-01' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('clientId and month are required')
  })

  it('rejects missing month', async () => {
    const request = new Request('http://localhost/api/timesheets', {
      method: 'POST',
      body: JSON.stringify({ clientId: 'client-1' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('clientId and month are required')
  })

  it('rejects invalid month format', async () => {
    const request = new Request('http://localhost/api/timesheets', {
      method: 'POST',
      body: JSON.stringify({
        clientId: 'client-1',
        month: '2024-1', // Invalid - should be 2024-01
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('month must be in YYYY-MM format')
  })

  it('returns 404 for non-existent client', async () => {
    const request = new Request('http://localhost/api/timesheets', {
      method: 'POST',
      body: JSON.stringify({
        clientId: 'non-existent',
        month: '2024-01',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Client not found')
  })

  it('rejects client without Toggl project ID', async () => {
    const client = await createClient({
      name: 'No Toggl',
      togglClientId: null,
      togglProjectId: null, // No project ID
      timesheetRecipients: [],
      invoiceRecipients: [],
      notes: null,
      portalToken: null,
      contacts: [],
    })

    const request = new Request('http://localhost/api/timesheets', {
      method: 'POST',
      body: JSON.stringify({
        clientId: client.id,
        month: '2024-01',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Client does not have a Toggl project ID configured')
  })

  it('prevents duplicate timesheet for same client and month', async () => {
    const client = await createClient({
      name: 'Test Client',
      togglClientId: null,
      togglProjectId: 'proj-123',
      timesheetRecipients: [],
      invoiceRecipients: [],
      notes: null,
      portalToken: null,
      contacts: [],
    })

    // Create existing timesheet
    await createTimesheet({
      clientId: client.id,
      month: '2024-01',
      status: 'pending',
      pdfUrl: null,
      totalHours: 40,
      sentAt: null,
      approvedAt: null,
    })

    const request = new Request('http://localhost/api/timesheets', {
      method: 'POST',
      body: JSON.stringify({
        clientId: client.id,
        month: '2024-01',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error).toContain('A timesheet already exists')
    expect(data.existingTimesheetId).toBeDefined()
  })

  it('continues without PDF if PDF fetch fails', async () => {
    const client = await createClient({
      name: 'Test Client',
      togglClientId: null,
      togglProjectId: 'proj-123',
      timesheetRecipients: [],
      invoiceRecipients: [],
      notes: null,
      portalToken: null,
      contacts: [],
    })

    mockFetchTimeEntries.mockResolvedValue({
      totalSeconds: 36000,
      totalHours: 10,
      entries: [],
    })

    mockFetchTimesheetPdf.mockRejectedValue(new Error('PDF generation failed'))

    const request = new Request('http://localhost/api/timesheets', {
      method: 'POST',
      body: JSON.stringify({
        clientId: client.id,
        month: '2024-01',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.timesheet.pdfUrl).toBeNull()
    expect(data.timesheet.totalHours).toBe(10)
  })

  it('handles Toggl API errors gracefully', async () => {
    const client = await createClient({
      name: 'Test Client',
      togglClientId: null,
      togglProjectId: 'proj-123',
      timesheetRecipients: [],
      invoiceRecipients: [],
      notes: null,
      portalToken: null,
      contacts: [],
    })

    mockFetchTimeEntries.mockRejectedValue(
      new Error('TOGGL_API_TOKEN environment variable is not set')
    )

    const request = new Request('http://localhost/api/timesheets', {
      method: 'POST',
      body: JSON.stringify({
        clientId: client.id,
        month: '2024-01',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Toggl API configuration error. Check environment variables.')
  })
})
