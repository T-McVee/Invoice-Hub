import { describe, it, expect, beforeEach } from 'vitest'
import { GET, PUT } from './route'
import { setHourlyRate } from '@/lib/settings'

describe('GET /api/settings/hourly-rate', () => {
  it('returns current hourly rate', async () => {
    // Set a known rate first
    setHourlyRate(125)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.rate).toBe(125)
    expect(data.updatedAt).toBeDefined()
  })
})

describe('PUT /api/settings/hourly-rate', () => {
  it('updates hourly rate with valid value', async () => {
    const request = new Request('http://localhost/api/settings/hourly-rate', {
      method: 'PUT',
      body: JSON.stringify({ rate: 150 }),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.rate).toBe(150)
    expect(data.updatedAt).toBeDefined()
  })

  it('accepts zero as valid rate', async () => {
    const request = new Request('http://localhost/api/settings/hourly-rate', {
      method: 'PUT',
      body: JSON.stringify({ rate: 0 }),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.rate).toBe(0)
  })

  it('accepts decimal rates', async () => {
    const request = new Request('http://localhost/api/settings/hourly-rate', {
      method: 'PUT',
      body: JSON.stringify({ rate: 125.50 }),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.rate).toBe(125.50)
  })

  it('rejects negative rate', async () => {
    const request = new Request('http://localhost/api/settings/hourly-rate', {
      method: 'PUT',
      body: JSON.stringify({ rate: -10 }),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid hourly rate')
  })

  it('rejects non-numeric rate', async () => {
    const request = new Request('http://localhost/api/settings/hourly-rate', {
      method: 'PUT',
      body: JSON.stringify({ rate: 'not a number' }),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid hourly rate')
  })

  it('rejects missing rate', async () => {
    const request = new Request('http://localhost/api/settings/hourly-rate', {
      method: 'PUT',
      body: JSON.stringify({}),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid hourly rate')
  })
})
