/**
 * Invoice repository - database-backed CRUD operations
 */

import { prisma } from '../prisma';
import type { Invoice } from '@/types';
import type { InvoiceModel as PrismaInvoice } from '@/generated/prisma/models';

/**
 * Transform Prisma Invoice to application Invoice type
 */
function toInvoice(prismaInvoice: PrismaInvoice): Invoice {
  return {
    id: prismaInvoice.id,
    clientId: prismaInvoice.clientId,
    timesheetId: prismaInvoice.timesheetId,
    invoiceNumber: prismaInvoice.invoiceNumber,
    amount: prismaInvoice.amount,
    status: prismaInvoice.status as Invoice['status'],
    pdfUrl: prismaInvoice.pdfUrl,
    sentAt: prismaInvoice.sentAt,
    paidAt: prismaInvoice.paidAt,
    createdAt: prismaInvoice.createdAt,
  };
}

/**
 * Get all invoices, sorted by creation date (newest first)
 */
export async function getInvoices(): Promise<Invoice[]> {
  const invoices = await prisma.invoice.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return invoices.map(toInvoice);
}

/**
 * Get an invoice by ID
 */
export async function getInvoiceById(id: string): Promise<Invoice | undefined> {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
  });
  return invoice ? toInvoice(invoice) : undefined;
}

/**
 * Get invoices by client ID
 */
export async function getInvoicesByClientId(
  clientId: string
): Promise<Invoice[]> {
  const invoices = await prisma.invoice.findMany({
    where: { clientId },
    orderBy: { createdAt: 'desc' },
  });
  return invoices.map(toInvoice);
}

/**
 * Create a new invoice
 */
export async function createInvoice(
  data: Omit<Invoice, 'id' | 'createdAt'>
): Promise<Invoice> {
  const invoice = await prisma.invoice.create({
    data: {
      clientId: data.clientId,
      timesheetId: data.timesheetId,
      invoiceNumber: data.invoiceNumber,
      amount: data.amount,
      status: data.status,
      pdfUrl: data.pdfUrl,
      sentAt: data.sentAt,
      paidAt: data.paidAt,
    },
  });

  return toInvoice(invoice);
}

/**
 * Update an existing invoice
 */
export async function updateInvoice(
  id: string,
  updates: Partial<Invoice>
): Promise<Invoice | undefined> {
  const existing = await prisma.invoice.findUnique({ where: { id } });
  if (!existing) return undefined;

  const data: Parameters<typeof prisma.invoice.update>[0]['data'] = {};

  if (updates.clientId !== undefined) data.clientId = updates.clientId;
  if (updates.timesheetId !== undefined)
    data.timesheetId = updates.timesheetId;
  if (updates.invoiceNumber !== undefined)
    data.invoiceNumber = updates.invoiceNumber;
  if (updates.amount !== undefined) data.amount = updates.amount;
  if (updates.status !== undefined) data.status = updates.status;
  if (updates.pdfUrl !== undefined) data.pdfUrl = updates.pdfUrl;
  if (updates.sentAt !== undefined) data.sentAt = updates.sentAt;
  if (updates.paidAt !== undefined) data.paidAt = updates.paidAt;

  const invoice = await prisma.invoice.update({
    where: { id },
    data,
  });

  return toInvoice(invoice);
}
