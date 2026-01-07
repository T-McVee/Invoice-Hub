'use client';

import { useQuery } from '@tanstack/react-query';
import { Building2, Loader2 } from 'lucide-react';
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
          <Building2 className="h-4 w-4" />
          Client
        </label>
        <div className="px-3 py-2 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive text-sm">
          Failed to load clients
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-foreground flex items-center gap-2">
        <Building2 className="h-4 w-4" />
        Client
      </label>
      <div className="relative">
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || isLoading}
          className="w-full px-3 py-2 rounded-lg border border-input bg-background 
                     text-foreground font-medium focus:outline-none focus:ring-2 
                     focus:ring-ring disabled:opacity-50
                     appearance-none cursor-pointer"
        >
          <option value="">Select a client...</option>
          {clients?.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {!isLoading && (
            <svg
              className="h-4 w-4 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
