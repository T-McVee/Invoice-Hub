import { NextResponse } from 'next/server';
import { getClientById, updateClientPortalToken } from '@/lib/db';
import { signPortalToken, getTokenExpiry } from '@/lib/auth/jwt';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/clients/[id]/regenerate-token - Generate a new portal token for a client
export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existing = await getClientById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Generate new JWT token
    const token = signPortalToken(id);
    const expiresAt = getTokenExpiry(token);

    // Update client with new token
    const client = await updateClientPortalToken(id, token);

    if (!client) {
      return NextResponse.json(
        { error: 'Failed to update client' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      token,
      expiresAt: expiresAt?.toISOString() ?? null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to regenerate token';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
