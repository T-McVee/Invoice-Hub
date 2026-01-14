'use client';

import { useQuery } from '@tanstack/react-query';
import { DollarSign, Loader2, AlertCircle, RefreshCw, Settings } from 'lucide-react';
import Link from 'next/link';

interface EarningsMtdResponse {
  earnings: number | null;
  hours: number;
  hourlyRate: number | null;
  month: string;
  isStale: boolean;
  cachedAt: string;
}

async function fetchEarningsMtd(): Promise<EarningsMtdResponse> {
  const response = await fetch('/api/metrics/earnings-mtd');
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch earnings');
  }

  return data;
}

export function EarningsThisMonthCard() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['metrics', 'earnings-mtd'],
    queryFn: fetchEarningsMtd,
    refetchOnWindowFocus: true,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes in background
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="glass rounded-xl p-5 hover-lift group">
        <div className="flex items-start justify-between">
          <div className="h-10 w-10 rounded-lg bg-chart-2/10 flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-chart-2" />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Estimated Earnings</p>
        </div>
      </div>
    );
  }

  // Error state
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
          <p className="text-sm text-muted-foreground mt-1">Estimated Earnings</p>
          <p className="text-xs text-muted-foreground/70 mt-0.5">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    );
  }

  // Rate not configured state
  if (data?.hourlyRate === null) {
    return (
      <div className="glass rounded-xl p-5 hover-lift group">
        <div className="flex items-start justify-between">
          <div className="h-10 w-10 rounded-lg bg-chart-2/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <DollarSign className="h-5 w-5 text-chart-2" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground font-medium">Not configured</p>
          <p className="text-sm text-muted-foreground mt-1">Estimated Earnings</p>
          <Link
            href="/settings"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
          >
            <Settings className="h-3 w-3" />
            Set hourly rate
          </Link>
        </div>
      </div>
    );
  }

  // Success state
  const formattedEarnings = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(data?.earnings ?? 0);

  const cachedAt = data?.cachedAt ? new Date(data.cachedAt) : null;
  const timeAgo = cachedAt ? getTimeAgo(cachedAt) : '';

  return (
    <div className="glass rounded-xl p-5 hover-lift group">
      <div className="flex items-start justify-between">
        <div className="h-10 w-10 rounded-lg bg-chart-2/10 flex items-center justify-center group-hover:scale-110 transition-transform">
          <DollarSign className="h-5 w-5 text-chart-2" />
        </div>
        {data?.isStale && (
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-warning/10 text-warning">
            Stale
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-foreground">{formattedEarnings}</p>
        <p className="text-sm text-muted-foreground mt-1">Estimated Earnings</p>
        <p className="text-xs text-muted-foreground/70 mt-0.5">
          ${data?.hourlyRate}/hr × {data?.hours.toFixed(1)}h
          {timeAgo && ` • ${timeAgo}`}
        </p>
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
