import { NextRequest, NextResponse } from 'next/server';
import {
  createTimesheet,
  deleteTimesheet,
  getClientById,
  getTimesheetByClientAndMonth,
  getTimesheets,
  updateClientPortalToken,
} from '@/lib/db';
import { fetchTimeEntries, fetchTimesheetPdf } from '@/lib/toggl/client';
import { uploadPdf, getTimesheetBlobPath, deletePdf } from '@/lib/blob/client';
import { signPortalToken } from '@/lib/auth/jwt';

// GET /api/timesheets - List all timesheets
export async function GET() {
  const timesheets = await getTimesheets();
  return NextResponse.json({ timesheets });
}

// POST /api/timesheets - Create a new timesheet
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, month, force } = body;

    // Validate required fields
    if (!clientId || !month) {
      return NextResponse.json({ error: 'clientId and month are required' }, { status: 400 });
    }

    // Validate month format (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json({ error: 'month must be in YYYY-MM format' }, { status: 400 });
    }

    // Check client exists
    const client = await getClientById(clientId);
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Check client has a Toggl project ID configured
    if (!client.togglProjectId) {
      return NextResponse.json(
        { error: 'Client does not have a Toggl project ID configured' },
        { status: 400 }
      );
    }

    // Check for duplicate timesheet
    const existing = await getTimesheetByClientAndMonth(clientId, month);
    if (existing) {
      if (force) {
        // Delete existing timesheet and its PDF from blob storage
        if (existing.pdfUrl) {
          const blobPath = getTimesheetBlobPath(clientId, month);
          await deletePdf(blobPath);
        }
        await deleteTimesheet(existing.id);
      } else {
        return NextResponse.json(
          {
            error: `A timesheet already exists for ${client.name} in ${month}`,
            existingTimesheetId: existing.id,
          },
          { status: 409 }
        );
      }
    }

    // Fetch time entries from Toggl
    const timeEntries = await fetchTimeEntries(client.togglProjectId, month);

    // Fetch PDF from Toggl and upload to Azure Blob Storage
    let pdfUrl: string | null = null;
    try {
      const { pdfBuffer } = await fetchTimesheetPdf(client.togglProjectId, month);

      // Upload to Azure Blob Storage
      const blobPath = getTimesheetBlobPath(clientId, month);
      const result = await uploadPdf(pdfBuffer, blobPath);
      pdfUrl = result.url;
    } catch (pdfError) {
      // PDF generation is not critical - continue without it
      console.warn('Failed to fetch/upload PDF:', pdfError);
    }

    // Create timesheet record
    const timesheet = await createTimesheet({
      clientId,
      month,
      status: 'pending',
      pdfUrl,
      totalHours: timeEntries.totalHours,
      sentAt: null,
      approvedAt: null,
    });

    // Generate/refresh client's portal JWT token
    const portalToken = signPortalToken(clientId);
    await updateClientPortalToken(clientId, portalToken);

    return NextResponse.json(
      {
        timesheet,
        summary: {
          totalHours: timeEntries.totalHours,
          entryCount: timeEntries.entries.length,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating timesheet:', error);

    // Handle Toggl API errors gracefully
    if (error instanceof Error && error.message.includes('TOGGL_')) {
      return NextResponse.json(
        { error: 'Toggl API configuration error. Check environment variables.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create timesheet',
      },
      { status: 500 }
    );
  }
}
