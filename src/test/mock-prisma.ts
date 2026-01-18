/**
 * Mock Prisma Client for testing
 *
 * This provides in-memory storage that mimics Prisma's API
 * for testing without a real database connection.
 */

import { vi } from 'vitest';

// Database record types (match Prisma model shapes)
type DbClient = {
  id: string;
  name: string;
  togglClientId: string | null;
  togglProjectId: string | null;
  timesheetRecipients: string; // JSON string
  invoiceRecipients: string; // JSON string
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  contacts?: DbContact[];
};

type DbContact = {
  id: string;
  clientId: string;
  name: string;
  email: string;
  role: string;
};

type DbTimesheet = {
  id: string;
  clientId: string;
  month: string;
  status: string;
  pdfUrl: string | null;
  totalHours: number;
  sentAt: Date | null;
  approvedAt: Date | null;
  createdAt: Date;
};

type DbInvoice = {
  id: string;
  clientId: string;
  timesheetId: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  pdfUrl: string | null;
  sentAt: Date | null;
  paidAt: Date | null;
  createdAt: Date;
};

type DbSettings = {
  id: string;
  key: string;
  value: string;
  updatedAt: Date;
};

// In-memory stores
let clients: Map<string, DbClient> = new Map();
let contacts: Map<string, DbContact> = new Map();
let timesheets: Map<string, DbTimesheet> = new Map();
let invoices: Map<string, DbInvoice> = new Map();
let settings: Map<string, DbSettings> = new Map();

