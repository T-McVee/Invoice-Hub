import { NextResponse } from 'next/server';
import { cache } from '@/lib/cache';
import { fetchMonthToDateHours } from '@/lib/toggl/client';
import { getHourlyRate } from '@/lib/settings';

const CACHE_TTL_SECONDS = 600; // 10 minutes

function getCacheKey(): string {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return `toggl:hours-mtd:${month}`;
}

export async function GET() {
  try {
    const cacheKey = getCacheKey();

    // Get hours data (uses same cache as hours-mtd endpoint)
    const hoursResult = await cache.getOrFetch(
      cacheKey,
      () => fetchMonthToDateHours(),
      CACHE_TTL_SECONDS
    );

    // Get hourly rate setting
    const rateSetting = await getHourlyRate();

    // Calculate earnings (null if rate not configured)
    const earnings =
      rateSetting.rate !== null
        ? hoursResult.data.totalHours * rateSetting.rate
        : null;

    return NextResponse.json({
      earnings,
      hours: hoursResult.data.totalHours,
      hourlyRate: rateSetting.rate,
      month: hoursResult.data.month,
      isStale: hoursResult.isStale,
      cachedAt: hoursResult.cachedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error fetching earnings MTD:', error);

    // Handle configuration errors
    if (error instanceof Error && error.message.includes('TOGGL_')) {
      return NextResponse.json(
        { error: 'Toggl API not configured. Check environment variables.' },
        { status: 500 }
      );
    }

    // Return user-friendly error message (detailed error already logged above)
    return NextResponse.json(
      { error: 'Unable to load earnings. Please try again later.' },
      { status: 500 }
    );
  }
}
