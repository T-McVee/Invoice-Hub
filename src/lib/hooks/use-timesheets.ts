'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Timesheet } from '@/types';

export const TIMESHEETS_QUERY_KEY = ['timesheets'] as const;

export interface TimesheetsResponse {
  timesheets: Timesheet[];
}

async function fetchTimesheets(): Promise<TimesheetsResponse> {
  const response = await fetch('/api/timesheets');
  if (!response.ok) {
    throw new Error('Failed to fetch timesheets');
  }
  return response.json();
}

/**
 * Hook for fetching timesheets list
 */
export function useTimesheets() {
  const query = useQuery({
    queryKey: TIMESHEETS_QUERY_KEY,
    queryFn: fetchTimesheets,
  });

  return {
    ...query,
    timesheets: query.data?.timesheets ?? [],
  };
}

/**
 * Helper to invalidate timesheets cache from anywhere
 */
export function useInvalidateTimesheets() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: TIMESHEETS_QUERY_KEY });
}
