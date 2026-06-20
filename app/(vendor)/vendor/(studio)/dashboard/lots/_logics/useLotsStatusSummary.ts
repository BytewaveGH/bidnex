"use client";

import { useFetchData } from "@/hooks/use-fetch-data";

export type LotsStatusSummary = {
  active: number;
  pendingReview: number;
  ended: number;
  total: number;
};

export function useLotsStatusSummary() {
  const result = useFetchData<{ data: LotsStatusSummary; status: boolean }>("/vendor/lots/status-summary");
  return {
    data: result.data?.data ?? null,
    isLoading: result.isLoading,
    error: result.error ? "Failed to load lot status summary." : null,
  };
}
