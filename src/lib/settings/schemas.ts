/**
 * Settings validation schemas
 * These schemas are safe to import from client components
 */

import { z } from 'zod';

export const hourlyRateSchema = z
  .number()
  .min(0, 'Hourly rate must be 0 or greater');

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
