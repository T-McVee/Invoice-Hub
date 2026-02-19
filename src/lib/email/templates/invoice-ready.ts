import type { EmailAttachment, SendEmailOptions } from '../client';

function formatMonth(month: string): string {
  const [year, monthNum] = month.split('-');
  const date = new Date(Number(year), Number(monthNum) - 1);
  return date.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });
}

function formatAttachmentFilename(invoiceNumber: string, month: string): string {
  const [year, monthNum] = month.split('-');
  const date = new Date(Number(year), Number(monthNum) - 1);
  const mmm = date.toLocaleDateString('en-AU', { month: 'short' }).toLowerCase();
  return `invoice-${invoiceNumber}-${mmm}-${year}.pdf`;
}

export interface InvoiceReadyParams {
  primaryContactName: string;
  to: string;
  cc?: string[];
  invoiceNumber: string;
  month: string;
  pdfBuffer: Buffer;
}

export function buildInvoiceReadyEmail(params: InvoiceReadyParams): SendEmailOptions {
  const { primaryContactName, to, cc, invoiceNumber, month, pdfBuffer } = params;
  const formattedMonth = formatMonth(month);
  const filename = formatAttachmentFilename(invoiceNumber, month);

  const attachment: EmailAttachment = {
    filename,
    content: pdfBuffer,
  };

  const text = `Hi ${primaryContactName},\n\nPlease find attached invoice #${invoiceNumber} for ${formattedMonth}.\n\nThanks, Tim.`;

  const html = `<p>Hi ${primaryContactName},</p>
<p>Please find attached invoice #${invoiceNumber} for ${formattedMonth}.</p>
<p>Thanks, Tim.</p>`;

  return {
    to,
    cc: cc && cc.length > 0 ? cc : undefined,
    subject: `Invoice #${invoiceNumber} - ${formattedMonth}`,
    text,
    html,
    attachments: [attachment],
  };
}
