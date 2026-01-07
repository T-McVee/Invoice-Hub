// Shared TypeScript types

export interface Client {
  id: string;
  name: string;
  togglProjectId: string;
  contacts: Contact[];
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
  sentAt: Date | null;
  approvedAt: Date | null;
  createdAt: Date;
}

export interface Invoice {
  id: string;
  clientId: string;
  timesheetId: string;
  invoiceNumber: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid';
  pdfUrl: string | null;
  sentAt: Date | null;
  paidAt: Date | null;
  createdAt: Date;
}

