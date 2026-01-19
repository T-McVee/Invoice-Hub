import { describe, it, expect } from 'vitest'
import {
  hourlyRateSchema,
  emailSchema,
  taxRateSchema,
  nextInvoiceNumberSchema,
  businessProfileSchema,
  setHourlyRate,
  getHourlyRate,
  setBusinessProfile,
  getBusinessProfile,
  getAndIncrementNextInvoiceNumber,
} from './index'

describe('settings', () => {
  describe('hourlyRateSchema', () => {
    it('accepts valid positive numbers', () => {
      expect(() => hourlyRateSchema.parse(100)).not.toThrow()
      expect(() => hourlyRateSchema.parse(0)).not.toThrow()
      expect(() => hourlyRateSchema.parse(150.50)).not.toThrow()
    })

    it('rejects negative numbers', () => {
      expect(() => hourlyRateSchema.parse(-1)).toThrow()
      expect(() => hourlyRateSchema.parse(-100)).toThrow()
    })

    it('rejects non-numbers', () => {
      expect(() => hourlyRateSchema.parse('100')).toThrow()
      expect(() => hourlyRateSchema.parse(null)).toThrow()
    })
  })

  describe('emailSchema', () => {
    it('accepts valid email addresses', () => {
      expect(() => emailSchema.parse('test@example.com')).not.toThrow()
      expect(() => emailSchema.parse('user.name@domain.co.uk')).not.toThrow()
    })

    it('accepts empty string (optional field)', () => {
      expect(() => emailSchema.parse('')).not.toThrow()
    })

    it('accepts undefined (optional field)', () => {
      expect(() => emailSchema.parse(undefined)).not.toThrow()
    })

    it('rejects invalid email formats', () => {
      expect(() => emailSchema.parse('not-an-email')).toThrow()
      expect(() => emailSchema.parse('missing@')).toThrow()
      expect(() => emailSchema.parse('@nodomain.com')).toThrow()
    })
  })

  describe('taxRateSchema', () => {
    it('accepts valid tax rates (0-100)', () => {
      expect(() => taxRateSchema.parse(0)).not.toThrow()
      expect(() => taxRateSchema.parse(15)).not.toThrow()
      expect(() => taxRateSchema.parse(100)).not.toThrow()
      expect(() => taxRateSchema.parse(10.5)).not.toThrow()
    })

    it('rejects negative tax rates', () => {
      expect(() => taxRateSchema.parse(-1)).toThrow()
    })

    it('rejects tax rates over 100%', () => {
      expect(() => taxRateSchema.parse(101)).toThrow()
      expect(() => taxRateSchema.parse(200)).toThrow()
    })
  })

  describe('nextInvoiceNumberSchema', () => {
    it('accepts positive integers', () => {
      expect(() => nextInvoiceNumberSchema.parse(1)).not.toThrow()
      expect(() => nextInvoiceNumberSchema.parse(100)).not.toThrow()
      expect(() => nextInvoiceNumberSchema.parse(9999)).not.toThrow()
    })

    it('rejects zero', () => {
      expect(() => nextInvoiceNumberSchema.parse(0)).toThrow()
    })

    it('rejects negative numbers', () => {
      expect(() => nextInvoiceNumberSchema.parse(-1)).toThrow()
    })

    it('rejects non-integers', () => {
      expect(() => nextInvoiceNumberSchema.parse(1.5)).toThrow()
      expect(() => nextInvoiceNumberSchema.parse(10.1)).toThrow()
    })
  })

  describe('businessProfileSchema', () => {
    it('accepts valid complete profile', () => {
      const profile = {
        name: 'Test Business',
        businessNumber: '123456',
        gstNumber: 'GST123',
        phone: '555-1234',
        email: 'test@example.com',
        address: '123 Main St',
        paymentDetails: 'Bank: 12-3456-7890',
        taxRate: 15,
        paymentTerms: 'Due in 14 days',
        nextInvoiceNumber: 100,
      }
      expect(() => businessProfileSchema.parse(profile)).not.toThrow()
    })

    it('accepts partial profile (all fields optional)', () => {
      expect(() => businessProfileSchema.parse({})).not.toThrow()
      expect(() => businessProfileSchema.parse({ name: 'Just Name' })).not.toThrow()
    })

    it('validates nested email field', () => {
      expect(() => businessProfileSchema.parse({ email: 'invalid' })).toThrow()
    })

    it('validates nested taxRate field', () => {
      expect(() => businessProfileSchema.parse({ taxRate: 150 })).toThrow()
    })

    it('validates nested nextInvoiceNumber field', () => {
      expect(() => businessProfileSchema.parse({ nextInvoiceNumber: 0 })).toThrow()
    })

    // Tests for null value handling (form sends null for empty fields)
    it('accepts null for optional string fields', () => {
      const profile = {
        name: null,
        businessNumber: null,
        gstNumber: null,
        phone: null,
        email: null,
        address: null,
        paymentDetails: null,
        paymentTerms: null,
      }
      expect(() => businessProfileSchema.parse(profile)).not.toThrow()
    })

    it('accepts null for taxRate', () => {
      expect(() => businessProfileSchema.parse({ taxRate: null })).not.toThrow()
    })

    it('accepts data in the exact format the form sends to the API', () => {
      // This mirrors the updateData object in handleSave
      const formData = {
        name: null,
        businessNumber: null,
        gstNumber: null,
        phone: null,
        email: null,
        address: null,
        paymentDetails: null,
        taxRate: 10, // User entered a tax rate
        paymentTerms: null,
        nextInvoiceNumber: 1,
      }
      expect(() => businessProfileSchema.parse(formData)).not.toThrow()
    })

    it('accepts mixed null and values (typical form submission)', () => {
      const formData = {
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
      }
      expect(() => businessProfileSchema.parse(formData)).not.toThrow()
    })
  })

  describe('setHourlyRate / getHourlyRate', () => {
    it('stores and retrieves hourly rate', async () => {
      const result = await setHourlyRate(125)

      expect(result.rate).toBe(125)
      expect(result.updatedAt).toBeInstanceOf(Date)

      const retrieved = await getHourlyRate()
      expect(retrieved.rate).toBe(125)
    })

    it('throws on invalid rate', async () => {
      await expect(setHourlyRate(-50)).rejects.toThrow()
    })
  })

  describe('setBusinessProfile / getBusinessProfile', () => {
    it('stores and retrieves business profile', async () => {
      const updates = {
        name: 'Test Corp',
        taxRate: 10,
      }

      const result = await setBusinessProfile(updates)

      expect(result.name).toBe('Test Corp')
      expect(result.taxRate).toBe(10)
      expect(result.updatedAt).toBeInstanceOf(Date)

      const retrieved = await getBusinessProfile()
      expect(retrieved.name).toBe('Test Corp')
    })

    it('merges partial updates', async () => {
      await setBusinessProfile({ name: 'First Name' })
      await setBusinessProfile({ phone: '555-1234' })

      const result = await getBusinessProfile()
      expect(result.name).toBe('First Name')
      expect(result.phone).toBe('555-1234')
    })

    it('throws on invalid email in profile', async () => {
      await expect(setBusinessProfile({ email: 'not-valid' })).rejects.toThrow()
    })

    it('accepts null values for optional fields', async () => {
      const updates = {
        name: null,
        businessNumber: null,
        gstNumber: null,
        phone: null,
        email: null,
        address: null,
        paymentDetails: null,
        taxRate: null,
        paymentTerms: null,
      }

      const result = await setBusinessProfile(updates)

      expect(result.name).toBeNull()
      expect(result.taxRate).toBeNull()
    })

    it('accepts form submission payload with tax rate change', async () => {
      // This mimics exactly what the form sends when user changes tax rate
      const updates = {
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
      }

      const result = await setBusinessProfile(updates)

      expect(result.taxRate).toBe(10)
      expect(result.nextInvoiceNumber).toBe(1)
    })
  })

  describe('getAndIncrementNextInvoiceNumber', () => {
    it('returns current number and increments', async () => {
      // Set a known starting point
      await setBusinessProfile({ nextInvoiceNumber: 50 })

      const first = await getAndIncrementNextInvoiceNumber()
      const second = await getAndIncrementNextInvoiceNumber()
      const third = await getAndIncrementNextInvoiceNumber()

      expect(first).toBe(50)
      expect(second).toBe(51)
      expect(third).toBe(52)
    })
  })
})
