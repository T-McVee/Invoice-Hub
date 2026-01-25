import { NextResponse } from 'next/server';
import { verifyPortalToken } from '@/lib/auth/jwt';
import { getTimesheetById } from '@/lib/db';
import { downloadPdf, getTimesheetBlobPath } from '@/lib/blob/client';

interface RouteParams {
  params: Promise<{ token: string; id: string }>;
}

// GET /api/portal/[token]/timesheets/[id]/pdf - Stream timesheet PDF with authentication
export async function GET(_request: Request, { params }: RouteParams) {
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
        { error: 'Not authorized to access this timesheet' },
        { status: 403 }
      );
    }

    if (!timesheet.pdfUrl) {
      return NextResponse.json(
        { error: 'No PDF available for this timesheet' },
        { status: 404 }
      );
    }

    // Get the blob path and download PDF from Azure
    const blobPath = getTimesheetBlobPath(timesheet.clientId, timesheet.month);
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
    // Check if token expired or invalid
    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        return NextResponse.json(
          { error: 'Token expired', expired: true },
          { status: 401 }
        );
      }
      if (
        error.message.includes('invalid') ||
        error.message.includes('malformed')
      ) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
    }

    // Log unexpected errors
    console.error('Error retrieving PDF:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve PDF' },
      { status: 500 }
    );
  }
}
