/**
 * Settings store - database-backed settings
 * Persists settings to Azure SQL Database via Prisma
 */

import { prisma } from '@/lib/db/prisma';
import {
  hourlyRateSchema,
  businessProfileSchema,
} from './schemas';

// Re-export schemas from the separate schemas file (client-safe)
export {
  hourlyRateSchema,
  emailSchema,
  taxRateSchema,
  nextInvoiceNumberSchema,
  businessProfileSchema,
} from './schemas';

// =============================================================================
// Types
// =============================================================================

export type HourlyRateSetting = {
  rate: number | null;
  updatedAt: Date | null;
};

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

// =============================================================================
// Settings Keys
// =============================================================================

const HOURLY_RATE_KEY = 'hourlyRate';
const BUSINESS_PROFILE_KEY = 'businessProfile';

// =============================================================================
// Default Values
// =============================================================================

const DEFAULT_HOURLY_RATE: HourlyRateSetting = {
  rate: null,
  updatedAt: null,
};

const DEFAULT_BUSINESS_PROFILE: BusinessProfile = {
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

// =============================================================================
// Hourly Rate Settings
// =============================================================================

/**
 * Get the current hourly rate setting
 */
export async function getHourlyRate(): Promise<HourlyRateSetting> {
  const setting = await prisma.settings.findUnique({
    where: { key: HOURLY_RATE_KEY },
  });

  if (!setting) {
    return { ...DEFAULT_HOURLY_RATE };
  }

  const value = JSON.parse(setting.value);
  return {
    rate: value.rate,
    updatedAt: setting.updatedAt,
  };
}

/**
 * Set the hourly rate
 * @param rate - The hourly rate (must be >= 0)
 * @returns The updated setting
 */
export async function setHourlyRate(rate: number): Promise<HourlyRateSetting> {
  // Validate with Zod
  hourlyRateSchema.parse(rate);

  const setting = await prisma.settings.upsert({
    where: { key: HOURLY_RATE_KEY },
    update: { value: JSON.stringify({ rate }) },
    create: { key: HOURLY_RATE_KEY, value: JSON.stringify({ rate }) },
  });

  return {
    rate,
    updatedAt: setting.updatedAt,
  };
}

// =============================================================================
// Business Profile Settings
// =============================================================================

/**
 * Get the current business profile
 */
export async function getBusinessProfile(): Promise<BusinessProfile> {
  const setting = await prisma.settings.findUnique({
    where: { key: BUSINESS_PROFILE_KEY },
  });

  if (!setting) {
    return { ...DEFAULT_BUSINESS_PROFILE };
  }

  const value = JSON.parse(setting.value);
  return {
    name: value.name ?? null,
    businessNumber: value.businessNumber ?? null,
    gstNumber: value.gstNumber ?? null,
    phone: value.phone ?? null,
    email: value.email ?? null,
    address: value.address ?? null,
    paymentDetails: value.paymentDetails ?? null,
    taxRate: value.taxRate ?? null,
    paymentTerms: value.paymentTerms ?? null,
    nextInvoiceNumber: value.nextInvoiceNumber ?? 1,
    updatedAt: setting.updatedAt,
  };
}

/**
 * Update the business profile
 * @param updates - Partial business profile updates
 * @returns The updated business profile
 */
export async function setBusinessProfile(
  updates: Partial<Omit<BusinessProfile, 'updatedAt'>>
): Promise<BusinessProfile> {
  // Validate updates
  businessProfileSchema.parse(updates);

  // Get current profile to merge with updates
  const current = await getBusinessProfile();

  const newProfile = {
    name: updates.name !== undefined ? updates.name : current.name,
    businessNumber:
      updates.businessNumber !== undefined
        ? updates.businessNumber
        : current.businessNumber,
    gstNumber:
      updates.gstNumber !== undefined ? updates.gstNumber : current.gstNumber,
    phone: updates.phone !== undefined ? updates.phone : current.phone,
    email: updates.email !== undefined ? updates.email : current.email,
    address: updates.address !== undefined ? updates.address : current.address,
    paymentDetails:
      updates.paymentDetails !== undefined
        ? updates.paymentDetails
        : current.paymentDetails,
    taxRate: updates.taxRate !== undefined ? updates.taxRate : current.taxRate,
    paymentTerms:
      updates.paymentTerms !== undefined
        ? updates.paymentTerms
        : current.paymentTerms,
    nextInvoiceNumber:
      updates.nextInvoiceNumber !== undefined
        ? updates.nextInvoiceNumber
        : current.nextInvoiceNumber,
  };

  const setting = await prisma.settings.upsert({
    where: { key: BUSINESS_PROFILE_KEY },
    update: { value: JSON.stringify(newProfile) },
    create: { key: BUSINESS_PROFILE_KEY, value: JSON.stringify(newProfile) },
  });

  return {
    ...newProfile,
    updatedAt: setting.updatedAt,
  };
}

/**
 * Get the current invoice number and increment for next use
 * @returns The current invoice number (before increment)
 */
export async function getAndIncrementNextInvoiceNumber(): Promise<number> {
  // Use a transaction to ensure atomicity
  return await prisma.$transaction(async (tx) => {
    const setting = await tx.settings.findUnique({
      where: { key: BUSINESS_PROFILE_KEY },
    });

    let profile: Omit<BusinessProfile, 'updatedAt'>;

    if (!setting) {
      profile = { ...DEFAULT_BUSINESS_PROFILE };
    } else {
      const value = JSON.parse(setting.value);
      profile = {
        name: value.name ?? null,
        businessNumber: value.businessNumber ?? null,
        gstNumber: value.gstNumber ?? null,
        phone: value.phone ?? null,
        email: value.email ?? null,
        address: value.address ?? null,
        paymentDetails: value.paymentDetails ?? null,
        taxRate: value.taxRate ?? null,
        paymentTerms: value.paymentTerms ?? null,
        nextInvoiceNumber: value.nextInvoiceNumber ?? 1,
      };
    }

    const currentNumber = profile.nextInvoiceNumber;

    // Increment and save
    profile.nextInvoiceNumber = currentNumber + 1;

    await tx.settings.upsert({
      where: { key: BUSINESS_PROFILE_KEY },
      update: { value: JSON.stringify(profile) },
      create: { key: BUSINESS_PROFILE_KEY, value: JSON.stringify(profile) },
    });

    return currentNumber;
  });
}

// =============================================================================
// Test Utilities
// =============================================================================

/**
 * Reset settings to default values
 * Used for testing to restore predictable starting state
 */
export async function resetSettings(): Promise<void> {
  await prisma.settings.deleteMany();
}
