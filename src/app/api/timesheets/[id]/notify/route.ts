import { NextResponse } from 'next/server';
import { getTimesheetById, getClientById } from '@/lib/db';
import { sendTimesheetNotification } from '../../notify-helper';

// POST /api/timesheets/[id]/notify - Retry email notification
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const timesheet = await getTimesheetById(id);
  if (!timesheet) {
    return NextResponse.json({ error: 'Timesheet not found' }, { status: 404 });
  }

  const client = await getClientById(timesheet.clientId);
  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  if (!client.portalToken) {
    return NextResponse.json({ error: 'Client has no portal token' }, { status: 400 });
  }

  const result = await sendTimesheetNotification(client, timesheet.month, client.portalToken);

  if (result.status === 'sent') {
    return NextResponse.json({ emailStatus: 'sent' });
  }

  return NextResponse.json(
    { emailStatus: result.status, error: result.error },
    { status: result.status === 'skipped' ? 400 : 502 }
  );
}
