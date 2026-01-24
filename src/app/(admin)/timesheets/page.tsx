'use client';

import {
  FileSpreadsheet,
  Loader2,
  AlertCircle,
  Clock,
  ExternalLink,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTimesheets, useClients } from '@/lib/hooks';
import { Timesheet } from '@/types';

function formatMonth(month: string): string {
  const [year, monthNum] = month.split('-');
  const date = new Date(parseInt(year), parseInt(monthNum) - 1);
  return date.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function StatusBadge({ status }: { status: Timesheet['status'] }) {
  const styles = {
    pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    sent: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    approved: 'bg-green-500/10 text-green-500 border-green-500/20',
    rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full border capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
}

export default function TimesheetsPage() {
  const { timesheets, isLoading, error } = useTimesheets();
  const { clients } = useClients();

  // Create a map of client IDs to names for quick lookup
  const clientNames = new Map(clients.map((c) => [c.id, c.name]));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
            </div>
            Timesheets
          </h1>
          <p className="text-muted-foreground mt-2">
            View and manage client timesheets.
          </p>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mb-3" />
          <p>Loading timesheets...</p>
        </div>
      ) : error ? (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-destructive">
                Failed to load timesheets
              </p>
              <p className="text-sm text-destructive/80 mt-1">
                {error instanceof Error ? error.message : 'Unknown error'}
              </p>
            </div>
          </div>
        </div>
      ) : timesheets.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            No timesheets yet
          </h3>
          <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
            Create a timesheet from the dashboard to get started.
          </p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                    Client
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                    Month
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                    Hours
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                    Created
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {timesheets.map((timesheet) => (
                  <tr
                    key={timesheet.id}
                    className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium text-foreground">
                        {clientNames.get(timesheet.clientId) || 'Unknown Client'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {formatMonth(timesheet.month)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={timesheet.status} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {timesheet.totalHours.toFixed(1)}h
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-sm">
                      {formatDate(timesheet.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {timesheet.pdfUrl ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="gap-1.5"
                        >
                          <a
                            href={timesheet.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                            View PDF
                          </a>
                        </Button>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          No PDF
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
