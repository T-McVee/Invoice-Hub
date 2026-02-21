import { NextResponse } from 'next/server';
import { verifyPortalToken } from '@/lib/auth/jwt';
import { getTimesheetById, updateTimesheet, getClientById, createInvoice, updateInvoice } from '@/lib/db';
import { generateInvoice } from '@/lib/invoice-generator';
import { sendInvoiceEmail } from '@/lib/email/send-invoice';

interface RouteParams {
  params: Promise<{ token: string; id: string }>;
}

// POST /api/portal/[token]/timesheets/[id]/approve - Approve a timesheet
export async function POST(_request: Request, { params }: RouteParams) {
  const { token, id } = await params;

  try {
    // Validate JWT token
    const payload = verifyPortalToken(token);

    // Fetch timesheet
    const timesheet = await getTimesheetById(id);
    if (!timesheet) {
      return NextResponse.json({ error: 'Timesheet not found' }, { status: 404 });
    }

    // Verify timesheet belongs to the client from token
    if (timesheet.clientId !== payload.clientId) {
      return NextResponse.json(
        { error: 'Not authorized to approve this timesheet' },
        { status: 403 }
      );
    }

    // Check timesheet can be approved (must be pending or sent)
    if (timesheet.status === 'approved') {
      return NextResponse.json({ error: 'Timesheet is already approved' }, { status: 400 });
    }

    if (timesheet.status === 'rejected') {
      return NextResponse.json({ error: 'Cannot approve a rejected timesheet' }, { status: 400 });
    }

    // Update timesheet status to approved
    const updated = await updateTimesheet(id, {
      status: 'approved',
      approvedAt: new Date(),
    });

    // Generate invoice (fail-open: approval succeeds even if invoice fails)
    let invoice = null;
    let invoiceError = null;

    try {
      // Validate that timesheet has an invoice number
      if (!timesheet.invoiceNumber) {
        throw new Error('Timesheet does not have an invoice number');
      }

      // Fetch client data for invoice
      const client = await getClientById(timesheet.clientId);
      if (!client) {
        throw new Error('Client not found');
      }

      // Generate invoice PDF and upload to blob storage
      const generatedInvoice = await generateInvoice({
        invoiceNumber: String(timesheet.invoiceNumber),
        month: timesheet.month,
        totalHours: timesheet.totalHours,
        client: {
          id: client.id,
          name: client.name,
          billingAddress: client.billingAddress,
        },
      });

      // Create invoice record in database
      invoice = await createInvoice({
        clientId: timesheet.clientId,
        timesheetId: timesheet.id,
        invoiceNumber: String(timesheet.invoiceNumber),
        month: timesheet.month,
        amount: generatedInvoice.amount,
        status: 'draft',
        pdfUrl: generatedInvoice.pdfUrl,
        sentAt: null,
        paidAt: null,
      });
    } catch (error) {
      // Log error but don't fail the approval
      console.error('Invoice generation failed:', error);
      invoiceError = error instanceof Error ? error.message : 'Invoice generation failed';
    }

    // Send invoice email (fail-open: approval succeeds even if email fails)
    let invoiceEmailError = null;
    if (invoice) {
      const client = await getClientById(invoice.clientId);
      if (client) {
        const emailResult = await sendInvoiceEmail(client, invoice);
        console.log(`[approve] invoice email result for ${invoice.invoiceNumber}:`, emailResult);
        if (emailResult.status === 'sent') {
          invoice = (await updateInvoice(invoice.id, { status: 'sent', sentAt: new Date() })) ?? invoice;
        } else if (emailResult.status === 'failed') {
          invoiceEmailError = emailResult.error ?? 'Email send failed';
        }
      } else {
        console.warn(`[approve] client ${invoice.clientId} not found for email step`);
      }
    } else {
      console.log('[approve] skipping email: invoice was not created (invoiceError:', invoiceError, ')');
    }

    return NextResponse.json({ timesheet: updated, invoice, invoiceError, invoiceEmailError });
  } catch (error) {
    // Check if token expired or invalid
    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        return NextResponse.json({ error: 'Token expired', expired: true }, { status: 401 });
      }
      if (error.message.includes('invalid') || error.message.includes('malformed')) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
    }

    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
}
