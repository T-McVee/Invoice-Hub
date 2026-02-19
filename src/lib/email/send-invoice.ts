import type { Client, Invoice } from '@/types';
import { sendEmail } from '@/lib/email/client';
import { downloadPdf, getInvoiceBlobPath } from '@/lib/blob/client';
import { buildInvoiceReadyEmail } from '@/lib/email/templates/invoice-ready';

export interface InvoiceSendResult {
  status: 'sent' | 'failed' | 'skipped';
  error?: string;
}

export async function sendInvoiceEmail(
  client: Client,
  invoice: Invoice
): Promise<InvoiceSendResult> {
  // Find billing contacts (role = 'billing' or 'both')
  const billingContacts = client.contacts.filter(
    (c) => c.role === 'billing' || c.role === 'both'
  );

  // Find the primary billing contact
  const primaryBilling = billingContacts.find((c) => c.isPrimaryBilling);

  if (!primaryBilling) {
    return { status: 'skipped', error: 'No primary billing contact configured' };
  }

  // CC: all other billing/both contacts
  const ccContacts = billingContacts
    .filter((c) => c.id !== primaryBilling.id)
    .map((c) => c.email);

  try {
    const blobPath = getInvoiceBlobPath(invoice.clientId, invoice.invoiceNumber);
    const pdfBuffer = await downloadPdf(blobPath);

    const emailOptions = buildInvoiceReadyEmail({
      primaryContactName: primaryBilling.name,
      to: primaryBilling.email,
      cc: ccContacts,
      invoiceNumber: invoice.invoiceNumber,
      month: invoice.month,
      pdfBuffer,
    });

    const result = await sendEmail(emailOptions);
    if (result.success) {
      return { status: 'sent' };
    }
    return { status: 'failed', error: result.error };
  } catch (error) {
    console.error('Failed to send invoice email:', error);
    return {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown email error',
    };
  }
}
