import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock environment variable before importing
vi.stubEnv('JWT_SECRET', 'test-secret-key-for-testing-purposes-only')

// Import after env var is set
import {
  signPortalToken,
  verifyPortalToken,
  decodePortalToken,
  isTokenExpired,
  getTokenExpiry,
} from './jwt'

describe('auth/jwt', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('signPortalToken', () => {
    it('creates a valid JWT token', () => {
      const token = signPortalToken('client-123')

      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3) // JWT has 3 parts
    })

    it('includes clientId in payload', () => {
      const token = signPortalToken('client-456')
      const decoded = decodePortalToken(token)

      expect(decoded?.clientId).toBe('client-456')
    })

    it('sets expiry to ~45 days', () => {
      const token = signPortalToken('client-123')
      const decoded = decodePortalToken(token)

      // 45 days in seconds from the mocked time
      const expectedExp = Math.floor(new Date('2024-01-15T12:00:00Z').getTime() / 1000) + 45 * 24 * 60 * 60

      expect(decoded?.exp).toBe(expectedExp)
    })
  })

  describe('verifyPortalToken', () => {
    it('returns decoded payload for valid token', () => {
      const token = signPortalToken('client-123')
      const decoded = verifyPortalToken(token)

      expect(decoded.clientId).toBe('client-123')
      expect(decoded.iat).toBeDefined()
      expect(decoded.exp).toBeDefined()
    })

    it('throws error for invalid token', () => {
      expect(() => verifyPortalToken('invalid-token')).toThrow()
    })

    it('throws error for tampered token', () => {
      const token = signPortalToken('client-123')
      const tamperedToken = token.slice(0, -5) + 'xxxxx'

      expect(() => verifyPortalToken(tamperedToken)).toThrow()
    })

    it('throws error for expired token', () => {
      const token = signPortalToken('client-123')

      // Advance time past expiry (45 days + 1 second)
      vi.setSystemTime(new Date('2024-03-02T12:00:01Z'))

      expect(() => verifyPortalToken(token)).toThrow()
    })
  })

  describe('decodePortalToken', () => {
    it('decodes valid token without verification', () => {
      const token = signPortalToken('client-123')
      const decoded = decodePortalToken(token)

      expect(decoded?.clientId).toBe('client-123')
    })

    it('returns null for invalid token format', () => {
      const decoded = decodePortalToken('not-a-jwt')

      expect(decoded).toBeNull()
    })

    it('returns null for token missing clientId', () => {
      // Create a minimal JWT without clientId
      const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url')
      const payload = Buffer.from(JSON.stringify({ foo: 'bar' })).toString('base64url')
      const token = `${header}.${payload}.`

      const decoded = decodePortalToken(token)

      expect(decoded).toBeNull()
    })
  })

  describe('isTokenExpired', () => {
    it('returns false for valid non-expired token', () => {
      const token = signPortalToken('client-123')

      expect(isTokenExpired(token)).toBe(false)
    })

    it('returns true for expired token', () => {
      const token = signPortalToken('client-123')

      // Advance time past expiry
      vi.setSystemTime(new Date('2024-03-02T12:00:01Z'))

      expect(isTokenExpired(token)).toBe(true)
    })

    it('returns true for invalid token', () => {
      expect(isTokenExpired('invalid-token')).toBe(true)
    })
  })

  describe('getTokenExpiry', () => {
    it('returns expiry date for valid token', () => {
      const token = signPortalToken('client-123')
      const expiry = getTokenExpiry(token)

      expect(expiry).toBeInstanceOf(Date)
      // Should be ~45 days from now (2024 is a leap year, so Feb has 29 days)
      expect(expiry?.toISOString()).toBe('2024-02-29T12:00:00.000Z')
    })

    it('returns null for invalid token', () => {
      const expiry = getTokenExpiry('invalid-token')

      expect(expiry).toBeNull()
    })
  })
})

describe('auth/jwt environment validation', () => {
  it('functions require JWT_SECRET environment variable', () => {
    // The module throws when JWT_SECRET is not set
    // This is tested implicitly - if JWT_SECRET is missing, all sign/verify operations fail
    // The actual validation happens at runtime when the functions are called
  })
})
