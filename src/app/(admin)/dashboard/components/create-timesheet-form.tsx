'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileSpreadsheet,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { MonthPicker } from './month-picker';
import { ClientSelector } from './client-selector';
import { Timesheet } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface CreateTimesheetResponse {
  timesheet: Timesheet;
  summary: {
    totalHours: number;
    entryCount: number;
  };
}

interface ExistingTimesheetInfo {
  id: string;
  status: string;
  totalHours: number;
  createdAt: string;
}

interface CheckTimesheetResponse {
  exists: boolean;
  timesheet: ExistingTimesheetInfo | null;
}

async function checkExistingTimesheet(
  clientId: string,
  month: string
): Promise<CheckTimesheetResponse> {
  const response = await fetch(
    `/api/timesheets/check?clientId=${clientId}&month=${month}`
  );

  if (!response.ok) {
    throw new Error('Failed to check for existing timesheet');
  }

  return response.json();
}

async function createTimesheet(data: {
  clientId: string;
  month: string;
  force?: boolean;
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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [existingTimesheet, setExistingTimesheet] =
    useState<ExistingTimesheetInfo | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createTimesheet,
    onSuccess: (data) => {
      setLastCreated(data);
      setShowConfirmDialog(false);
      setExistingTimesheet(null);
      // Invalidate timesheets query to refresh any lists
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
      // Invalidate clients query to refresh portal tokens
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !month) return;

    setLastCreated(null);
    mutation.reset();

    // Check for existing timesheet first
    setIsChecking(true);
    try {
      const checkResult = await checkExistingTimesheet(clientId, month);
      if (checkResult.exists && checkResult.timesheet) {
        // Show confirmation dialog
        setExistingTimesheet(checkResult.timesheet);
        setShowConfirmDialog(true);
      } else {
        // No existing timesheet, create directly
        mutation.mutate({ clientId, month });
      }
    } catch {
      // If check fails, try to create anyway (will fail with 409 if duplicate)
      mutation.mutate({ clientId, month });
    } finally {
      setIsChecking(false);
    }
  };

  const handleConfirmReplace = () => {
    mutation.mutate({ clientId, month, force: true });
  };

  const handleCancelReplace = () => {
    setShowConfirmDialog(false);
    setExistingTimesheet(null);
  };

  const isDisabled = mutation.isPending || isChecking || !clientId;

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border/50 bg-muted/30">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileSpreadsheet className="h-4 w-4 text-primary" />
          </div>
          Create Timesheet
        </h2>
        <p className="text-sm text-muted-foreground mt-1 ml-10">
          Generate a timesheet from Toggl time entries
        </p>
      </div>

      {/* Form */}
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
          className="group w-full py-3.5 px-4 rounded-xl bg-primary text-primary-foreground font-semibold
                     hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring
                     focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50
                     disabled:cursor-not-allowed transition-all duration-300
                     flex items-center justify-center gap-2 hover-lift"
        >
          {isChecking ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Checking...
            </>
          ) : mutation.isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Creating Timesheet...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 group-hover:scale-110 transition-transform" />
              Create Timesheet
            </>
          )}
        </button>
      </form>

      {/* Success message */}
      {lastCreated && (
        <div className="px-6 pb-6 animate-scale-in">
          <div className="rounded-xl bg-success/10 border border-success/20 p-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-success/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="font-semibold text-success">
                  Timesheet created successfully!
                </p>
                <div className="mt-2 text-sm text-success/80 space-y-1">
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
        <div className="px-6 pb-6 animate-scale-in">
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-destructive/20 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="font-semibold text-destructive">
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

      {/* Confirmation dialog for replacing existing timesheet */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-amber-100 dark:bg-amber-900/30">
              <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </AlertDialogMedia>
            <AlertDialogTitle>Timesheet Already Exists</AlertDialogTitle>
            <AlertDialogDescription>
              A timesheet already exists for this client and month.
              {existingTimesheet && (
                <span className="block mt-2 text-foreground">
                  <strong>Status:</strong>{' '}
                  <span className="capitalize">{existingTimesheet.status}</span>
                  <br />
                  <strong>Hours:</strong> {existingTimesheet.totalHours}h
                  <br />
                  <strong>Created:</strong>{' '}
                  {new Date(existingTimesheet.createdAt).toLocaleDateString()}
                </span>
              )}
              <span className="block mt-2">
                Do you want to replace it with a new timesheet?
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelReplace}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmReplace}
              variant="destructive"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Replacing...
                </>
              ) : (
                'Replace Timesheet'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
