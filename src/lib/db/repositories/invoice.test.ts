import { describe, it, expect, vi } from 'vitest';
import {
  createClient,
  createTimesheet,
  createInvoice,
  listInvoices,
} from '@/lib/db';

describe('invoice repository', () => {
  describe('listInvoices', () => {
    it('returns all invoices when no filters provided', async () => {
      const client = await createClient({
        name: 'Test Client',
        togglClientId: null,
        togglProjectId: 'proj-123',
        timesheetRecipients: [],
        invoiceRecipients: [],
        notes: null,
        portalToken: null,
        contacts: [],
      });

      const timesheet1 = await createTimesheet({
        clientId: client.id,
        month: '2024-01',
        status: 'approved',
        pdfUrl: null,
        totalHours: 40,
        invoiceNumber: 1001,
        sentAt: null,
        approvedAt: new Date(),
      });

      const timesheet2 = await createTimesheet({
        clientId: client.id,
        month: '2024-02',
        status: 'approved',
        pdfUrl: null,
        totalHours: 35,
        invoiceNumber: 1002,
        sentAt: null,
        approvedAt: new Date(),
      });

      await createInvoice({
        clientId: client.id,
        timesheetId: timesheet1.id,
        invoiceNumber: 'INV-1001',
        month: '2024-01',
        amount: 4000,
        status: 'draft',
        pdfUrl: null,
        sentAt: null,
        paidAt: null,
      });

      await createInvoice({
        clientId: client.id,
        timesheetId: timesheet2.id,
        invoiceNumber: 'INV-1002',
        month: '2024-02',
        amount: 3500,
        status: 'sent',
        pdfUrl: null,
        sentAt: new Date(),
        paidAt: null,
      });

      const invoices = await listInvoices();

      expect(invoices).toHaveLength(2);
      expect(invoices.map((i) => i.invoiceNumber).sort()).toEqual([
        'INV-1001',
        'INV-1002',
      ]);
    });

    it('filters by clientId', async () => {
      const client1 = await createClient({
        name: 'Client 1',
        togglClientId: null,
        togglProjectId: 'proj-1',
        timesheetRecipients: [],
        invoiceRecipients: [],
        notes: null,
        portalToken: null,
        contacts: [],
      });

      const client2 = await createClient({
        name: 'Client 2',
        togglClientId: null,
        togglProjectId: 'proj-2',
        timesheetRecipients: [],
        invoiceRecipients: [],
        notes: null,
        portalToken: null,
        contacts: [],
      });

      const timesheet1 = await createTimesheet({
        clientId: client1.id,
        month: '2024-01',
        status: 'approved',
        pdfUrl: null,
        totalHours: 40,
        invoiceNumber: 2001,
        sentAt: null,
        approvedAt: new Date(),
      });

      const timesheet2 = await createTimesheet({
        clientId: client2.id,
        month: '2024-01',
        status: 'approved',
        pdfUrl: null,
        totalHours: 30,
        invoiceNumber: 2002,
        sentAt: null,
        approvedAt: new Date(),
      });

      await createInvoice({
        clientId: client1.id,
        timesheetId: timesheet1.id,
        invoiceNumber: 'INV-2001',
        month: '2024-01',
        amount: 4000,
        status: 'draft',
        pdfUrl: null,
        sentAt: null,
        paidAt: null,
      });

      await createInvoice({
        clientId: client2.id,
        timesheetId: timesheet2.id,
        invoiceNumber: 'INV-2002',
        month: '2024-01',
        amount: 3000,
        status: 'draft',
        pdfUrl: null,
        sentAt: null,
        paidAt: null,
      });

      const client1Invoices = await listInvoices({ clientId: client1.id });

      expect(client1Invoices).toHaveLength(1);
      expect(client1Invoices[0].invoiceNumber).toBe('INV-2001');
    });

    it('filters by status', async () => {
      const client = await createClient({
        name: 'Test Client',
        togglClientId: null,
        togglProjectId: 'proj-123',
        timesheetRecipients: [],
        invoiceRecipients: [],
        notes: null,
        portalToken: null,
        contacts: [],
      });

      const timesheet1 = await createTimesheet({
        clientId: client.id,
        month: '2024-03',
        status: 'approved',
        pdfUrl: null,
        totalHours: 40,
        invoiceNumber: 3001,
        sentAt: null,
        approvedAt: new Date(),
      });

      const timesheet2 = await createTimesheet({
        clientId: client.id,
        month: '2024-04',
        status: 'approved',
        pdfUrl: null,
        totalHours: 35,
        invoiceNumber: 3002,
        sentAt: null,
        approvedAt: new Date(),
      });

      const timesheet3 = await createTimesheet({
        clientId: client.id,
        month: '2024-05',
        status: 'approved',
        pdfUrl: null,
        totalHours: 38,
        invoiceNumber: 3003,
        sentAt: null,
        approvedAt: new Date(),
      });

      await createInvoice({
        clientId: client.id,
        timesheetId: timesheet1.id,
        invoiceNumber: 'INV-3001',
        month: '2024-03',
        amount: 4000,
        status: 'draft',
        pdfUrl: null,
        sentAt: null,
        paidAt: null,
      });

      await createInvoice({
        clientId: client.id,
        timesheetId: timesheet2.id,
        invoiceNumber: 'INV-3002',
        month: '2024-04',
        amount: 3500,
        status: 'sent',
        pdfUrl: null,
        sentAt: new Date(),
        paidAt: null,
      });

      await createInvoice({
        clientId: client.id,
        timesheetId: timesheet3.id,
        invoiceNumber: 'INV-3003',
        month: '2024-05',
        amount: 3800,
        status: 'paid',
        pdfUrl: null,
        sentAt: new Date(),
        paidAt: new Date(),
      });

      const sentInvoices = await listInvoices({ status: 'sent' });

      expect(sentInvoices).toHaveLength(1);
      expect(sentInvoices[0].invoiceNumber).toBe('INV-3002');
    });

    it('filters by both clientId and status', async () => {
      const client1 = await createClient({
        name: 'Client A',
        togglClientId: null,
        togglProjectId: 'proj-a',
        timesheetRecipients: [],
        invoiceRecipients: [],
        notes: null,
        portalToken: null,
        contacts: [],
      });

      const client2 = await createClient({
        name: 'Client B',
        togglClientId: null,
        togglProjectId: 'proj-b',
        timesheetRecipients: [],
        invoiceRecipients: [],
        notes: null,
        portalToken: null,
        contacts: [],
      });

      const ts1 = await createTimesheet({
        clientId: client1.id,
        month: '2024-06',
        status: 'approved',
        pdfUrl: null,
        totalHours: 40,
        invoiceNumber: 4001,
        sentAt: null,
        approvedAt: new Date(),
      });

      const ts2 = await createTimesheet({
        clientId: client1.id,
        month: '2024-07',
        status: 'approved',
        pdfUrl: null,
        totalHours: 35,
        invoiceNumber: 4002,
        sentAt: null,
        approvedAt: new Date(),
      });

      const ts3 = await createTimesheet({
        clientId: client2.id,
        month: '2024-06',
        status: 'approved',
        pdfUrl: null,
        totalHours: 30,
        invoiceNumber: 4003,
        sentAt: null,
        approvedAt: new Date(),
      });

      await createInvoice({
        clientId: client1.id,
        timesheetId: ts1.id,
        invoiceNumber: 'INV-4001',
        month: '2024-06',
        amount: 4000,
        status: 'paid',
        pdfUrl: null,
        sentAt: new Date(),
        paidAt: new Date(),
      });

      await createInvoice({
        clientId: client1.id,
        timesheetId: ts2.id,
        invoiceNumber: 'INV-4002',
        month: '2024-07',
        amount: 3500,
        status: 'draft',
        pdfUrl: null,
        sentAt: null,
        paidAt: null,
      });

      await createInvoice({
        clientId: client2.id,
        timesheetId: ts3.id,
        invoiceNumber: 'INV-4003',
        month: '2024-06',
        amount: 3000,
        status: 'paid',
        pdfUrl: null,
        sentAt: new Date(),
        paidAt: new Date(),
      });

      const client1PaidInvoices = await listInvoices({
        clientId: client1.id,
        status: 'paid',
      });

      expect(client1PaidInvoices).toHaveLength(1);
      expect(client1PaidInvoices[0].invoiceNumber).toBe('INV-4001');
    });

    it('returns empty array when no invoices match filters', async () => {
      const invoices = await listInvoices({ clientId: 'non-existent-id' });
      expect(invoices).toEqual([]);
    });

    it('returns invoices sorted by creation date (newest first)', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-01T10:00:00Z'));

      const client = await createClient({
        name: 'Test Client',
        togglClientId: null,
        togglProjectId: 'proj-123',
        timesheetRecipients: [],
        invoiceRecipients: [],
        notes: null,
        portalToken: null,
        contacts: [],
      });

      const ts1 = await createTimesheet({
        clientId: client.id,
        month: '2024-08',
        status: 'approved',
        pdfUrl: null,
        totalHours: 40,
        invoiceNumber: 5001,
        sentAt: null,
        approvedAt: new Date(),
      });

      const ts2 = await createTimesheet({
        clientId: client.id,
        month: '2024-09',
        status: 'approved',
        pdfUrl: null,
        totalHours: 35,
        invoiceNumber: 5002,
        sentAt: null,
        approvedAt: new Date(),
      });

      // Create first invoice at 10:00
      await createInvoice({
        clientId: client.id,
        timesheetId: ts1.id,
        invoiceNumber: 'INV-5001',
        month: '2024-08',
        amount: 4000,
        status: 'draft',
        pdfUrl: null,
        sentAt: null,
        paidAt: null,
      });

      // Advance time by 1 hour
      vi.setSystemTime(new Date('2024-01-01T11:00:00Z'));

      // Create second invoice at 11:00 (should appear first in results)
      await createInvoice({
        clientId: client.id,
        timesheetId: ts2.id,
        invoiceNumber: 'INV-5002',
        month: '2024-09',
        amount: 3500,
        status: 'draft',
        pdfUrl: null,
        sentAt: null,
        paidAt: null,
      });

      const invoices = await listInvoices({ clientId: client.id });

      expect(invoices).toHaveLength(2);
      // Newest first
      expect(invoices[0].invoiceNumber).toBe('INV-5002');
      expect(invoices[1].invoiceNumber).toBe('INV-5001');

      vi.useRealTimers();
    });
  });
});
