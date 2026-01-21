import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getClients, createClient, getClientByTogglClientId } from '@/lib/db';

// Email validation schema using Zod for robust validation
const emailSchema = z.string().email();

// GET /api/clients - List all clients
export async function GET() {
  const clients = await getClients();
  return NextResponse.json({ clients });
}

// POST /api/clients - Create a new client
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, togglClientId, togglProjectId, timesheetRecipients, invoiceRecipients, notes } =
      body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'Client name is required' }, { status: 400 });
    }

    // Check if client with same Toggl client ID already exists
    if (togglClientId) {
      const existing = await getClientByTogglClientId(togglClientId);
      if (existing) {
        return NextResponse.json(
          { error: 'A client with this Toggl client ID already exists' },
          { status: 409 }
        );
      }
    }

    // Validate email arrays using Zod for robust validation
    // Returns { valid: string[], invalid: string[] }
    const validateEmails = (emails: unknown): { valid: string[]; invalid: string[] } => {
      if (!emails) return { valid: [], invalid: [] };
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

    // Check for invalid emails and reject if any found
    const timesheetEmailResult = validateEmails(timesheetRecipients);
    const invoiceEmailResult = validateEmails(invoiceRecipients);

    const allInvalidEmails = [...timesheetEmailResult.invalid, ...invoiceEmailResult.invalid];

    if (allInvalidEmails.length > 0) {
      return NextResponse.json(
        {
          error: 'Invalid email address(es) provided',
          invalidEmails: allInvalidEmails,
        },
        { status: 400 }
      );
    }

    const client = await createClient({
      name: name.trim(),
      togglClientId: togglClientId || null,
      togglProjectId: togglProjectId || null,
      timesheetRecipients: timesheetEmailResult.valid,
      invoiceRecipients: invoiceEmailResult.valid,
      notes: notes || null,
      portalToken: null,
      contacts: [],
    });

    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create client';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
