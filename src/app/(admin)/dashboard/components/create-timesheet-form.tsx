'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FileSpreadsheet, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { MonthPicker } from './month-picker';
import { ClientSelector } from './client-selector';
import { Timesheet } from '@/types';

interface CreateTimesheetResponse {
  timesheet: Timesheet;
  summary: {
    totalHours: number;
    entryCount: number;
  };
}

async function createTimesheet(data: {
  clientId: string;
  month: string;
}): Promise<CreateTimesheetResponse> {
  const response = await fetch('/api/timesheets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to create timesheet');
  }

  return result;
}

// Get previous month as default
function getDefaultMonth(): string {
  const now = new Date();
  const prevMonth = now.getMonth() === 0 ? 12 : now.getMonth();
  const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  return `${year}-${String(prevMonth).padStart(2, '0')}`;
}

export function CreateTimesheetForm() {
  const [clientId, setClientId] = useState('');
  const [month, setMonth] = useState(getDefaultMonth);
  const [lastCreated, setLastCreated] = useState<CreateTimesheetResponse | null>(
    null
  );

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createTimesheet,
    onSuccess: (data) => {
      setLastCreated(data);
      // Invalidate timesheets query to refresh any lists
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !month) return;

    setLastCreated(null);
    mutation.mutate({ clientId, month });
  };

  const isDisabled = mutation.isPending || !clientId;

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-muted/50">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-primary" />
          Create Timesheet
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Generate a timesheet from Toggl time entries
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <ClientSelector
          value={clientId}
          onChange={setClientId}
          disabled={mutation.isPending}
        />

        <MonthPicker
          value={month}
          onChange={setMonth}
          disabled={mutation.isPending}
        />

        <button
          type="submit"
          disabled={isDisabled}
          className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-medium
                     hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring 
                     focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors flex items-center justify-center gap-2"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Creating Timesheet...
            </>
          ) : (
            <>
              <FileSpreadsheet className="h-5 w-5" />
              Create Timesheet
            </>
          )}
        </button>
      </form>

      {/* Success message */}
      {lastCreated && (
        <div className="px-6 pb-6">
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-emerald-500">
                  Timesheet created successfully!
                </p>
                <div className="mt-2 text-sm text-emerald-400 space-y-1">
                  <p>
                    <span className="font-medium">Total Hours:</span>{' '}
                    {lastCreated.summary.totalHours}h
                  </p>
                  <p>
                    <span className="font-medium">Time Entries:</span>{' '}
                    {lastCreated.summary.entryCount}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span>{' '}
                    <span className="capitalize">
                      {lastCreated.timesheet.status}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {mutation.isError && (
        <div className="px-6 pb-6">
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-destructive">
                  Failed to create timesheet
                </p>
                <p className="mt-1 text-sm text-destructive/80">
                  {mutation.error.message}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