// Helper to generate UUIDs
function uuid(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Mock Prisma client
export const mockPrisma = {
  client: {
    findMany: vi.fn(async (args?: { include?: { contacts?: boolean }; orderBy?: unknown }) => {
      const clientsArray = Array.from(clients.values());
      const sorted = clientsArray.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
      if (args?.include?.contacts) {
        return sorted.map((c) => ({
          ...c,
          contacts: Array.from(contacts.values()).filter((ct) => ct.clientId === c.id),
        }));
      }
      return sorted;
    }),
    findUnique: vi.fn(
      async (args: { where: { id?: string; togglClientId?: string }; include?: { contacts?: boolean } }) => {
        let client;
        if (args.where.id) {
          client = clients.get(args.where.id);
        } else if (args.where.togglClientId) {
          client = Array.from(clients.values()).find(
            (c) => c.togglClientId === args.where.togglClientId
          );
        }
        if (!client) return null;
        if (args.include?.contacts) {
          return {
            ...client,
            contacts: Array.from(contacts.values()).filter((c) => c.clientId === client!.id),
          };
        }
        return client;
      }
    ),
    create: vi.fn(async (args: { data: Record<string, unknown>; include?: { contacts?: boolean } }) => {
      const id = (args.data.id as string) || uuid();
      const now = new Date();
      const client = {
        id,
        name: args.data.name as string,
        togglClientId: (args.data.togglClientId as string) || null,
        togglProjectId: (args.data.togglProjectId as string) || null,
        timesheetRecipients: (args.data.timesheetRecipients as string) || '[]',
        invoiceRecipients: (args.data.invoiceRecipients as string) || '[]',
        notes: (args.data.notes as string) || null,
        createdAt: (args.data.createdAt as Date) || now,
        updatedAt: (args.data.updatedAt as Date) || now,
        contacts: [] as DbContact[],
      };
      clients.set(id, client);

      // Handle nested contacts creation
      const contactsData = args.data.contacts as { create?: Array<{ id?: string; name: string; email: string; role: string }> } | undefined;
      if (contactsData?.create) {
        for (const c of contactsData.create) {
          const contactId = c.id || uuid();
          const contact: DbContact = { id: contactId, clientId: id, name: c.name, email: c.email, role: c.role };
          contacts.set(contactId, contact);
          client.contacts.push(contact);
        }
      }

      return client;
    }),
    update: vi.fn(async (args: { where: { id: string }; data: Record<string, unknown>; include?: { contacts?: boolean } }) => {
      const client = clients.get(args.where.id);
      if (!client) return null;
      const updated = { ...client, ...args.data, updatedAt: new Date() };
      clients.set(args.where.id, updated as typeof client);
      if (args.include?.contacts) {
        return {
          ...updated,
          contacts: Array.from(contacts.values()).filter((c) => c.clientId === args.where.id),
        };
      }
      return updated;
    }),
    delete: vi.fn(async (args: { where: { id: string } }) => {
      const client = clients.get(args.where.id);
      clients.delete(args.where.id);
      return client;
    }),
    deleteMany: vi.fn(async () => {
      const count = clients.size;
      clients.clear();
      return { count };
    }),
  },
  contact: {
    deleteMany: vi.fn(async (args?: { where?: { clientId: string } }) => {
      if (args?.where?.clientId) {
        const toDelete = Array.from(contacts.entries()).filter(
          ([, c]) => c.clientId === args.where!.clientId
        );
        toDelete.forEach(([id]) => contacts.delete(id));
        return { count: toDelete.length };
      }
      const count = contacts.size;
      contacts.clear();
      return { count };
    }),
    createMany: vi.fn(async (args: { data: Array<{ clientId: string; name: string; email: string; role: string }> }) => {
      for (const c of args.data) {
        const id = uuid();
        contacts.set(id, { id, ...c });
      }
      return { count: args.data.length };
    }),
  },
  timesheet: {
    findMany: vi.fn(async () => {
      return Array.from(timesheets.values()).sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
    }),
    findUnique: vi.fn(
      async (args: { where: { id?: string; clientId_month?: { clientId: string; month: string } } }) => {
        if (args.where.id) {
          return timesheets.get(args.where.id) || null;
        }
        if (args.where.clientId_month) {
          return (
            Array.from(timesheets.values()).find(
              (t) =>
                t.clientId === args.where.clientId_month!.clientId &&
                t.month === args.where.clientId_month!.month
            ) || null
          );
        }
        return null;
      }
    ),
    create: vi.fn(async (args: { data: Record<string, unknown> }) => {
      const id = uuid();
      const timesheet = {
        id,
        clientId: args.data.clientId as string,
        month: args.data.month as string,
        status: (args.data.status as string) || 'pending',
        pdfUrl: (args.data.pdfUrl as string) || null,
        totalHours: args.data.totalHours as number,
        sentAt: (args.data.sentAt as Date) || null,
        approvedAt: (args.data.approvedAt as Date) || null,
        createdAt: new Date(),
      };
      timesheets.set(id, timesheet);
      return timesheet;
    }),
    update: vi.fn(async (args: { where: { id: string }; data: Record<string, unknown> }) => {
      const timesheet = timesheets.get(args.where.id);
      if (!timesheet) return null;
      const updated = { ...timesheet, ...args.data };
      timesheets.set(args.where.id, updated as typeof timesheet);
      return updated;
    }),
    count: vi.fn(async (args?: { where?: { clientId: string } }) => {
      if (args?.where?.clientId) {
        return Array.from(timesheets.values()).filter(
          (t) => t.clientId === args.where!.clientId
        ).length;
      }
      return timesheets.size;
    }),
    deleteMany: vi.fn(async () => {
      const count = timesheets.size;
      timesheets.clear();
      return { count };
    }),
  },
  invoice: {
    findMany: vi.fn(async () => Array.from(invoices.values())),
    findUnique: vi.fn(async (args: { where: { id: string } }) => invoices.get(args.where.id) || null),
    create: vi.fn(async (args: { data: Record<string, unknown> }) => {
      const id = uuid();
      const invoice: DbInvoice = {
        id,
        clientId: args.data.clientId as string,
        timesheetId: args.data.timesheetId as string,
        invoiceNumber: args.data.invoiceNumber as string,
        amount: args.data.amount as number,
        status: (args.data.status as string) || 'draft',
        pdfUrl: (args.data.pdfUrl as string) || null,
        sentAt: (args.data.sentAt as Date) || null,
        paidAt: (args.data.paidAt as Date) || null,
        createdAt: new Date(),
      };
      invoices.set(id, invoice);
      return invoice;
    }),
    deleteMany: vi.fn(async () => {
      const count = invoices.size;
      invoices.clear();
      return { count };
    }),
  },
  settings: {
    findUnique: vi.fn(async (args: { where: { key: string } }) => settings.get(args.where.key) || null),
    upsert: vi.fn(
      async (args: {
        where: { key: string };
        update: { value: string };
        create: { key: string; value: string };
      }) => {
        const existing = settings.get(args.where.key);
        const now = new Date();
        if (existing) {
          const updated = { ...existing, value: args.update.value, updatedAt: now };
          settings.set(args.where.key, updated);
          return updated;
        }
        const created = { id: uuid(), key: args.create.key, value: args.create.value, updatedAt: now };
        settings.set(args.create.key, created);
        return created;
      }
    ),
    deleteMany: vi.fn(async () => {
      const count = settings.size;
      settings.clear();
      return { count };
    }),
  },
  $transaction: vi.fn(async (fn: (tx: typeof mockPrisma) => Promise<unknown>) => {
    return fn(mockPrisma);
  }),
  $disconnect: vi.fn(async () => {}),
};

/**
 * Clear all mock data - call in beforeEach
 */
export function clearMockData(): void {
  clients.clear();
  contacts.clear();
  timesheets.clear();
  invoices.clear();
  settings.clear();
}

/**
 * Reset all mock function call history
 */
export function resetMocks(): void {
  Object.values(mockPrisma).forEach((model) => {
    if (typeof model === 'object' && model !== null) {
      Object.values(model).forEach((fn) => {
        if (typeof fn === 'function' && 'mockClear' in fn) {
          (fn as ReturnType<typeof vi.fn>).mockClear();
        }
      });
    }
  });
}
