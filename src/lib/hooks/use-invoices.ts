'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
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
