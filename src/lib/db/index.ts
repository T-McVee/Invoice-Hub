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
  getTimesheetsByClientId,
  createTimesheet,
  updateTimesheet,
  deleteTimesheet,
} from './repositories/timesheet';

// Invoice operations
export {
  getInvoices,
  getInvoiceById,
  getInvoicesByClientId,
  getInvoicesByTimesheetId,
  listInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} from './repositories/invoice';
export type { ListInvoicesOptions } from './repositories/invoice';

// Prisma client (for advanced use cases)
export { prisma, disconnect } from './prisma';

// Test utilities
export { clearAll, resetToDefault } from './test-utils';
