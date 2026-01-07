'use client';

import { useQuery } from '@tanstack/react-query';
import { Building2, Loader2, ChevronDown, AlertTriangle } from 'lucide-react';
import { Client } from '@/types';

interface ClientSelectorProps {
  value: string;
  onChange: (clientId: string) => void;
  disabled?: boolean;
}

async function fetchClients(): Promise<Client[]> {
  const response = await fetch('/api/clients');
  if (!response.ok) {
    throw new Error('Failed to fetch clients');
  }
  const data = await response.json();
  return data.clients;
}

export function ClientSelector({
  value,
  onChange,
  disabled,
}: ClientSelectorProps) {
  const {
    data: clients,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['clients'],
    queryFn: fetchClients,
  });

  if (error) {
    return (
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          Client
        </label>
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-sm">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          Failed to load clients
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-foreground flex items-center gap-2">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        Client
      </label>
      <div className="relative group">
        {isLoading && (
          <div className="absolute right-12 top-1/2 -translate-y-1/2 z-10">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || isLoading}
          className="w-full px-4 py-3 pr-10 rounded-xl border border-border bg-card/50 
                     text-foreground font-medium focus:outline-none focus:ring-2 
                     focus:ring-ring focus:ring-offset-2 focus:ring-offset-background
                     disabled:opacity-50 disabled:cursor-not-allowed
                     appearance-none cursor-pointer transition-all
                     hover:border-primary/50 hover:bg-card"
        >
          <option value="">Select a client...</option>
          {clients?.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
      </div>
    </div>
  );
}
