'use client';

import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { X, Loader2, Save, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Client } from '@/types';
import { useInvalidateClients } from '@/lib/hooks';

interface ClientEditDialogProps {
  client: Client | null;
  open: boolean;
  onClose: () => void;
}

async function updateClient(
  id: string,
  data: Partial<Client>
): Promise<{ client: Client }> {
  const response = await fetch(`/api/clients/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.error || 'Failed to update client');
  }

  return response.json();
}

export function ClientEditDialog({
  client,
  open,
  onClose,
}: ClientEditDialogProps) {
  const [name, setName] = useState('');
  const [togglProjectId, setTogglProjectId] = useState('');
  const [timesheetRecipients, setTimesheetRecipients] = useState<string[]>([]);
  const [invoiceRecipients, setInvoiceRecipients] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const invalidateClients = useInvalidateClients();

  // Reset form when client changes
  useEffect(() => {
    if (client) {
      setName(client.name);
      setTogglProjectId(client.togglProjectId || '');
      setTimesheetRecipients([...client.timesheetRecipients]);
      setInvoiceRecipients([...client.invoiceRecipients]);
      setNotes(client.notes || '');
    }
  }, [client]);

  const mutation = useMutation({
    mutationFn: (data: Partial<Client>) => updateClient(client!.id, data),
    onSuccess: () => {
      invalidateClients();
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    mutation.mutate({
      name,
      togglProjectId: togglProjectId || null,
      timesheetRecipients: timesheetRecipients.filter((e) => e.trim()),
      invoiceRecipients: invoiceRecipients.filter((e) => e.trim()),
      notes: notes || null,
    });
  };

  const addRecipient = (type: 'timesheet' | 'invoice') => {
    if (type === 'timesheet') {
      setTimesheetRecipients([...timesheetRecipients, '']);
    } else {
      setInvoiceRecipients([...invoiceRecipients, '']);
    }
  };

  const removeRecipient = (type: 'timesheet' | 'invoice', index: number) => {
    if (type === 'timesheet') {
      setTimesheetRecipients(timesheetRecipients.filter((_, i) => i !== index));
    } else {
      setInvoiceRecipients(invoiceRecipients.filter((_, i) => i !== index));
    }
  };

  const updateRecipient = (
    type: 'timesheet' | 'invoice',
    index: number,
    value: string
  ) => {
    if (type === 'timesheet') {
      const updated = [...timesheetRecipients];
      updated[index] = value;
      setTimesheetRecipients(updated);
    } else {
      const updated = [...invoiceRecipients];
      updated[index] = value;
      setInvoiceRecipients(updated);
    }
  };

  if (!open || !client) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative glass rounded-2xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col animate-scale-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Edit Client
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Update client details and recipients
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Client Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter client name"
                className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 
                           text-foreground placeholder:text-muted-foreground
                           focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                required
              />
            </div>

            {/* Toggl Project ID */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Toggl Project ID
                <span className="text-muted-foreground font-normal ml-1">
                  (for timesheets)
                </span>
              </label>
              <input
                type="text"
                value={togglProjectId}
                onChange={(e) => setTogglProjectId(e.target.value)}
                placeholder="e.g., 123456789"
                className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 
                           text-foreground placeholder:text-muted-foreground
                           focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>

            {/* Timesheet Recipients */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">
                  Timesheet Recipients
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addRecipient('timesheet')}
                  className="text-primary hover:text-primary/80 gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {timesheetRecipients.length === 0 ? (
                  <p className="text-sm text-muted-foreground/60 italic py-2">
                    No recipients added
                  </p>
                ) : (
                  timesheetRecipients.map((email, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) =>
                          updateRecipient('timesheet', index, e.target.value)
                        }
                        placeholder="email@example.com"
                        className="flex-1 px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 
                                   text-foreground placeholder:text-muted-foreground
                                   focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRecipient('timesheet', index)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Invoice Recipients */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">
                  Invoice Recipients
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addRecipient('invoice')}
                  className="text-primary hover:text-primary/80 gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {invoiceRecipients.length === 0 ? (
                  <p className="text-sm text-muted-foreground/60 italic py-2">
                    No recipients added
                  </p>
                ) : (
                  invoiceRecipients.map((email, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) =>
                          updateRecipient('invoice', index, e.target.value)
                        }
                        placeholder="email@example.com"
                        className="flex-1 px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 
                                   text-foreground placeholder:text-muted-foreground
                                   focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRecipient('invoice', index)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes about this client..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 
                           text-foreground placeholder:text-muted-foreground resize-none
                           focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>
          </div>

          {/* Error message */}
          {mutation.isError && (
            <div className="mt-4 rounded-xl bg-destructive/10 border border-destructive/20 p-4">
              <p className="text-sm text-destructive">
                {mutation.error instanceof Error
                  ? mutation.error.message
                  : 'Failed to update client'}
              </p>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/50 bg-muted/30 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={mutation.isPending || !name.trim()}
            className="flex-1 gap-2"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
