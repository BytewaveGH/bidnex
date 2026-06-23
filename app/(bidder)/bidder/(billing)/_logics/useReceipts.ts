"use client";

import { useFetchData } from "@/hooks/use-fetch-data";

export type ReceiptLot = {
  id: number;
  title: string;
  amount: number;
  fee: number;
};

export type Receipt = {
  reference: string;
  paidAt: string;
  subtotal: number;
  fee: number;
  total: number;
  lots: ReceiptLot[];
};

export function useReceipts() {
  const result = useFetchData<{ data: Receipt[]; status: boolean }>("/bidder/receipts");
  const raw = result.data?.data;
  return {
    data: Array.isArray(raw) ? raw : null,
    isLoading: result.isLoading,
    error: result.error ? "Failed to load receipts." : null,
  };
}
