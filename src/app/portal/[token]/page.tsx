'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Shield,
  Clock,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Check,
  History,
} from 'lucide-react';
import { Timesheet } from '@/types';

interface PortalData {
  client: { id: string; name: string };
  timesheets: Timesheet[];
}

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

function TimesheetCard({
  timesheet,
  token,
  onApprove,
  isApproving,
}: {
  timesheet: Timesheet;
  token: string;
  onApprove?: (id: string) => void;
  isApproving?: boolean;
}) {
  const canApprove = timesheet.status === 'pending' || timesheet.status === 'sent';

  return (
    <div className="glass rounded-xl p-4 border border-border/50">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <h4 className="font-medium text-foreground">{formatMonth(timesheet.month)}</h4>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {timesheet.totalHours.toFixed(1)} hours
            </span>
            {timesheet.approvedAt && (
              <span className="flex items-center gap-1.5 text-green-500">
                <CheckCircle2 className="h-4 w-4" />
                Approved {formatDate(timesheet.approvedAt)}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {timesheet.pdfUrl && (
            <Button variant="outline" size="sm" asChild className="gap-1.5">
              <a href={`/api/portal/${token}/timesheets/${timesheet.id}/pdf`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                View PDF
              </a>
            </Button>
          )}
          {canApprove && onApprove && (
            <Button
              size="sm"
              onClick={() => onApprove(timesheet.id)}
              disabled={isApproving}
              className="gap-1.5"
            >
              {isApproving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Approve
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function ExpiredTokenView() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 bg-background" />
      <div className="fixed inset-0 gradient-mesh" />
      <div className="fixed inset-0 noise" />

      <div className="relative z-10 p-8">
        <div className="mx-auto max-w-md pt-24">
          <Card className="glass border-destructive/30">
            <CardHeader className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle>Link Expired</CardTitle>
              <CardDescription>
                This portal link has expired or is no longer valid.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">
                Please contact your administrator to request a new portal link.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function PortalPage() {
  const params = useParams();
  const token = params.token as string;

  const [data, setData] = useState<PortalData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Fetch portal data
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/portal/${token}`);
        const result = await response.json();

        if (!response.ok) {
          if (result.expired) {
            setIsExpired(true);
          } else {
            setError(result.error || 'Failed to load portal');
          }
          return;
        }

        setData(result);
      } catch {
        setError('Failed to connect to server');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [token]);

  // Handle timesheet approval
  const handleApprove = async (timesheetId: string) => {
    setApprovingId(timesheetId);
    try {
      const response = await fetch(`/api/portal/${token}/timesheets/${timesheetId}/approve`, {
        method: 'POST',
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to approve');
      }

      // Update local state with the approved timesheet
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          timesheets: prev.timesheets.map((ts) =>
            ts.id === timesheetId ? result.timesheet : ts
          ),
        };
      });
    } catch (err) {
      // Show error somehow - for now just log it
      console.error('Approval failed:', err);
    } finally {
      setApprovingId(null);
    }
  };

  // Show expired state
  if (isExpired) {
    return <ExpiredTokenView />;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="fixed inset-0 bg-background" />
        <div className="fixed inset-0 gradient-mesh" />
        <div className="fixed inset-0 noise" />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !data) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="fixed inset-0 bg-background" />
        <div className="fixed inset-0 gradient-mesh" />
        <div className="fixed inset-0 noise" />
        <div className="relative z-10 p-8">
          <div className="mx-auto max-w-md pt-24">
            <Card className="glass border-destructive/30">
              <CardHeader className="text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <CardTitle>Error</CardTitle>
                <CardDescription>{error || 'Something went wrong'}</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Split timesheets into pending and history
  const pendingTimesheets = data.timesheets.filter(
    (ts) => ts.status === 'pending' || ts.status === 'sent'
  );
  const historyTimesheets = data.timesheets.filter(
    (ts) => ts.status === 'approved' || ts.status === 'rejected'
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-background" />
      <div className="fixed inset-0 gradient-mesh" />
      <div className="fixed inset-0 noise" />

      <div className="relative z-10 p-8">
        <div className="mx-auto max-w-2xl pt-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">Secure Portal</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-3">
              Welcome, <span className="text-primary">{data.client.name}</span>
            </h1>
            <p className="text-muted-foreground">
              Review and approve your timesheets below
            </p>
          </div>

          {/* Pending Timesheets */}
          {pendingTimesheets.length > 0 && (
            <Card className="glass border-border/50 mb-6">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Pending Approval
                </CardTitle>
                <CardDescription>
                  These timesheets are waiting for your review
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingTimesheets.map((timesheet) => (
                  <TimesheetCard
                    key={timesheet.id}
                    timesheet={timesheet}
                    token={token}
                    onApprove={handleApprove}
                    isApproving={approvingId === timesheet.id}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {/* No pending timesheets message */}
          {pendingTimesheets.length === 0 && (
            <Card className="glass border-border/50 mb-6">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Pending Approval
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <CheckCircle2 className="h-12 w-12 text-green-500/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    No timesheets pending approval
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* History */}
          {historyTimesheets.length > 0 && (
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-muted-foreground">
                  <History className="h-5 w-5" />
                  History
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {historyTimesheets.map((timesheet) => (
                  <TimesheetCard
                    key={timesheet.id}
                    timesheet={timesheet}
                    token={token}
                  />
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
