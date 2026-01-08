'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Client } from '@/types';

// Centralized query key - use this everywhere for client data
export const CLIENTS_QUERY_KEY = ['clients'] as const;

// API response type
export interface ClientsResponse {
  clients: Client[];
}

// Fetch function - single source of truth
async function fetchClients(): Promise<ClientsResponse> {
  const response = await fetch('/api/clients');
  if (!response.ok) {
    throw new Error('Failed to fetch clients');
  }
  return response.json();
}

async function deleteClientById(id: string): Promise<void> {
  const response = await fetch(`/api/clients/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const text = await response.text();
    let message = 'Failed to delete client';
    try {
      const data = JSON.parse(text);
      message = data.error || message;
    } catch {
      // Response wasn't JSON
    }
    throw new Error(message);
  }
}

/**
 * Hook for fetching clients list
 * Use this everywhere you need client data to ensure consistent caching
 */
export function useClients() {
  const query = useQuery({
    queryKey: CLIENTS_QUERY_KEY,
    queryFn: fetchClients,
  });

  return {
    ...query,
    clients: query.data?.clients ?? [],
  };
}

/**
 * Hook for deleting a client with automatic cache invalidation
 */
export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteClientById,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEY });
    },
  });
}

/**
 * Helper to invalidate clients cache from anywhere
 */
export function useInvalidateClients() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEY });
}
