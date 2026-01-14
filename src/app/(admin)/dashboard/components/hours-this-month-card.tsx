'use client';

import { useQuery } from '@tanstack/react-query';
import { Clock, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface HoursMtdResponse {
  hours: number;
  month: string;
  entryCount: number;
  isStale: boolean;
  cachedAt: string;
}

async function fetchHoursMtd(): Promise<HoursMtdResponse> {
  const response = await fetch('/api/metrics/hours-mtd');
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch hours');
  }

  return data;
}

export function HoursThisMonthCard() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['metrics', 'hours-mtd'],
    queryFn: fetchHoursMtd,
    refetchOnWindowFocus: true,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes in background
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="glass rounded-xl p-5 hover-lift group">
        <div className="flex items-start justify-between">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Clock className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Hours This Month</p>
        </div>
      </div>
    );
  }

  // Error state (no cached data available)
  if (isError) {
    return (
      <div className="glass rounded-xl p-5 hover-lift group">
        <div className="flex items-start justify-between">
          <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-5 w-5 text-destructive" />
          </div>
          <button
            onClick={() => refetch()}
            className="text-xs font-medium px-2 py-1 rounded-full bg-muted hover:bg-muted/80 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
          </button>
        </div>
        <div className="mt-4">
          <p className="text-sm text-destructive font-medium">Unable to load</p>
          <p className="text-sm text-muted-foreground mt-1">Hours This Month</p>
          <p className="text-xs text-muted-foreground/70 mt-0.5">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    );
  }

  // Success state
  const formattedHours = data?.hours.toFixed(1) ?? '0';
  const cachedAt = data?.cachedAt ? new Date(data.cachedAt) : null;
  const timeAgo = cachedAt ? getTimeAgo(cachedAt) : '';

  return (
    <div className="glass rounded-xl p-5 hover-lift group">
      <div className="flex items-start justify-between">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Clock className="h-5 w-5 text-primary" />
        </div>
        {data?.isStale && (
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-warning/10 text-warning">
            Stale
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-foreground">{formattedHours}</p>
        <p className="text-sm text-muted-foreground mt-1">Hours This Month</p>
        {timeAgo && <p className="text-xs text-muted-foreground/70 mt-0.5">Updated {timeAgo}</p>}
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
