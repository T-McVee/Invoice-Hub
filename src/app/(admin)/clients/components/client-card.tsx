'use client';

import { Client } from '@/types';
import { Building2, Mail, FileText, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ClientCardProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

export function ClientCard({ client, onEdit, onDelete }: ClientCardProps) {
  const totalRecipients =
    client.timesheetRecipients.length + client.invoiceRecipients.length;

  return (
    <div className="glass rounded-xl p-5 hover-lift group">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-lg">
              {client.name}
            </h3>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                {totalRecipients} recipient{totalRecipients !== 1 ? 's' : ''}
              </span>
              {client.togglClientId && (
                <span className="px-2 py-0.5 rounded-md bg-chart-1/10 text-chart-1 text-xs font-medium">
                  Toggl Linked
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(client)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(client)}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Recipient details */}
      <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Timesheet Recipients
          </p>
          {client.timesheetRecipients.length > 0 ? (
            <div className="space-y-1">
              {client.timesheetRecipients.map((email, i) => (
                <p key={i} className="text-sm text-foreground truncate">
                  {email}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground/60 italic">
              No recipients
            </p>
          )}
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Invoice Recipients
          </p>
          {client.invoiceRecipients.length > 0 ? (
            <div className="space-y-1">
              {client.invoiceRecipients.map((email, i) => (
                <p key={i} className="text-sm text-foreground truncate">
                  {email}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground/60 italic">
              No recipients
            </p>
          )}
        </div>
      </div>

      {/* Notes */}
      {client.notes && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            <FileText className="h-3.5 w-3.5" />
            Notes
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {client.notes}
          </p>
        </div>
      )}
    </div>
  );
}
