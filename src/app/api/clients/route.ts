import { NextResponse } from 'next/server';
import { getClients } from '@/lib/db/mock-data';

// GET /api/clients - List all clients
export async function GET() {
  const clients = getClients();
  return NextResponse.json({ clients });
}

