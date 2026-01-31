import { NextRequest, NextResponse } from 'next/server';
import { listInvoices } from '@/lib/db';
import type { Invoice } from '@/types';

const VALID_STATUSES: Invoice['status'][] = ['draft', 'sent', 'paid'];

// GET /api/invoices - List invoices with optional filters
// Query params: clientId, status
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const clientId = searchParams.get('clientId');
  const status = searchParams.get('status');

  // Validate status if provided
  if (status && !VALID_STATUSES.includes(status as Invoice['status'])) {
    return NextResponse.json(
      { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
      { status: 400 }
    );
  }

  const invoices = await listInvoices({
    clientId: clientId || undefined,
    status: status as Invoice['status'] | undefined,
  });

  return NextResponse.json({ invoices });
}
