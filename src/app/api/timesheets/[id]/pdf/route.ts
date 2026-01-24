import { NextResponse } from 'next/server';
import { getTimesheetById } from '@/lib/db';
import { downloadPdf, getTimesheetBlobPath } from '@/lib/blob/client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/timesheets/[id]/pdf - Stream timesheet PDF
export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  // Fetch timesheet to get the blob path
  const timesheet = await getTimesheetById(id);
  if (!timesheet) {
    return NextResponse.json({ error: 'Timesheet not found' }, { status: 404 });
  }

  if (!timesheet.pdfUrl) {
    return NextResponse.json({ error: 'No PDF available for this timesheet' }, { status: 404 });
  }

  try {
    // Get the blob path from stored data
    const blobPath = getTimesheetBlobPath(timesheet.clientId, timesheet.month);

    // Download PDF from Azure
    const pdfBuffer = await downloadPdf(blobPath);

    // Return PDF with appropriate headers
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${timesheet.month}.pdf"`,
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
