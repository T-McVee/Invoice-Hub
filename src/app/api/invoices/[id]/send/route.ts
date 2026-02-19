import { NextResponse } from 'next/server';
import { getInvoiceById, getClientById, updateInvoice } from '@/lib/db';
import { sendInvoiceEmail } from '@/lib/email/send-invoice';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/invoices/[id]/send - Manually send or resend an invoice email
export async function POST(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  const invoice = await getInvoiceById(id);
  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }

  const client = await getClientById(invoice.clientId);
  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  const result = await sendInvoiceEmail(client, invoice);

  if (result.status === 'skipped') {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  if (result.status === 'failed') {
    return NextResponse.json({ error: result.error ?? 'Email send failed' }, { status: 502 });
  }

  // Update invoice status to sent
  const updated = await updateInvoice(id, { status: 'sent', sentAt: new Date() });

  return NextResponse.json({ invoice: updated });
}
