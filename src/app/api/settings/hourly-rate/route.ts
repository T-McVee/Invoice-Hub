import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getHourlyRate, setHourlyRate, hourlyRateSchema } from '@/lib/settings';

// Request body schema
const updateHourlyRateSchema = z.object({
  rate: hourlyRateSchema,
});

export async function GET() {
  const setting = getHourlyRate();

  return NextResponse.json({
    rate: setting.rate,
    updatedAt: setting.updatedAt?.toISOString() ?? null,
  });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const parsed = updateHourlyRateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid hourly rate',
          details: parsed.error.issues.map((e) => e.message),
        },
        { status: 400 }
      );
    }

    const setting = setHourlyRate(parsed.data.rate);

    return NextResponse.json({
      rate: setting.rate,
      updatedAt: setting.updatedAt?.toISOString() ?? null,
    });
  } catch (error) {
    console.error('Error updating hourly rate:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid hourly rate',
          details: error.issues.map((e) => e.message),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update hourly rate' },
      { status: 500 }
    );
  }
}
