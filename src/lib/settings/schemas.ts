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

export const paymentTermsDaysSchema = z
  .number()
  .int('Payment terms must be a whole number')
  .min(1, 'Payment terms must be at least 1 day')
  .max(365, 'Payment terms cannot exceed 365 days');

export const businessProfileSchema = z.object({
  name: z.string().nullable().optional(),
  businessNumber: z.string().nullable().optional(),
  gstNumber: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: emailSchema.nullable(),
  address: z.string().nullable().optional(),
  paymentDetails: z.string().nullable().optional(),
  taxRate: taxRateSchema.nullable().optional(),
  paymentTermsDays: paymentTermsDaysSchema.nullable().optional(),
  nextInvoiceNumber: nextInvoiceNumberSchema.optional(),
});
