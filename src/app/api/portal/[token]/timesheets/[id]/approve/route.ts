import { NextResponse } from 'next/server';
import { verifyPortalToken } from '@/lib/auth/jwt';
import { getTimesheetById, updateTimesheet } from '@/lib/db';

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
      return NextResponse.json(
        { error: 'Timesheet is already approved' },
        { status: 400 }
      );
    }

    if (timesheet.status === 'rejected') {
      return NextResponse.json(
        { error: 'Cannot approve a rejected timesheet' },
        { status: 400 }
      );
    }

    // Update timesheet status to approved
    const updated = await updateTimesheet(id, {
      status: 'approved',
      approvedAt: new Date(),
    });

    return NextResponse.json({ timesheet: updated });
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

    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}
