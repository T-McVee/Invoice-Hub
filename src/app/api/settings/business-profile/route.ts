import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getBusinessProfile, setBusinessProfile, businessProfileSchema } from '@/lib/settings';

export async function GET() {
  const profile = getBusinessProfile();

  return NextResponse.json({
    name: profile.name,
    businessNumber: profile.businessNumber,
    gstNumber: profile.gstNumber,
    phone: profile.phone,
    email: profile.email,
    address: profile.address,
    paymentDetails: profile.paymentDetails,
    taxRate: profile.taxRate,
    paymentTerms: profile.paymentTerms,
    nextInvoiceNumber: profile.nextInvoiceNumber,
    updatedAt: profile.updatedAt?.toISOString() ?? null,
  });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const parsed = businessProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid business profile data',
          details: parsed.error.issues.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    // Convert empty strings to null for optional fields
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(parsed.data)) {
      if (value === '' || value === undefined) {
        updates[key] = null;
      } else {
        updates[key] = value;
      }
    }

    const profile = setBusinessProfile(updates);

    return NextResponse.json({
      name: profile.name,
      businessNumber: profile.businessNumber,
      gstNumber: profile.gstNumber,
      phone: profile.phone,
      email: profile.email,
      address: profile.address,
      paymentDetails: profile.paymentDetails,
      taxRate: profile.taxRate,
      paymentTerms: profile.paymentTerms,
      nextInvoiceNumber: profile.nextInvoiceNumber,
      updatedAt: profile.updatedAt?.toISOString() ?? null,
    });
  } catch (error) {
    console.error('Error updating business profile:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid business profile data',
          details: error.issues.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Failed to update business profile' }, { status: 500 });
  }
}
