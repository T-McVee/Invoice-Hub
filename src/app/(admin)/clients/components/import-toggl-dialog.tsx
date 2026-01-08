'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { X, Loader2, Download, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TogglClient } from '@/lib/toggl/client';
import { useInvalidateClients } from '@/lib/hooks';

interface ImportTogglDialogProps {
  open: boolean;
  onClose: () => void;
  existingTogglClientIds: Set<string>;
}

async function fetchTogglClients(): Promise<{ clients: TogglClient[] }> {
  const response = await fetch('/api/toggl/clients');
  if (!response.ok) {
    let errorMessage = 'Failed to fetch Toggl clients';
    try {
      const data = await response.json();
      errorMessage = data.error || errorMessage;
    } catch {
      // Response body was empty or not JSON
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

async function importClient(togglClient: TogglClient): Promise<void> {
  const response = await fetch('/api/clients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: togglClient.name,
      togglClientId: togglClient.id.toString(),
      notes: togglClient.notes || null,
    }),
  });

  if (!response.ok) {
    let errorMessage = 'Failed to import client';
    try {
      const data = await response.json();
      errorMessage = data.error || errorMessage;
    } catch {
      // Response body was empty or not JSON
    }
    throw new Error(errorMessage);
  }
}

export function ImportTogglDialog({
  open,
  onClose,
  existingTogglClientIds,
}: ImportTogglDialogProps) {
  const [importingId, setImportingId] = useState<number | null>(null);
  const [importedIds, setImportedIds] = useState<Set<number>>(new Set());

  const invalidateClients = useInvalidateClients();

  const { data, isLoading, error } = useQuery({
    queryKey: ['toggl-clients'],
    queryFn: fetchTogglClients,
    enabled: open,
    staleTime: 30000, // Cache for 30 seconds
  });

  const mutation = useMutation({
    mutationFn: importClient,
    onSuccess: (_, togglClient) => {
      setImportedIds((prev) => new Set([...prev, togglClient.id]));
      setImportingId(null);
      invalidateClients();
    },
    onError: () => {
      setImportingId(null);
    },
  });

  const handleImport = (togglClient: TogglClient) => {
    setImportingId(togglClient.id);
    mutation.mutate(togglClient);
  };

  if (!open) return null;

  // Filter out already imported clients
  const availableClients =
    data?.clients.filter(
      (c) => !existingTogglClientIds.has(c.id.toString()) && !importedIds.has(c.id)
    ) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative glass rounded-2xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col animate-scale-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Import from Toggl</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Select clients to import from your Toggl workspace
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-3" />
              <p>Loading Toggl clients...</p>
            </div>
          ) : error ? (
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Failed to load Toggl clients</p>
                  <p className="text-sm text-destructive/80 mt-1">
                    {error instanceof Error ? error.message : 'Unknown error occurred'}
                  </p>
                </div>
              </div>
            </div>
          ) : availableClients.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-success/50" />
              <p className="font-medium text-foreground">All caught up!</p>
              <p className="text-sm mt-1">All Toggl clients have already been imported.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableClients.map((togglClient) => (
                <div
                  key={togglClient.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border/30 hover:bg-muted/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-chart-1/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-chart-1" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{togglClient.name}</p>
                      {togglClient.notes && (
                        <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {togglClient.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleImport(togglClient)}
                    disabled={importingId === togglClient.id}
                    className="gap-2"
                  >
                    {importingId === togglClient.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Import
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Import error */}
          {mutation.isError && (
            <div className="mt-4 rounded-xl bg-destructive/10 border border-destructive/20 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">
                  {mutation.error instanceof Error
                    ? mutation.error.message
                    : 'Failed to import client'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/50 bg-muted/30">
          <Button variant="outline" onClick={onClose} className="w-full">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
