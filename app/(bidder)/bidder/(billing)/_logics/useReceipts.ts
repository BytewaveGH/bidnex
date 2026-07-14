"use client";

import { useMemo } from "react";
import { useFetchData } from "@/hooks/use-fetch-data";
import { BILLING_USE_SAMPLE_DATA, mockReceipts } from "@/lib/mock-bidder-billing";

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

export type DisputableLot = ReceiptLot & {
  receiptReference: string;
  paidAt: string;
};

function normalizeReceiptLot(raw: Record<string, unknown>): ReceiptLot | null {
  const id = Number(raw.lotId ?? raw.id);
  if (!Number.isFinite(id) || id <= 0) return null;

  return {
    id,
    title: String(raw.title ?? raw.name ?? raw.lotTitle ?? "Untitled item"),
    amount: Number(raw.amount ?? raw.price ?? 0),
    fee: Number(raw.fee ?? 0),
  };
}

function normalizeReceipt(raw: Record<string, unknown>): Receipt {
  const lotsRaw = raw.lots ?? raw.items ?? raw.lineItems ?? [];
  const lots = Array.isArray(lotsRaw)
    ? lotsRaw
        .map((lot) => normalizeReceiptLot(lot as Record<string, unknown>))
        .filter((lot): lot is ReceiptLot => lot !== null)
    : [];

  return {
    reference: String(raw.reference ?? raw.ref ?? raw.paymentReference ?? ""),
    paidAt: String(raw.paidAt ?? raw.paid_at ?? raw.createdAt ?? new Date().toISOString()),
    subtotal: Number(raw.subtotal ?? 0),
    fee: Number(raw.fee ?? 0),
    total: Number(raw.total ?? 0),
    lots,
  };
}

function normalizeReceiptsResponse(payload: unknown): Receipt[] {
  if (BILLING_USE_SAMPLE_DATA) return mockReceipts;
  if (!payload || typeof payload !== "object") return [];

  const body = payload as Record<string, unknown>;
  const data = body.data;

  if (Array.isArray(data)) {
    return data.map((item) => normalizeReceipt(item as Record<string, unknown>));
  }

  if (data && typeof data === "object") {
    const page = data as Record<string, unknown>;
    if (Array.isArray(page.data)) {
      return page.data.map((item) => normalizeReceipt(item as Record<string, unknown>));
    }
  }

  return [];
}

export function useReceipts() {
  const result = useFetchData<{ data: unknown; status: boolean }>("/bidder/receipts", {
    enabled: !BILLING_USE_SAMPLE_DATA,
  });

  const data = useMemo(() => normalizeReceiptsResponse(result.data), [result.data]);

  return {
    data,
    isLoading: BILLING_USE_SAMPLE_DATA ? false : result.isLoading,
    error: BILLING_USE_SAMPLE_DATA ? null : result.error ? "Failed to load receipts." : null,
    refetch: result.refetch,
  };
}

export function useDisputableLots() {
  const { data: receipts, isLoading, error } = useReceipts();

  const lots = useMemo<DisputableLot[]>(() => {
    if (!receipts) return [];

    return receipts.flatMap((receipt) =>
      receipt.lots.map((lot) => ({
        ...lot,
        receiptReference: receipt.reference,
        paidAt: receipt.paidAt,
      })),
    );
  }, [receipts]);

  return { lots, isLoading, error };
}
