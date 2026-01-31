// Shared TypeScript types

export interface Client {
  id: string;
  name: string;
  togglClientId: string | null; // Toggl client ID (for importing)
  togglProjectId: string | null; // Toggl project ID (for time entries)
  timesheetRecipients: string[]; // Email addresses for timesheet notifications
  invoiceRecipients: string[]; // Email addresses for invoice notifications
  notes: string | null; // Optional notes/metadata
  portalToken: string | null; // JWT token for client portal access (~45 day expiry)
  contacts: Contact[]; // Legacy contacts (kept for compatibility)
  createdAt: Date;
  updatedAt: Date;
}

export interface Contact {
  id: string;
  clientId: string;
  name: string;
  email: string;
  role: 'approver' | 'billing' | 'both';
}

export interface Timesheet {
  id: string;
  clientId: string;
  month: string; // YYYY-MM format
  status: 'pending' | 'sent' | 'approved' | 'rejected';
  pdfUrl: string | null;
  totalHours: number;
  invoiceNumber: number | null; // Sequential ID assigned on creation, becomes invoice number
  sentAt: Date | null;
  approvedAt: Date | null;
  createdAt: Date;
}

export interface Invoice {
  id: string;
  clientId: string;
  timesheetId: string;
  invoiceNumber: string;
  month: string; // YYYY-MM format (denormalized from Timesheet for querying)
  amount: number;
  status: 'draft' | 'sent' | 'paid';
  pdfUrl: string | null;
  sentAt: Date | null;
  paidAt: Date | null;
  createdAt: Date;
}

