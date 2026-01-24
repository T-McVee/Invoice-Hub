// JWT utilities for portal token authentication
// Tokens are used for client portal access with ~45 day expiry

import jwt from 'jsonwebtoken'

const TOKEN_EXPIRY_DAYS = 45

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set')
  }
  return secret
}

export interface PortalTokenPayload {
  clientId: string
  iat: number
  exp: number
}

/**
 * Sign a new portal token for a client
 * @param clientId - The client's UUID
 * @returns The signed JWT token
 */
export function signPortalToken(clientId: string): string {
  const secret = getJwtSecret()

  return jwt.sign({ clientId }, secret, {
    expiresIn: `${TOKEN_EXPIRY_DAYS}d`,
  })
}

/**
 * Verify and decode a portal token
 * @param token - The JWT token to verify
 * @returns The decoded payload if valid
 * @throws Error if token is invalid or expired
 */
export function verifyPortalToken(token: string): PortalTokenPayload {
  const secret = getJwtSecret()

  const decoded = jwt.verify(token, secret) as PortalTokenPayload

  if (!decoded.clientId) {
    throw new Error('Invalid token: missing clientId')
  }

  return decoded
}

/**
 * Decode a portal token without verifying (for inspection)
 * @param token - The JWT token to decode
 * @returns The decoded payload or null if invalid format
 */
export function decodePortalToken(token: string): PortalTokenPayload | null {
  const decoded = jwt.decode(token) as PortalTokenPayload | null

  if (!decoded || !decoded.clientId) {
    return null
  }

  return decoded
}

/**
 * Check if a token is expired
 * @param token - The JWT token to check
 * @returns true if expired, false if valid or invalid format
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodePortalToken(token)

  if (!decoded || !decoded.exp) {
    return true
  }

  const now = Math.floor(Date.now() / 1000)
  return decoded.exp < now
}

/**
 * Get the expiry date from a token
 * @param token - The JWT token
 * @returns The expiry Date or null if invalid
 */
export function getTokenExpiry(token: string): Date | null {
  const decoded = decodePortalToken(token)

  if (!decoded || !decoded.exp) {
    return null
  }

  return new Date(decoded.exp * 1000)
}
