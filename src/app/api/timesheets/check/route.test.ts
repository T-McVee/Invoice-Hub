import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { createClient, createTimesheet } from '@/lib/db'
import { GET } from './route'

function createRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost'))
}

describe('GET /api/timesheets/check', () => {
  it('returns exists=false when no timesheet exists', async () => {
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

    const request = createRequest(
      `http://localhost/api/timesheets/check?clientId=${client.id}&month=2024-01`
    )

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.exists).toBe(false)
    expect(data.timesheet).toBeNull()
  })

  it('returns exists=true with timesheet info when one exists', async () => {
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

    const timesheet = await createTimesheet({
      clientId: client.id,
      month: '2024-01',
      status: 'pending',
      pdfUrl: null,
      totalHours: 40,
      sentAt: null,
      approvedAt: null,
    })

    const request = createRequest(
      `http://localhost/api/timesheets/check?clientId=${client.id}&month=2024-01`
    )

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.exists).toBe(true)
    expect(data.timesheet).toEqual({
      id: timesheet.id,
      status: 'pending',
      totalHours: 40,
      createdAt: timesheet.createdAt.toISOString(),
    })
  })

  it('rejects missing clientId', async () => {
    const request = createRequest(
      'http://localhost/api/timesheets/check?month=2024-01'
    )

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('clientId and month query parameters are required')
  })

  it('rejects missing month', async () => {
    const request = createRequest(
      'http://localhost/api/timesheets/check?clientId=test-id'
    )

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('clientId and month query parameters are required')
  })

  it('rejects invalid month format', async () => {
    const request = createRequest(
      'http://localhost/api/timesheets/check?clientId=test-id&month=2024-1'
    )

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('month must be in YYYY-MM format')
  })

  it('returns 404 for non-existent client', async () => {
    const request = createRequest(
      'http://localhost/api/timesheets/check?clientId=non-existent&month=2024-01'
    )

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Client not found')
  })
})
