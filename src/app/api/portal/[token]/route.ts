import { NextResponse } from 'next/server';
import { verifyPortalToken } from '@/lib/auth/jwt';
import { getClientById, getTimesheetsByClientId } from '@/lib/db';

interface RouteParams {
  params: Promise<{ token: string }>;
}

// GET /api/portal/[token] - Get client and timesheets for portal
export async function GET(_request: Request, { params }: RouteParams) {
  const { token } = await params;

  try {
    // Validate JWT token
    const payload = verifyPortalToken(token);

    // Fetch client
    const client = await getClientById(payload.clientId);
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Fetch timesheets for this client
    const timesheets = await getTimesheetsByClientId(payload.clientId);

    return NextResponse.json({
      client: {
        id: client.id,
        name: client.name,
      },
      timesheets,
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

    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}
