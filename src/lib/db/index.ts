/**
 * Database module - re-exports all repository functions
 *
 * This module provides a unified interface to all database operations.
 * Import from here rather than individual repository files.
 */

// Client operations
export {
  getClients,
  getClientById,
  getClientByTogglClientId,
  createClient,
  updateClient,
  updateClientPortalToken,
  deleteClient,
} from './repositories/client';

// Timesheet operations
export {
  getTimesheets,
  getTimesheetById,
  getTimesheetByClientAndMonth,
  createTimesheet,
  updateTimesheet,
} from './repositories/timesheet';

// Invoice operations
export {
  getInvoices,
  getInvoiceById,
  getInvoicesByClientId,
  createInvoice,
  updateInvoice,
} from './repositories/invoice';

// Prisma client (for advanced use cases)
export { prisma, disconnect } from './prisma';

// Test utilities
export { clearAll, resetToDefault } from './test-utils';
