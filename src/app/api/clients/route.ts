import { NextResponse } from 'next/server';
import { getClients, createClient, getClientByTogglClientId } from '@/lib/db/mock-data';

// GET /api/clients - List all clients
export async function GET() {
  const clients = getClients();
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
      const existing = getClientByTogglClientId(togglClientId);
      if (existing) {
        return NextResponse.json(
          { error: 'A client with this Toggl client ID already exists' },
          { status: 409 }
        );
      }
    }

    // Validate email arrays
    const validateEmails = (emails: unknown): string[] => {
      if (!emails) return [];
      if (!Array.isArray(emails)) return [];
      return emails.filter((e) => typeof e === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
    };

    const client = createClient({
      name: name.trim(),
      togglClientId: togglClientId || null,
      togglProjectId: togglProjectId || null,
      timesheetRecipients: validateEmails(timesheetRecipients),
      invoiceRecipients: validateEmails(invoiceRecipients),
      notes: notes || null,
      contacts: [],
    });

    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create client';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
