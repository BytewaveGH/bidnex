"use client";

import { useFetchData } from "@/hooks/use-fetch-data";

export type TrustScore = {
  score: number;
  percentile: number;
  updatedAt?: string;
};

export function useTrustScore() {
  const result = useFetchData<{ data: TrustScore; status: boolean }>("/vendor/finance/trust-score");
  return {
    data: result.data?.data ?? null,
    isLoading: result.isLoading,
    error: result.error ? "Failed to load trust score." : null,
  };
}
