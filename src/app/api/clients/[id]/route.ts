import { NextResponse } from 'next/server';
import {
  getClientById,
  updateClient,
  deleteClient,
} from '@/lib/db/mock-data';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/clients/[id] - Get a single client
export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const client = getClientById(id);

  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  return NextResponse.json({ client });
}

// PATCH /api/clients/[id] - Update a client
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = getClientById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const {
      name,
      togglProjectId,
      timesheetRecipients,
      invoiceRecipients,
      notes,
    } = body;

    // Validate email arrays if provided
    const validateEmails = (emails: unknown): string[] | undefined => {
      if (emails === undefined) return undefined;
      if (!Array.isArray(emails)) return [];
      return emails.filter(
        (e) => typeof e === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
      );
    };

    const updates: Parameters<typeof updateClient>[1] = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return NextResponse.json(
          { error: 'Client name cannot be empty' },
          { status: 400 }
        );
      }
      updates.name = name.trim();
    }

    if (togglProjectId !== undefined) {
      updates.togglProjectId = togglProjectId || null;
    }

    if (timesheetRecipients !== undefined) {
      const validated = validateEmails(timesheetRecipients);
      if (validated !== undefined) {
        updates.timesheetRecipients = validated;
      }
    }

    if (invoiceRecipients !== undefined) {
      const validated = validateEmails(invoiceRecipients);
      if (validated !== undefined) {
        updates.invoiceRecipients = validated;
      }
    }

    if (notes !== undefined) {
      updates.notes = notes || null;
    }

    const client = updateClient(id, updates);

    return NextResponse.json({ client });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to update client';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/clients/[id] - Delete a client
export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  const existing = getClientById(id);
  if (!existing) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  const deleted = deleteClient(id);

  if (!deleted) {
    return NextResponse.json(
      {
        error:
          'Cannot delete client with existing timesheets or invoices',
      },
      { status: 409 }
    );
  }

  return NextResponse.json({ success: true });
}
