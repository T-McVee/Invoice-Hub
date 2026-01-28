'use client';

import { Clock, Receipt, Loader2 } from 'lucide-react';
import { useTimesheets, useClients } from '@/lib/hooks';

function formatMonth(month: string): string {
  const [year, monthNum] = month.split('-');
  const date = new Date(parseInt(year), parseInt(monthNum) - 1);
  return date.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return new Date(date).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
  });
}

export function RecentActivityCard() {
  const { timesheets, isLoading } = useTimesheets();
  const { clients } = useClients();

  const clientNames = new Map(clients.map((c) => [c.id, c.name]));

  // Get the 5 most recent timesheets
  const recentTimesheets = timesheets.slice(0, 5);

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-border/50 bg-muted/30">
        <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Your latest timesheets and invoices
        </p>
      </div>
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : recentTimesheets.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No activity yet. Create a timesheet to get started.
          </p>
        ) : (
          <div className="space-y-4">
            {recentTimesheets.map((timesheet) => (
              <div
                key={timesheet.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground truncate">
                      {formatMonth(timesheet.month)} Timesheet
                    </p>
                    {timesheet.invoiceNumber && (
                      <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        #{timesheet.invoiceNumber}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {clientNames.get(timesheet.clientId) || 'Unknown Client'}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatTimeAgo(timesheet.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-border/50">
          <p className="text-sm text-muted-foreground text-center">
            View all timesheets in the Timesheets section
          </p>
        </div>
      </div>
    </div>
  );
}
