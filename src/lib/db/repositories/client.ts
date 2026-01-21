/**
 * Client repository - database-backed CRUD operations
 */

import { prisma } from '../prisma';
import type { Client, Contact } from '@/types';
import type { ClientModel as PrismaClient, ContactModel as PrismaContact } from '@/generated/prisma/models';

/**
 * Transform Prisma Client to application Client type
 */
function toClient(
  prismaClient: PrismaClient & { contacts?: PrismaContact[] }
): Client {
  return {
    id: prismaClient.id,
    name: prismaClient.name,
    togglClientId: prismaClient.togglClientId,
    togglProjectId: prismaClient.togglProjectId,
    timesheetRecipients: JSON.parse(prismaClient.timesheetRecipients),
    invoiceRecipients: JSON.parse(prismaClient.invoiceRecipients),
    notes: prismaClient.notes,
    portalToken: prismaClient.portalToken,
    contacts: (prismaClient.contacts ?? []).map((c) => ({
      id: c.id,
      clientId: c.clientId,
      name: c.name,
      email: c.email,
      role: c.role as Contact['role'],
    })),
    createdAt: prismaClient.createdAt,
    updatedAt: prismaClient.updatedAt,
  };
}

/**
 * Get all clients, sorted by creation date (newest first)
 */
export async function getClients(): Promise<Client[]> {
  const clients = await prisma.client.findMany({
    include: { contacts: true },
    orderBy: { createdAt: 'desc' },
  });
  return clients.map(toClient);
}

/**
 * Get a client by ID
 */
export async function getClientById(id: string): Promise<Client | undefined> {
  const client = await prisma.client.findUnique({
    where: { id },
    include: { contacts: true },
  });
  return client ? toClient(client) : undefined;
}

/**
 * Get a client by Toggl client ID
 */
export async function getClientByTogglClientId(
  togglClientId: string
): Promise<Client | undefined> {
  const client = await prisma.client.findUnique({
    where: { togglClientId },
    include: { contacts: true },
  });
  return client ? toClient(client) : undefined;
}

/**
 * Create a new client
 */
export async function createClient(
  data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Client> {
  const { contacts, ...clientData } = data;

  const client = await prisma.client.create({
    data: {
      name: clientData.name,
      togglClientId: clientData.togglClientId,
      togglProjectId: clientData.togglProjectId,
      timesheetRecipients: JSON.stringify(clientData.timesheetRecipients),
      invoiceRecipients: JSON.stringify(clientData.invoiceRecipients),
      notes: clientData.notes,
      contacts: {
        create: contacts.map((c) => ({
          name: c.name,
          email: c.email,
          role: c.role,
        })),
      },
    },
    include: { contacts: true },
  });

  return toClient(client);
}

/**
 * Update an existing client
 */
export async function updateClient(
  id: string,
  updates: Partial<Omit<Client, 'id' | 'createdAt'>>
): Promise<Client | undefined> {
  const existing = await prisma.client.findUnique({ where: { id } });
  if (!existing) return undefined;

  const { contacts, ...updateData } = updates;

  const data: Parameters<typeof prisma.client.update>[0]['data'] = {};

  if (updateData.name !== undefined) data.name = updateData.name;
  if (updateData.togglClientId !== undefined)
    data.togglClientId = updateData.togglClientId;
  if (updateData.togglProjectId !== undefined)
    data.togglProjectId = updateData.togglProjectId;
  if (updateData.timesheetRecipients !== undefined)
    data.timesheetRecipients = JSON.stringify(updateData.timesheetRecipients);
  if (updateData.invoiceRecipients !== undefined)
    data.invoiceRecipients = JSON.stringify(updateData.invoiceRecipients);
  if (updateData.notes !== undefined) data.notes = updateData.notes;

  // Handle contacts update if provided
  if (contacts !== undefined) {
    // Delete existing contacts and create new ones
    await prisma.contact.deleteMany({ where: { clientId: id } });
    if (contacts.length > 0) {
      await prisma.contact.createMany({
        data: contacts.map((c) => ({
          clientId: id,
          name: c.name,
          email: c.email,
          role: c.role,
        })),
      });
    }
  }

  const client = await prisma.client.update({
    where: { id },
    data,
    include: { contacts: true },
  });

  return toClient(client);
}

/**
 * Delete a client (fails if client has associated timesheets)
 */
export async function deleteClient(id: string): Promise<boolean> {
  // Check if client has associated timesheets
  const timesheetCount = await prisma.timesheet.count({
    where: { clientId: id },
  });

  if (timesheetCount > 0) {
    return false; // Cannot delete client with timesheets
  }

  try {
    await prisma.client.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

/**
 * Update a client's portal token
 */
export async function updateClientPortalToken(
  id: string,
  portalToken: string
): Promise<Client | undefined> {
  const existing = await prisma.client.findUnique({ where: { id } });
  if (!existing) return undefined;

  const client = await prisma.client.update({
    where: { id },
    data: { portalToken },
    include: { contacts: true },
  });

  return toClient(client);
}
