import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import {
  createTimesheet,
  getClientById,
  getTimesheetByClientAndMonth,
  getTimesheets,
} from '@/lib/db/mock-data';
import { fetchTimeEntries, fetchTimesheetPdf } from '@/lib/toggl/client';

// GET /api/timesheets - List all timesheets
export async function GET() {
  const timesheets = getTimesheets();
  return NextResponse.json({ timesheets });
}

// POST /api/timesheets - Create a new timesheet
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, month } = body;

    // Validate required fields
    if (!clientId || !month) {
      return NextResponse.json({ error: 'clientId and month are required' }, { status: 400 });
    }

    // Validate month format (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json({ error: 'month must be in YYYY-MM format' }, { status: 400 });
    }

    // Check client exists
    const client = getClientById(clientId);
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
    const existing = getTimesheetByClientAndMonth(clientId, month);
    if (existing) {
      return NextResponse.json(
        {
          error: `A timesheet already exists for ${client.name} in ${month}`,
          existingTimesheetId: existing.id,
        },
        { status: 409 }
      );
    }

    // Fetch time entries from Toggl
    const timeEntries = await fetchTimeEntries(client.togglProjectId, month);

    // Fetch PDF from Toggl and save locally for testing
    // In production, upload to Azure Blob Storage and store the URL
    let pdfUrl: string | null = null;
    try {
      const { pdfBuffer, filename } = await fetchTimesheetPdf(client.togglProjectId, month);

      // Save PDF to tmp directory for testing/validation
      const tmpDir = join(process.cwd(), 'tmp', 'timesheets');
      await mkdir(tmpDir, { recursive: true });
      const pdfPath = join(tmpDir, filename);
      await writeFile(pdfPath, pdfBuffer);
      console.log(`PDF saved to: ${pdfPath}`);

      pdfUrl = `/tmp/timesheets/${filename}`;
    } catch (pdfError) {
      // PDF generation is not critical - continue without it
      console.warn('Failed to fetch PDF from Toggl:', pdfError);
    }

    // Create timesheet record
    const timesheet = createTimesheet({
      clientId,
      month,
      status: 'pending',
      pdfUrl,
      totalHours: timeEntries.totalHours,
      sentAt: null,
      approvedAt: null,
    });

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
