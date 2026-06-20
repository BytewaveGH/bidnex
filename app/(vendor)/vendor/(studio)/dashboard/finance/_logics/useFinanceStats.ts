"use client";

import { useMemo } from "react";

import { useFetchData } from "@/hooks/use-fetch-data";

export type FinanceStats = {
  totalEarnings: number;
  availableBalance: number;
  pendingPayments: number;
  platformFee: number;
  netRevenue: number;
  earningsChange?: number;
  totalSales: number;
};

type FinanceStatsApiPayload = FinanceStats | { data: FinanceStats; status: boolean };

function normalizeFinanceStats(raw: unknown): FinanceStats | null {
  if (!raw || typeof raw !== "object") return null;

  const payload = raw as Record<string, unknown>;

  if (typeof payload.totalEarnings === "number") {
    return {
      totalEarnings: payload.totalEarnings,
      availableBalance: (payload.availableBalance as number) ?? 0,
      pendingPayments: (payload.pendingPayments as number) ?? 0,
      platformFee: (payload.platformFee as number) ?? 0,
      netRevenue: (payload.netRevenue as number) ?? 0,
      earningsChange: payload.earningsChange as number | undefined,
      totalSales: (payload.totalSales as number) ?? 0,
    };
  }

  if (payload.data && typeof payload.data === "object") {
    return normalizeFinanceStats(payload.data);
  }

  return null;
}

export function useFinanceStats() {
  const result = useFetchData<FinanceStatsApiPayload>("/vendor/finance/stats");

  const data = useMemo(() => normalizeFinanceStats(result.data), [result.data]);

  return {
    data,
    isLoading: result.isLoading,
    error: result.error ? "Failed to load finance stats." : null,
  };
}
