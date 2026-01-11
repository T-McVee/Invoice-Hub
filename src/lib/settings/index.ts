/**
 * Simple in-memory settings store
 * Designed for server-side use in Azure App Service (persistent Node.js process)
 */

import { z } from 'zod';

// =============================================================================
// Hourly Rate Settings
// =============================================================================

// Zod schema for hourly rate validation
export const hourlyRateSchema = z.number().min(0, 'Hourly rate must be 0 or greater');

export type HourlyRateSetting = {
  rate: number | null;
  updatedAt: Date | null;
};

// In-memory store for hourly rate
let hourlyRateSetting: HourlyRateSetting = {
  rate: null,
  updatedAt: null,
};

/**
 * Get the current hourly rate setting
 */
export function getHourlyRate(): HourlyRateSetting {
  return { ...hourlyRateSetting };
}

/**
 * Set the hourly rate
 * @param rate - The hourly rate (must be >= 0)
 * @returns The updated setting
 */
export function setHourlyRate(rate: number): HourlyRateSetting {
  // Validate with Zod
  hourlyRateSchema.parse(rate);

  hourlyRateSetting = {
    rate,
    updatedAt: new Date(),
  };

  return { ...hourlyRateSetting };
}

// =============================================================================
// Business Profile Settings
// =============================================================================

// Zod schemas for business profile validation
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .optional()
  .or(z.literal(''));

export const taxRateSchema = z
  .number()
  .min(0, 'Tax rate must be 0 or greater')
  .max(100, 'Tax rate cannot exceed 100%');

export const nextInvoiceNumberSchema = z
  .number()
  .int('Invoice number must be a whole number')
  .min(1, 'Invoice number must be at least 1');

export const businessProfileSchema = z.object({
  name: z.string().optional(),
  businessNumber: z.string().optional(),
  gstNumber: z.string().optional(),
  phone: z.string().optional(),
  email: emailSchema,
  address: z.string().optional(),
  paymentDetails: z.string().optional(),
  taxRate: taxRateSchema.optional().nullable(),
  paymentTerms: z.string().optional(),
  nextInvoiceNumber: nextInvoiceNumberSchema.optional(),
});

export type BusinessProfile = {
  name: string | null;
  businessNumber: string | null;
  gstNumber: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  paymentDetails: string | null;
  taxRate: number | null;
  paymentTerms: string | null;
  nextInvoiceNumber: number;
  updatedAt: Date | null;
};

// In-memory store for business profile
let businessProfile: BusinessProfile = {
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
  updatedAt: null,
};

/**
 * Get the current business profile
 */
export function getBusinessProfile(): BusinessProfile {
  return { ...businessProfile };
}

/**
 * Update the business profile
 * @param updates - Partial business profile updates
 * @returns The updated business profile
 */
export function setBusinessProfile(
  updates: Partial<Omit<BusinessProfile, 'updatedAt'>>
): BusinessProfile {
  // Validate updates
  businessProfileSchema.parse(updates);

  businessProfile = {
    ...businessProfile,
    ...updates,
    updatedAt: new Date(),
  };

  return { ...businessProfile };
}

/**
 * Get the current invoice number and increment for next use
 * @returns The current invoice number (before increment)
 */
export function getAndIncrementNextInvoiceNumber(): number {
  const current = businessProfile.nextInvoiceNumber;
  businessProfile = {
    ...businessProfile,
    nextInvoiceNumber: current + 1,
    updatedAt: new Date(),
  };
  return current;
}
