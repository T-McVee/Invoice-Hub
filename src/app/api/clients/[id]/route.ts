import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getClientById, updateClient, deleteClient } from '@/lib/db';

// Email validation schema using Zod for robust validation
const emailSchema = z.string().email();

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/clients/[id] - Get a single client
export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const client = await getClientById(id);

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

    const existing = await getClientById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const { name, togglProjectId, timesheetRecipients, invoiceRecipients, notes } = body;

    // Validate email arrays if provided using Zod for robust validation
    // Returns { valid: string[], invalid: string[] } or undefined if not provided
    const validateEmails = (
      emails: unknown
    ): { valid: string[]; invalid: string[] } | undefined => {
      if (emails === undefined) return undefined;
      if (!Array.isArray(emails)) return { valid: [], invalid: [] };

      const valid: string[] = [];
      const invalid: string[] = [];

      for (const e of emails) {
        if (typeof e !== 'string') continue;
        const trimmed = e.trim();
        if (!trimmed) continue;
        if (emailSchema.safeParse(trimmed).success) {
          valid.push(trimmed);
        } else {
          invalid.push(trimmed);
        }
      }

      return { valid, invalid };
    };

    // Validate emails first and check for invalid ones
    const timesheetEmailResult = validateEmails(timesheetRecipients);
    const invoiceEmailResult = validateEmails(invoiceRecipients);

    const allInvalidEmails = [
      ...(timesheetEmailResult?.invalid ?? []),
      ...(invoiceEmailResult?.invalid ?? []),
    ];

    if (allInvalidEmails.length > 0) {
      return NextResponse.json(
        {
          error: 'Invalid email address(es) provided',
          invalidEmails: allInvalidEmails,
        },
        { status: 400 }
      );
    }

    const updates: Parameters<typeof updateClient>[1] = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return NextResponse.json({ error: 'Client name cannot be empty' }, { status: 400 });
      }
      updates.name = name.trim();
    }

    if (togglProjectId !== undefined) {
      updates.togglProjectId = togglProjectId || null;
    }

    if (timesheetEmailResult !== undefined) {
      updates.timesheetRecipients = timesheetEmailResult.valid;
    }

    if (invoiceEmailResult !== undefined) {
      updates.invoiceRecipients = invoiceEmailResult.valid;
    }

    if (notes !== undefined) {
      updates.notes = notes || null;
    }

    const client = await updateClient(id, updates);

    return NextResponse.json({ client });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update client';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/clients/[id] - Delete a client
export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  const existing = await getClientById(id);
  if (!existing) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  const deleted = await deleteClient(id);

  if (!deleted) {
    return NextResponse.json(
      {
        error: 'Cannot delete client with existing timesheets or invoices',
      },
      { status: 409 }
    );
  }

  return NextResponse.json({ success: true });
}
