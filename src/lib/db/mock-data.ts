// Mock data store for MVP testing
// Replace with Azure SQL Database in production

import { Client, Timesheet } from '@/types';

// In-memory client store
const clients: Map<string, Client> = new Map();

// Initialize with default client if TOGGL_PROJECT_ID is set
const defaultClient: Client = {
  id: 'client-1',
  name: 'Acme Corporation',
  togglClientId: null,
  togglProjectId: process.env.TOGGL_PROJECT_ID || null,
  timesheetRecipients: [],
  invoiceRecipients: [],
  notes: null,
  contacts: [
    {
      id: 'contact-1',
      clientId: 'client-1',
      name: 'John Smith',
      email: 'john@acme.com',
      role: 'both',
    },
  ],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};
clients.set(defaultClient.id, defaultClient);

// In-memory timesheet store (reset on server restart)
const timesheets: Map<string, Timesheet> = new Map();

// Client CRUD operations

export function getClients(): Client[] {
  return Array.from(clients.values()).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
}

export function getClientById(id: string): Client | undefined {
  return clients.get(id);
}

export function getClientByTogglClientId(
  togglClientId: string
): Client | undefined {
  return Array.from(clients.values()).find(
    (c) => c.togglClientId === togglClientId
  );
}

export function createClient(
  data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>
): Client {
  const id = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date();
  const client: Client = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  };
  clients.set(id, client);
  return client;
}

export function updateClient(
  id: string,
  updates: Partial<Omit<Client, 'id' | 'createdAt'>>
): Client | undefined {
  const existing = clients.get(id);
  if (!existing) return undefined;

  const updated: Client = {
    ...existing,
    ...updates,
    updatedAt: new Date(),
  };
  clients.set(id, updated);
  return updated;
}

export function deleteClient(id: string): boolean {
  // Check if client has associated timesheets
  const hasTimesheets = Array.from(timesheets.values()).some(
    (t) => t.clientId === id
  );
  if (hasTimesheets) {
    return false; // Cannot delete client with timesheets
  }
  return clients.delete(id);
}

// Timesheet operations

export function getTimesheets(): Timesheet[] {
  return Array.from(timesheets.values()).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
}

export function getTimesheetById(id: string): Timesheet | undefined {
  return timesheets.get(id);
}

export function getTimesheetByClientAndMonth(
  clientId: string,
  month: string
): Timesheet | undefined {
  return Array.from(timesheets.values()).find(
    (t) => t.clientId === clientId && t.month === month
  );
}

export function createTimesheet(
  data: Omit<Timesheet, 'id' | 'createdAt'>
): Timesheet {
  const id = `ts-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const timesheet: Timesheet = {
    ...data,
    id,
    createdAt: new Date(),
  };
  timesheets.set(id, timesheet);
  return timesheet;
}

export function updateTimesheet(
  id: string,
  updates: Partial<Timesheet>
): Timesheet | undefined {
  const existing = timesheets.get(id);
  if (!existing) return undefined;

  const updated = { ...existing, ...updates };
  timesheets.set(id, updated);
  return updated;
}

// Test utilities

/**
 * Clear all data from the mock database
 * Used for testing to reset state between tests
 */
export function clearAll(): void {
  clients.clear();
  timesheets.clear();
}

/**
 * Reset database to initial state with default client
 * Used for testing to restore predictable starting state
 */
export function resetToDefault(): void {
  clearAll();
  clients.set(defaultClient.id, { ...defaultClient });
}
