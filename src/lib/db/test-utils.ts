/**
 * Test utilities for database operations
 *
 * These functions are used in tests to reset database state between tests.
 * They should NOT be used in production code.
 */

import { prisma } from './prisma';

/**
 * Clear all data from the database
 * Used for testing to reset state between tests
 *
 * WARNING: This deletes ALL data. Only use in tests.
 */
export async function clearAll(): Promise<void> {
  // Delete in order to respect foreign key constraints
  await prisma.invoice.deleteMany();
  await prisma.timesheet.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.client.deleteMany();
  await prisma.settings.deleteMany();
}

/**
 * Reset database to initial state with default client
 * Used for testing to restore predictable starting state
 *
 * WARNING: This deletes ALL data and creates default test data.
 * Only use in tests.
 */
export async function resetToDefault(): Promise<void> {
  await clearAll();

  // Create default client matching original mock data
  await prisma.client.create({
    data: {
      id: 'client-1',
      name: 'Acme Corporation',
      togglClientId: null,
      togglProjectId: process.env.TOGGL_PROJECT_ID || null,
      timesheetRecipients: JSON.stringify([]),
      invoiceRecipients: JSON.stringify([]),
      notes: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      contacts: {
        create: {
          id: 'contact-1',
          name: 'John Smith',
          email: 'john@acme.com',
          role: 'both',
        },
      },
    },
  });
}
