import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { createClient, createTimesheet, createInvoice } from '@/lib/db';
import { GET } from './route';

function createRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost'));
}

describe('GET /api/invoices', () => {
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

    const timesheet = await createTimesheet({
      clientId: client.id,
      month: '2024-01',
      status: 'approved',
      pdfUrl: null,
      totalHours: 40,
      invoiceNumber: 1001,
      sentAt: null,
      approvedAt: new Date(),
    });

    await createInvoice({
      clientId: client.id,
      timesheetId: timesheet.id,
      invoiceNumber: 'INV-1001',
      month: '2024-01',
      amount: 4000,
      status: 'draft',
      pdfUrl: null,
      sentAt: null,
      paidAt: null,
    });

    const request = createRequest('http://localhost/api/invoices');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.invoices).toHaveLength(1);
    expect(data.invoices[0].invoiceNumber).toBe('INV-1001');
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

    const ts1 = await createTimesheet({
      clientId: client1.id,
      month: '2024-01',
      status: 'approved',
      pdfUrl: null,
      totalHours: 40,
      invoiceNumber: 2001,
      sentAt: null,
      approvedAt: new Date(),
    });

    const ts2 = await createTimesheet({
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
      timesheetId: ts1.id,
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
      timesheetId: ts2.id,
      invoiceNumber: 'INV-2002',
      month: '2024-01',
      amount: 3000,
      status: 'draft',
      pdfUrl: null,
      sentAt: null,
      paidAt: null,
    });

    const request = createRequest(
      `http://localhost/api/invoices?clientId=${client1.id}`
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.invoices).toHaveLength(1);
    expect(data.invoices[0].invoiceNumber).toBe('INV-2001');
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

    const ts1 = await createTimesheet({
      clientId: client.id,
      month: '2024-02',
      status: 'approved',
      pdfUrl: null,
      totalHours: 40,
      invoiceNumber: 3001,
      sentAt: null,
      approvedAt: new Date(),
    });

    const ts2 = await createTimesheet({
      clientId: client.id,
      month: '2024-03',
      status: 'approved',
      pdfUrl: null,
      totalHours: 35,
      invoiceNumber: 3002,
      sentAt: null,
      approvedAt: new Date(),
    });

    await createInvoice({
      clientId: client.id,
      timesheetId: ts1.id,
      invoiceNumber: 'INV-3001',
      month: '2024-02',
      amount: 4000,
      status: 'draft',
      pdfUrl: null,
      sentAt: null,
      paidAt: null,
    });

    await createInvoice({
      clientId: client.id,
      timesheetId: ts2.id,
      invoiceNumber: 'INV-3002',
      month: '2024-03',
      amount: 3500,
      status: 'sent',
      pdfUrl: null,
      sentAt: new Date(),
      paidAt: null,
    });

    const request = createRequest('http://localhost/api/invoices?status=sent');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.invoices).toHaveLength(1);
    expect(data.invoices[0].invoiceNumber).toBe('INV-3002');
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
      month: '2024-04',
      status: 'approved',
      pdfUrl: null,
      totalHours: 40,
      invoiceNumber: 4001,
      sentAt: null,
      approvedAt: new Date(),
    });

    const ts2 = await createTimesheet({
      clientId: client1.id,
      month: '2024-05',
      status: 'approved',
      pdfUrl: null,
      totalHours: 35,
      invoiceNumber: 4002,
      sentAt: null,
      approvedAt: new Date(),
    });

    const ts3 = await createTimesheet({
      clientId: client2.id,
      month: '2024-04',
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
      month: '2024-04',
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
      month: '2024-05',
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
      month: '2024-04',
      amount: 3000,
      status: 'paid',
      pdfUrl: null,
      sentAt: new Date(),
      paidAt: new Date(),
    });

    const request = createRequest(
      `http://localhost/api/invoices?clientId=${client1.id}&status=paid`
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.invoices).toHaveLength(1);
    expect(data.invoices[0].invoiceNumber).toBe('INV-4001');
  });

  it('returns empty array when no invoices match filters', async () => {
    const request = createRequest(
      'http://localhost/api/invoices?clientId=non-existent'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.invoices).toEqual([]);
  });

  it('rejects invalid status', async () => {
    const request = createRequest(
      'http://localhost/api/invoices?status=invalid'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid status. Must be one of: draft, sent, paid');
  });
});
