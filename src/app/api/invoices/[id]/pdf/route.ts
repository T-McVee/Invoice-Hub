import { NextResponse } from 'next/server';
import { getInvoiceById } from '@/lib/db';
import { downloadPdf, getInvoiceBlobPath } from '@/lib/blob/client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/invoices/[id]/pdf - Stream invoice PDF
export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  // Fetch invoice to get the blob path
  const invoice = await getInvoiceById(id);
  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }

  if (!invoice.pdfUrl) {
    return NextResponse.json({ error: 'No PDF available for this invoice' }, { status: 404 });
  }

  try {
    // Get the blob path from stored data
    const blobPath = getInvoiceBlobPath(invoice.clientId, invoice.invoiceNumber);

    // Download PDF from Azure
    const pdfBuffer = await downloadPdf(blobPath);

    // Return PDF with appropriate headers
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="invoice-${invoice.invoiceNumber}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error downloading PDF:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve PDF' },
      { status: 500 }
    );
  }
}
