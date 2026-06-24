"use client";

import { useFetchData } from "@/hooks/use-fetch-data";

export type PayoutRow = {
  id: number;
  lotId: number;
  lotTitle: string;
  grossAmount: number;
  platformCharge: number;
  transferAmount: number;
  status: "pending" | "processing" | "completed" | "failed";
  failureReason: string | null;
  createdAt: string;
};

type PayoutsResponse = {
  data: {
    count: number;
    page: number;
    limit: number;
    data: PayoutRow[];
  };
  status: boolean;
};

export function usePayouts({ page = 1, limit = 10 }: { page?: number; limit?: number } = {}) {
  const result = useFetchData<PayoutsResponse>("/vendor/finance/payouts", {
    params: { page, limit },
  });

  const raw = result.data?.data;
  return {
    data: Array.isArray(raw?.data) ? (raw?.data as PayoutRow[]) : null,
    count: raw?.count ?? 0,
    isLoading: result.isLoading,
    error: result.error ? "Failed to load payouts." : null,
    refetch: result.refetch,
  };
}
