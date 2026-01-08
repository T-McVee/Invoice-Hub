import { NextResponse } from 'next/server';
import { fetchClients } from '@/lib/toggl/client';

// GET /api/toggl/clients - Fetch clients from Toggl workspace
export async function GET() {
  try {
    const clients = await fetchClients();
    return NextResponse.json({ clients });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch Toggl clients';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
