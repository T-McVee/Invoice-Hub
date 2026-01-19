import { describe, it, expect } from 'vitest'
import { GET, PUT } from './route'
import { setBusinessProfile } from '@/lib/settings'

describe('GET /api/settings/business-profile', () => {
  it('returns current business profile', async () => {
    // Set a known profile first
    await setBusinessProfile({
      name: 'Test Business',
      taxRate: 15,
    })

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.name).toBe('Test Business')
    expect(data.taxRate).toBe(15)
  })

  it('includes all profile fields', async () => {
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('name')
    expect(data).toHaveProperty('businessNumber')
    expect(data).toHaveProperty('gstNumber')
    expect(data).toHaveProperty('phone')
    expect(data).toHaveProperty('email')
    expect(data).toHaveProperty('address')
    expect(data).toHaveProperty('paymentDetails')
    expect(data).toHaveProperty('taxRate')
    expect(data).toHaveProperty('paymentTerms')
    expect(data).toHaveProperty('nextInvoiceNumber')
    expect(data).toHaveProperty('updatedAt')
  })
})

describe('PUT /api/settings/business-profile', () => {
  it('updates single field', async () => {
    const request = new Request('http://localhost/api/settings/business-profile', {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Business Name' }),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.name).toBe('New Business Name')
  })

  it('updates multiple fields', async () => {
    const request = new Request('http://localhost/api/settings/business-profile', {
      method: 'PUT',
      body: JSON.stringify({
        name: 'Acme Corp',
        phone: '555-1234',
        email: 'billing@acme.com',
        taxRate: 10,
      }),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.name).toBe('Acme Corp')
    expect(data.phone).toBe('555-1234')
    expect(data.email).toBe('billing@acme.com')
    expect(data.taxRate).toBe(10)
  })

  it('accepts empty update (no changes)', async () => {
    const request = new Request('http://localhost/api/settings/business-profile', {
      method: 'PUT',
      body: JSON.stringify({}),
    })

    const response = await PUT(request)

    expect(response.status).toBe(200)
  })

  it('handles empty string fields by clearing them', async () => {
    const request = new Request('http://localhost/api/settings/business-profile', {
      method: 'PUT',
      body: JSON.stringify({ phone: '' }),
    })

    const response = await PUT(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.phone).toBeNull()
  })

  it('rejects invalid email', async () => {
    const request = new Request('http://localhost/api/settings/business-profile', {
      method: 'PUT',
      body: JSON.stringify({ email: 'not-an-email' }),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid business profile data')
    expect(data.details).toBeDefined()
  })

  it('rejects tax rate over 100', async () => {
    const request = new Request('http://localhost/api/settings/business-profile', {
      method: 'PUT',
      body: JSON.stringify({ taxRate: 150 }),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid business profile data')
  })

  it('rejects negative tax rate', async () => {
    const request = new Request('http://localhost/api/settings/business-profile', {
      method: 'PUT',
      body: JSON.stringify({ taxRate: -5 }),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid business profile data')
  })

  it('rejects non-integer invoice number', async () => {
    const request = new Request('http://localhost/api/settings/business-profile', {
      method: 'PUT',
      body: JSON.stringify({ nextInvoiceNumber: 10.5 }),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid business profile data')
  })

  it('rejects invoice number less than 1', async () => {
    const request = new Request('http://localhost/api/settings/business-profile', {
      method: 'PUT',
      body: JSON.stringify({ nextInvoiceNumber: 0 }),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid business profile data')
  })

  it('accepts valid invoice number', async () => {
    const request = new Request('http://localhost/api/settings/business-profile', {
      method: 'PUT',
      body: JSON.stringify({ nextInvoiceNumber: 100 }),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.nextInvoiceNumber).toBe(100)
  })

  // Tests that simulate exact form submission payloads
  it('accepts full form submission with all null optional fields', async () => {
    // This is exactly what the form sends when user only fills required fields
    const request = new Request('http://localhost/api/settings/business-profile', {
      method: 'PUT',
      body: JSON.stringify({
        name: null,
        businessNumber: null,
        gstNumber: null,
        phone: null,
        email: null,
        address: null,
        paymentDetails: null,
        taxRate: null,
        paymentTerms: null,
        nextInvoiceNumber: 1,
      }),
    })

    const response = await PUT(request)

    expect(response.status).toBe(200)
  })

  it('accepts form submission with tax rate change (typical user scenario)', async () => {
    // User changes tax rate from empty to 10, all other fields remain empty
    const request = new Request('http://localhost/api/settings/business-profile', {
      method: 'PUT',
      body: JSON.stringify({
        name: null,
        businessNumber: null,
        gstNumber: null,
        phone: null,
        email: null,
        address: null,
        paymentDetails: null,
        taxRate: 10,
        paymentTerms: null,
        nextInvoiceNumber: 1,
      }),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.taxRate).toBe(10)
  })

  it('accepts form submission with mixed values (some filled, some null)', async () => {
    const request = new Request('http://localhost/api/settings/business-profile', {
      method: 'PUT',
      body: JSON.stringify({
        name: 'My Business',
        businessNumber: null,
        gstNumber: null,
        phone: '555-1234',
        email: 'test@example.com',
        address: null,
        paymentDetails: null,
        taxRate: 15,
        paymentTerms: 'Net 30',
        nextInvoiceNumber: 42,
      }),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.name).toBe('My Business')
    expect(data.phone).toBe('555-1234')
    expect(data.email).toBe('test@example.com')
    expect(data.taxRate).toBe(15)
    expect(data.paymentTerms).toBe('Net 30')
    expect(data.nextInvoiceNumber).toBe(42)
    // Null fields should remain null
    expect(data.businessNumber).toBeNull()
    expect(data.gstNumber).toBeNull()
    expect(data.address).toBeNull()
    expect(data.paymentDetails).toBeNull()
  })
})
