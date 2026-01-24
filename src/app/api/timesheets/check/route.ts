import { NextRequest, NextResponse } from 'next/server';
import { getTimesheetByClientAndMonth, getClientById } from '@/lib/db';

// GET /api/timesheets/check?clientId=X&month=Y - Check if a timesheet exists
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const clientId = searchParams.get('clientId');
  const month = searchParams.get('month');

  // Validate required query params
  if (!clientId || !month) {
    return NextResponse.json(
      { error: 'clientId and month query parameters are required' },
      { status: 400 }
    );
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

  // Check for existing timesheet
  const existing = await getTimesheetByClientAndMonth(clientId, month);

  return NextResponse.json({
    exists: !!existing,
    timesheet: existing
      ? {
          id: existing.id,
          status: existing.status,
          totalHours: existing.totalHours,
          createdAt: existing.createdAt,
        }
      : null,
  });
}
