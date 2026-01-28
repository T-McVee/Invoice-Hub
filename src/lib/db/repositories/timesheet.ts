/**
 * Timesheet repository - database-backed CRUD operations
 */

import { prisma } from '../prisma';
import type { Timesheet } from '@/types';
import type { TimesheetModel as PrismaTimesheet } from '@/generated/prisma/models';

/**
 * Transform Prisma Timesheet to application Timesheet type
 */
function toTimesheet(prismaTimesheet: PrismaTimesheet): Timesheet {
  return {
    id: prismaTimesheet.id,
    clientId: prismaTimesheet.clientId,
    month: prismaTimesheet.month,
    status: prismaTimesheet.status as Timesheet['status'],
    pdfUrl: prismaTimesheet.pdfUrl,
    totalHours: prismaTimesheet.totalHours,
    invoiceNumber: prismaTimesheet.invoiceNumber,
    sentAt: prismaTimesheet.sentAt,
    approvedAt: prismaTimesheet.approvedAt,
    createdAt: prismaTimesheet.createdAt,
  };
}

/**
 * Get all timesheets, sorted by creation date (newest first)
 */
export async function getTimesheets(): Promise<Timesheet[]> {
  const timesheets = await prisma.timesheet.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return timesheets.map(toTimesheet);
}

/**
 * Get a timesheet by ID
 */
export async function getTimesheetById(
  id: string
): Promise<Timesheet | undefined> {
  const timesheet = await prisma.timesheet.findUnique({
    where: { id },
  });
  return timesheet ? toTimesheet(timesheet) : undefined;
}

/**
 * Get a timesheet by client ID and month
 */
export async function getTimesheetByClientAndMonth(
  clientId: string,
  month: string
): Promise<Timesheet | undefined> {
  const timesheet = await prisma.timesheet.findUnique({
    where: {
      clientId_month: { clientId, month },
    },
  });
  return timesheet ? toTimesheet(timesheet) : undefined;
}

/**
 * Get all timesheets for a specific client
 */
export async function getTimesheetsByClientId(
  clientId: string
): Promise<Timesheet[]> {
  const timesheets = await prisma.timesheet.findMany({
    where: { clientId },
    orderBy: { createdAt: 'desc' },
  });
  return timesheets.map(toTimesheet);
}

/**
 * Create a new timesheet
 */
export async function createTimesheet(
  data: Omit<Timesheet, 'id' | 'createdAt'>
): Promise<Timesheet> {
  const timesheet = await prisma.timesheet.create({
    data: {
      clientId: data.clientId,
      month: data.month,
      status: data.status,
      pdfUrl: data.pdfUrl,
      totalHours: data.totalHours,
      invoiceNumber: data.invoiceNumber,
      sentAt: data.sentAt,
      approvedAt: data.approvedAt,
    },
  });

  return toTimesheet(timesheet);
}

/**
 * Update an existing timesheet
 */
export async function updateTimesheet(
  id: string,
  updates: Partial<Timesheet>
): Promise<Timesheet | undefined> {
  const existing = await prisma.timesheet.findUnique({ where: { id } });
  if (!existing) return undefined;

  const data: Parameters<typeof prisma.timesheet.update>[0]['data'] = {};

  if (updates.clientId !== undefined) data.clientId = updates.clientId;
  if (updates.month !== undefined) data.month = updates.month;
  if (updates.status !== undefined) data.status = updates.status;
  if (updates.pdfUrl !== undefined) data.pdfUrl = updates.pdfUrl;
  if (updates.totalHours !== undefined) data.totalHours = updates.totalHours;
  if (updates.invoiceNumber !== undefined)
    data.invoiceNumber = updates.invoiceNumber;
  if (updates.sentAt !== undefined) data.sentAt = updates.sentAt;
  if (updates.approvedAt !== undefined) data.approvedAt = updates.approvedAt;

  const timesheet = await prisma.timesheet.update({
    where: { id },
    data,
  });

  return toTimesheet(timesheet);
}

/**
 * Delete a timesheet by ID
 */
export async function deleteTimesheet(id: string): Promise<boolean> {
  try {
    await prisma.timesheet.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
