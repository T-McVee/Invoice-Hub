'use client';

import { useState } from 'react';
import {
  Users,
  Download,
  Loader2,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Client } from '@/types';
import { useClients, useDeleteClient } from '@/lib/hooks';
import { ClientCard, ImportTogglDialog, ClientEditDialog } from './components';

export default function ClientsPage() {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);

  const { clients, isLoading, error } = useClients();
  const deleteMutation = useDeleteClient();

  const handleEdit = (client: Client) => {
    setEditingClient(client);
  };

  const handleDelete = (client: Client) => {
    setDeletingClient(client);
  };

  const confirmDelete = () => {
    if (deletingClient) {
      deleteMutation.mutate(deletingClient.id, {
        onSuccess: () => setDeletingClient(null),
      });
    }
  };

  const existingTogglClientIds = new Set(
    clients
      .filter((c) => c.togglClientId)
      .map((c) => c.togglClientId!)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            Clients
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your clients and their notification preferences.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setImportDialogOpen(true)}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Import from Toggl
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mb-3" />
          <p>Loading clients...</p>
        </div>
      ) : error ? (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-destructive">
                Failed to load clients
              </p>
              <p className="text-sm text-destructive/80 mt-1">
                {error instanceof Error ? error.message : 'Unknown error'}
              </p>
            </div>
          </div>
        </div>
      ) : clients.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            No clients yet
          </h3>
          <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
            Import clients from Toggl to get started managing timesheets and
            invoices.
          </p>
          <Button
            onClick={() => setImportDialogOpen(true)}
            className="mt-6 gap-2"
          >
            <Download className="h-4 w-4" />
            Import from Toggl
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Import Dialog */}
      <ImportTogglDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        existingTogglClientIds={existingTogglClientIds}
      />

      {/* Edit Dialog */}
      <ClientEditDialog
        client={editingClient}
        open={!!editingClient}
        onClose={() => setEditingClient(null)}
      />

      {/* Delete Confirmation Dialog */}
      {deletingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setDeletingClient(null)}
          />
          <div className="relative glass rounded-2xl w-full max-w-md mx-4 p-6 animate-scale-in">
            <h3 className="text-lg font-semibold text-foreground">
              Delete Client
            </h3>
            <p className="text-muted-foreground mt-2">
              Are you sure you want to delete{' '}
              <span className="font-medium text-foreground">
                {deletingClient.name}
              </span>
              ? This action cannot be undone.
            </p>

            {deleteMutation.isError && (
              <div className="mt-4 rounded-xl bg-destructive/10 border border-destructive/20 p-3">
                <p className="text-sm text-destructive">
                  {deleteMutation.error instanceof Error
                    ? deleteMutation.error.message
                    : 'Failed to delete client'}
                </p>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setDeletingClient(null)}
                className="flex-1"
                disabled={deleteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 gap-2"
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
