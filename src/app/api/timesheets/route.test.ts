import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  createClient,
  createTimesheet,
  getClientById,
  getTimesheetByClientAndMonth,
} from '@/lib/db'

// Create hoisted mock functions so they're available when vi.mock runs
const {
  mockFetchTimeEntries,
  mockFetchTimesheetPdf,
  mockUploadPdf,
  mockDeletePdf,
  mockGetTimesheetBlobPath,
  mockSignPortalToken,
  mockUpdateClientPortalToken,
  mockGetAndIncrementNextInvoiceNumber,
} = vi.hoisted(() => ({
  mockFetchTimeEntries: vi.fn(),
  mockFetchTimesheetPdf: vi.fn(),
  mockUploadPdf: vi.fn(),
  mockDeletePdf: vi.fn(),
  mockGetTimesheetBlobPath: vi.fn(),
  mockSignPortalToken: vi.fn(),
  mockUpdateClientPortalToken: vi.fn(),
  mockGetAndIncrementNextInvoiceNumber: vi.fn(),
}))

// Mock the Toggl client module (use relative path for proper resolution)
vi.mock('../../../lib/toggl/client', () => ({
  fetchTimeEntries: mockFetchTimeEntries,
  fetchTimesheetPdf: mockFetchTimesheetPdf,
}))

// Mock the blob client module
vi.mock('../../../lib/blob/client', () => ({
  uploadPdf: mockUploadPdf,
  deletePdf: mockDeletePdf,
  getTimesheetBlobPath: mockGetTimesheetBlobPath,
}))

// Mock the JWT module
vi.mock('../../../lib/auth/jwt', () => ({
  signPortalToken: mockSignPortalToken,
}))

// Mock the settings module for invoice number generation
vi.mock('../../../lib/settings', () => ({
  getAndIncrementNextInvoiceNumber: mockGetAndIncrementNextInvoiceNumber,
}))

