'use client';

import { useState } from 'react';
import { Client } from '@/types';
import {
  Building2,
  Mail,
  FileText,
  Pencil,
  Trash2,
  Link2,
  Copy,
  RefreshCw,
  Check,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRegenerateToken } from '@/lib/hooks';

// Client-side JWT expiry decoder (doesn't verify signature, just reads payload)
function getTokenExpiryClient(token: string): Date | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return null;
    return new Date(payload.exp * 1000);
  } catch {
    return null;
  }
}

interface ClientCardProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

export function ClientCard({ client, onEdit, onDelete }: ClientCardProps) {
  const [copied, setCopied] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const regenerateMutation = useRegenerateToken();

  const totalRecipients =
    client.timesheetRecipients.length + client.invoiceRecipients.length;

  const portalUrl = client.portalToken
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/portal/${client.portalToken}`
    : null;

  const tokenExpiry = client.portalToken
    ? getTokenExpiryClient(client.portalToken)
    : null;

  const handleCopyLink = async () => {
    if (!portalUrl) return;
    try {
      await navigator.clipboard.writeText(portalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = portalUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRegenerate = () => {
    regenerateMutation.mutate(client.id, {
      onSuccess: () => {
        setShowRegenerateConfirm(false);
      },
    });
  };

  return (
    <>
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

      {/* Portal Link */}
      <div className="mt-4 pt-4 border-t border-border/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <Link2 className="h-3.5 w-3.5" />
            Client Portal
          </div>
          {tokenExpiry && (
            <span className="text-xs text-muted-foreground">
              Expires {tokenExpiry.toLocaleDateString()}
            </span>
          )}
        </div>
        {portalUrl ? (
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-muted/50 border border-border/50 text-sm text-muted-foreground truncate font-mono">
              /portal/{client.portalToken?.slice(0, 20)}...
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleCopyLink}
              className="text-muted-foreground hover:text-foreground flex-shrink-0"
              title="Copy portal link"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowRegenerateConfirm(true)}
              className="text-muted-foreground hover:text-foreground flex-shrink-0"
              title="Regenerate portal link"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground/60 italic flex-1">
              No portal link generated
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => regenerateMutation.mutate(client.id)}
              disabled={regenerateMutation.isPending}
              className="gap-1.5"
            >
              {regenerateMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Link2 className="h-3.5 w-3.5" />
              )}
              Generate Link
            </Button>
          </div>
        )}
      </div>
    </div>

    {/* Regenerate Confirmation Dialog */}
    {showRegenerateConfirm && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          onClick={() => setShowRegenerateConfirm(false)}
        />
        <div className="relative glass rounded-2xl w-full max-w-md mx-4 p-6 animate-scale-in">
          <h3 className="text-lg font-semibold text-foreground">
            Regenerate Portal Link
          </h3>
          <p className="text-muted-foreground mt-2">
            This will invalidate the current portal link for{' '}
            <span className="font-medium text-foreground">{client.name}</span>.
            Any shared links will stop working.
          </p>

          {regenerateMutation.isError && (
            <div className="mt-4 rounded-xl bg-destructive/10 border border-destructive/20 p-3">
              <p className="text-sm text-destructive">
                {regenerateMutation.error instanceof Error
                  ? regenerateMutation.error.message
                  : 'Failed to regenerate token'}
              </p>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowRegenerateConfirm(false)}
              className="flex-1"
              disabled={regenerateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRegenerate}
              disabled={regenerateMutation.isPending}
              className="flex-1 gap-2"
            >
              {regenerateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Regenerate
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
