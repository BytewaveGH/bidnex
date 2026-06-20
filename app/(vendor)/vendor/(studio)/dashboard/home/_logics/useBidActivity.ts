"use client";

import { useFetchData } from "@/hooks/use-fetch-data";

export type BidActivityItem = {
  period: string;
  bids: number;
};

type BidActivityApiItem = {
  period: string;
  bidCount?: number;
  bids?: number;
  count?: number;
};

export function useBidActivity() {
  const result = useFetchData<{ data: unknown; status: boolean }>("/vendor/dashboard/bid-activity");
  const raw = result.data?.data;
  const data: BidActivityItem[] = Array.isArray(raw)
    ? (raw as BidActivityApiItem[]).map((item) => ({
        period: item.period,
        bids: item.bidCount ?? item.bids ?? item.count ?? 0,
      }))
    : [];
  return {
    data: result.data ? data : null,
    isLoading: result.isLoading,
    error: result.error ? "Failed to load bid activity." : null,
  };
}
