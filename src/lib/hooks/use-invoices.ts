'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Invoice } from '@/types';

export const INVOICES_QUERY_KEY = ['invoices'] as const;

export interface InvoicesResponse {
  invoices: Invoice[];
}

async function fetchInvoices(): Promise<InvoicesResponse> {
  const response = await fetch('/api/invoices');
  if (!response.ok) {
    throw new Error('Failed to fetch invoices');
  }
  return response.json();
}

/**
 * Hook for fetching invoices list
 */
export function useInvoices() {
  const query = useQuery({
    queryKey: INVOICES_QUERY_KEY,
    queryFn: fetchInvoices,
  });

  return {
    ...query,
    invoices: query.data?.invoices ?? [],
  };
}

/**
 * Helper to invalidate invoices cache from anywhere
 */
export function useInvalidateInvoices() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEY });
}

async function sendInvoice(id: string): Promise<{ invoice: Invoice }> {
  const response = await fetch(`/api/invoices/${id}/send`, { method: 'POST' });
  if (!response.ok) {
    const text = await response.text();
    let message = 'Failed to send invoice';
    try {
      const data = JSON.parse(text);
      message = data.error || message;
    } catch {
      // Response wasn't JSON
    }
    throw new Error(message);
  }
  return response.json();
}

/**
 * Hook for sending or resending an invoice email
 */
export function useSendInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEY });
    },
  });
}
