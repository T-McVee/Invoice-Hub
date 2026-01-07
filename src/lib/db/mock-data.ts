// Mock data store for MVP testing
// Replace with Azure SQL Database in production

import { Client, Timesheet } from '@/types';

// Mock clients - configure your actual client here or via environment variables
export const mockClients: Client[] = [
  {
    id: 'client-1',
    name: 'Acme Corporation',
    togglProjectId: process.env.TOGGL_PROJECT_ID || '123456789',
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
  },
];

// In-memory timesheet store (reset on server restart)
const timesheets: Map<string, Timesheet> = new Map();

export function getClients(): Client[] {
  return mockClients;
}

export function getClientById(id: string): Client | undefined {
  return mockClients.find((c) => c.id === id);
}

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