// Mock updateClientPortalToken from db
vi.mock('../../../lib/db', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/db')>()
  return {
    ...actual,
    updateClientPortalToken: mockUpdateClientPortalToken,
  }
})

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
      invoiceNumber: null,
      sentAt: null,
      approvedAt: null,
    })

    await createTimesheet({
      clientId: client.id,
      month: '2024-02',
      status: 'approved',
      pdfUrl: '/path/to/pdf',
      totalHours: 35,
      invoiceNumber: null,
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

    // Default mock implementations
    mockGetTimesheetBlobPath.mockImplementation(
      (clientId: string, month: string) => `timesheets/${clientId}/${month}.pdf`
    )
    mockUploadPdf.mockResolvedValue({
      url: 'https://storage.blob.core.windows.net/timesheets/test.pdf',
      blobName: 'timesheets/test.pdf',
    })
    mockDeletePdf.mockResolvedValue(true)
    mockSignPortalToken.mockReturnValue('mock-jwt-token')
    mockUpdateClientPortalToken.mockResolvedValue(undefined)
    mockGetAndIncrementNextInvoiceNumber.mockResolvedValue(1001)
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
      invoiceNumber: null,
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

  it('stores blob URL as pdfUrl on successful upload', async () => {
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
      entries: [],
    })

    mockFetchTimesheetPdf.mockResolvedValue({
      pdfBuffer: Buffer.from('fake pdf'),
      filename: 'timesheet-2024-01-proj-123.pdf',
    })

    const expectedBlobUrl =
      'https://storage.blob.core.windows.net/timesheets/client-id/2024-01.pdf'
    mockUploadPdf.mockResolvedValue({
      url: expectedBlobUrl,
      blobName: `timesheets/${client.id}/2024-01.pdf`,
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
    expect(data.timesheet.pdfUrl).toBe(expectedBlobUrl)
    expect(mockUploadPdf).toHaveBeenCalledWith(
      Buffer.from('fake pdf'),
      `timesheets/${client.id}/2024-01.pdf`
    )
  })

  it('generates portal token on successful timesheet creation', async () => {
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
      entries: [],
    })

    mockFetchTimesheetPdf.mockResolvedValue({
      pdfBuffer: Buffer.from('fake pdf'),
      filename: 'timesheet-2024-01.pdf',
    })

    const request = new Request('http://localhost/api/timesheets', {
      method: 'POST',
      body: JSON.stringify({
        clientId: client.id,
        month: '2024-01',
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(201)
    expect(mockSignPortalToken).toHaveBeenCalledWith(client.id)
    expect(mockUpdateClientPortalToken).toHaveBeenCalledWith(
      client.id,
      'mock-jwt-token'
    )
  })

  it('replaces existing timesheet when force=true', async () => {
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
    const existingTimesheet = await createTimesheet({
      clientId: client.id,
      month: '2024-01',
      status: 'pending',
      pdfUrl: 'https://storage.blob.core.windows.net/old.pdf',
      totalHours: 40,
      invoiceNumber: 1001,
      sentAt: null,
      approvedAt: null,
    })

    mockFetchTimeEntries.mockResolvedValue({
      totalSeconds: 72000,
      totalHours: 20,
      entries: [],
    })

    mockFetchTimesheetPdf.mockResolvedValue({
      pdfBuffer: Buffer.from('new pdf'),
      filename: 'timesheet-2024-01.pdf',
    })

    const request = new Request('http://localhost/api/timesheets', {
      method: 'POST',
      body: JSON.stringify({
        clientId: client.id,
        month: '2024-01',
        force: true,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.timesheet.totalHours).toBe(20)
    expect(data.timesheet.id).not.toBe(existingTimesheet.id)
    expect(mockDeletePdf).toHaveBeenCalled()
  })

  it('does not replace existing timesheet when force=false', async () => {
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
      invoiceNumber: null,
      sentAt: null,
      approvedAt: null,
    })

    const request = new Request('http://localhost/api/timesheets', {
      method: 'POST',
      body: JSON.stringify({
        clientId: client.id,
        month: '2024-01',
        force: false,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error).toContain('A timesheet already exists')
  })

  it('assigns invoice number on new timesheet creation', async () => {
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

    mockGetAndIncrementNextInvoiceNumber.mockResolvedValue(2001)

    mockFetchTimeEntries.mockResolvedValue({
      totalSeconds: 144000,
      totalHours: 40,
      entries: [],
    })

    mockFetchTimesheetPdf.mockResolvedValue({
      pdfBuffer: Buffer.from('fake pdf'),
      filename: 'timesheet-2024-03.pdf',
    })

    const request = new Request('http://localhost/api/timesheets', {
      method: 'POST',
      body: JSON.stringify({
        clientId: client.id,
        month: '2024-03',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.timesheet.invoiceNumber).toBe(2001)
    expect(mockGetAndIncrementNextInvoiceNumber).toHaveBeenCalledTimes(1)
  })

  it('preserves invoice number when force recreating timesheet', async () => {
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

    // Create existing timesheet with invoice number
    await createTimesheet({
      clientId: client.id,
      month: '2024-04',
      status: 'pending',
      pdfUrl: 'https://storage.blob.core.windows.net/old.pdf',
      totalHours: 40,
      invoiceNumber: 1001,
      sentAt: null,
      approvedAt: null,
    })

    mockFetchTimeEntries.mockResolvedValue({
      totalSeconds: 72000,
      totalHours: 20,
      entries: [],
    })

    mockFetchTimesheetPdf.mockResolvedValue({
      pdfBuffer: Buffer.from('new pdf'),
      filename: 'timesheet-2024-04.pdf',
    })

    const request = new Request('http://localhost/api/timesheets', {
      method: 'POST',
      body: JSON.stringify({
        clientId: client.id,
        month: '2024-04',
        force: true,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    // Should preserve the original invoice number
    expect(data.timesheet.invoiceNumber).toBe(1001)
    // Should NOT call getAndIncrementNextInvoiceNumber when preserving
    expect(mockGetAndIncrementNextInvoiceNumber).not.toHaveBeenCalled()
  })

  it('gets new invoice number when force recreating timesheet without existing number', async () => {
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

    // Create existing timesheet WITHOUT invoice number (legacy data)
    await createTimesheet({
      clientId: client.id,
      month: '2024-05',
      status: 'pending',
      pdfUrl: 'https://storage.blob.core.windows.net/old.pdf',
      totalHours: 40,
      invoiceNumber: null,
      sentAt: null,
      approvedAt: null,
    })

    mockGetAndIncrementNextInvoiceNumber.mockResolvedValue(3001)

    mockFetchTimeEntries.mockResolvedValue({
      totalSeconds: 72000,
      totalHours: 20,
      entries: [],
    })

    mockFetchTimesheetPdf.mockResolvedValue({
      pdfBuffer: Buffer.from('new pdf'),
      filename: 'timesheet-2024-05.pdf',
    })

    const request = new Request('http://localhost/api/timesheets', {
      method: 'POST',
      body: JSON.stringify({
        clientId: client.id,
        month: '2024-05',
        force: true,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    // Should get a new invoice number since existing had null
    expect(data.timesheet.invoiceNumber).toBe(3001)
    expect(mockGetAndIncrementNextInvoiceNumber).toHaveBeenCalledTimes(1)
  })
})
