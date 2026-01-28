import { describe, it, expect } from 'vitest';
import {
  createTimesheet,
  getTimesheets,
  getTimesheetById,
  getTimesheetByClientAndMonth,
  getTimesheetsByClientId,
  updateTimesheet,
  deleteTimesheet,
  createClient,
} from '@/lib/db';

describe('timesheet repository', () => {
  describe('createTimesheet', () => {
    it('creates a timesheet with invoiceNumber', async () => {
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

      const timesheet = await createTimesheet({
        clientId: client.id,
        month: '2024-01',
        status: 'pending',
        pdfUrl: null,
        totalHours: 40,
        invoiceNumber: 1001,
        sentAt: null,
        approvedAt: null,
      });

      expect(timesheet.invoiceNumber).toBe(1001);
      expect(timesheet.clientId).toBe(client.id);
      expect(timesheet.month).toBe('2024-01');
    });

    it('creates a timesheet with null invoiceNumber', async () => {
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

      const timesheet = await createTimesheet({
        clientId: client.id,
        month: '2024-02',
        status: 'pending',
        pdfUrl: null,
        totalHours: 35,
        invoiceNumber: null,
        sentAt: null,
        approvedAt: null,
      });

      expect(timesheet.invoiceNumber).toBeNull();
    });
  });

  describe('getTimesheets', () => {
    it('returns timesheets with invoiceNumber', async () => {
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

      await createTimesheet({
        clientId: client.id,
        month: '2024-01',
        status: 'pending',
        pdfUrl: null,
        totalHours: 40,
        invoiceNumber: 1001,
        sentAt: null,
        approvedAt: null,
      });

      await createTimesheet({
        clientId: client.id,
        month: '2024-02',
        status: 'approved',
        pdfUrl: '/path/to/pdf',
        totalHours: 35,
        invoiceNumber: 1002,
        sentAt: new Date(),
        approvedAt: new Date(),
      });

      const timesheets = await getTimesheets();

      expect(timesheets).toHaveLength(2);
      expect(timesheets.map((t) => t.invoiceNumber).sort()).toEqual([1001, 1002]);
    });
  });

  describe('getTimesheetById', () => {
    it('returns timesheet with invoiceNumber', async () => {
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

      const created = await createTimesheet({
        clientId: client.id,
        month: '2024-01',
        status: 'pending',
        pdfUrl: null,
        totalHours: 40,
        invoiceNumber: 1001,
        sentAt: null,
        approvedAt: null,
      });

      const retrieved = await getTimesheetById(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved!.invoiceNumber).toBe(1001);
    });

    it('returns undefined for non-existent timesheet', async () => {
      const result = await getTimesheetById('non-existent-id');
      expect(result).toBeUndefined();
    });
  });

  describe('getTimesheetByClientAndMonth', () => {
    it('returns timesheet with invoiceNumber', async () => {
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

      await createTimesheet({
        clientId: client.id,
        month: '2024-03',
        status: 'sent',
        pdfUrl: '/path/to/pdf',
        totalHours: 45,
        invoiceNumber: 1003,
        sentAt: new Date(),
        approvedAt: null,
      });

      const retrieved = await getTimesheetByClientAndMonth(client.id, '2024-03');

      expect(retrieved).toBeDefined();
      expect(retrieved!.invoiceNumber).toBe(1003);
    });
  });

  describe('getTimesheetsByClientId', () => {
    it('returns client timesheets with invoiceNumbers', async () => {
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

      await createTimesheet({
        clientId: client1.id,
        month: '2024-01',
        status: 'pending',
        pdfUrl: null,
        totalHours: 40,
        invoiceNumber: 1001,
        sentAt: null,
        approvedAt: null,
      });

      await createTimesheet({
        clientId: client1.id,
        month: '2024-02',
        status: 'approved',
        pdfUrl: null,
        totalHours: 35,
        invoiceNumber: 1002,
        sentAt: null,
        approvedAt: null,
      });

      await createTimesheet({
        clientId: client2.id,
        month: '2024-01',
        status: 'pending',
        pdfUrl: null,
        totalHours: 20,
        invoiceNumber: 1003,
        sentAt: null,
        approvedAt: null,
      });

      const client1Timesheets = await getTimesheetsByClientId(client1.id);

      expect(client1Timesheets).toHaveLength(2);
      expect(client1Timesheets.map((t) => t.invoiceNumber).sort()).toEqual([1001, 1002]);
    });
  });

  describe('updateTimesheet', () => {
    it('updates invoiceNumber', async () => {
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

      const created = await createTimesheet({
        clientId: client.id,
        month: '2024-01',
        status: 'pending',
        pdfUrl: null,
        totalHours: 40,
        invoiceNumber: null,
        sentAt: null,
        approvedAt: null,
      });

      expect(created.invoiceNumber).toBeNull();

      const updated = await updateTimesheet(created.id, { invoiceNumber: 1001 });

      expect(updated).toBeDefined();
      expect(updated!.invoiceNumber).toBe(1001);
    });

    it('preserves invoiceNumber when updating other fields', async () => {
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

      const created = await createTimesheet({
        clientId: client.id,
        month: '2024-01',
        status: 'pending',
        pdfUrl: null,
        totalHours: 40,
        invoiceNumber: 1001,
        sentAt: null,
        approvedAt: null,
      });

      const updated = await updateTimesheet(created.id, {
        status: 'approved',
        approvedAt: new Date(),
      });

      expect(updated).toBeDefined();
      expect(updated!.invoiceNumber).toBe(1001);
      expect(updated!.status).toBe('approved');
    });

    it('returns undefined for non-existent timesheet', async () => {
      const result = await updateTimesheet('non-existent-id', { invoiceNumber: 1001 });
      expect(result).toBeUndefined();
    });
  });

  describe('deleteTimesheet', () => {
    it('deletes a timesheet', async () => {
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

      const created = await createTimesheet({
        clientId: client.id,
        month: '2024-01',
        status: 'pending',
        pdfUrl: null,
        totalHours: 40,
        invoiceNumber: 1001,
        sentAt: null,
        approvedAt: null,
      });

      const deleted = await deleteTimesheet(created.id);
      expect(deleted).toBe(true);

      const retrieved = await getTimesheetById(created.id);
      expect(retrieved).toBeUndefined();
    });

    it('returns false for non-existent timesheet', async () => {
      const result = await deleteTimesheet('non-existent-id');
      expect(result).toBe(false);
    });
  });
});
