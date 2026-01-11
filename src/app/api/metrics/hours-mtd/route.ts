import { NextResponse } from 'next/server';
import { cache } from '@/lib/cache';
import { fetchMonthToDateHours } from '@/lib/toggl/client';

const CACHE_TTL_SECONDS = 600; // 10 minutes

function getCacheKey(): string {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return `toggl:hours-mtd:${month}`;
}

export async function GET() {
  try {
    const cacheKey = getCacheKey();

    const result = await cache.getOrFetch(
      cacheKey,
      () => fetchMonthToDateHours(),
      CACHE_TTL_SECONDS
    );

    return NextResponse.json({
      hours: result.data.totalHours,
      month: result.data.month,
      entryCount: result.data.entryCount,
      isStale: result.isStale,
      cachedAt: result.cachedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error fetching hours MTD:', error);

    // Handle configuration errors
    if (error instanceof Error && error.message.includes('TOGGL_')) {
      return NextResponse.json(
        { error: 'Toggl API not configured. Check environment variables.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch hours' },
      { status: 500 }
    );
  }
}
