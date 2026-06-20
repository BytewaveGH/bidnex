"use client";

import { useFetchData } from "@/hooks/use-fetch-data";

export type LotsStatsMetric = {
  value: number;
  previousPeriod?: number;
  changePercent?: number;
  changeAbsolute?: number;
  changePoints?: number;
  currency?: string;
};

export type LotsStats = {
  auctionRevenue: LotsStatsMetric;
  lotsSubmitted: LotsStatsMetric;
  uniqueBidders: LotsStatsMetric;
  avgReservePrice: LotsStatsMetric;
  openDisputes: LotsStatsMetric;
  approvalRate: LotsStatsMetric;
};

export function useLotsStats() {
  const result = useFetchData<{ data: LotsStats; status: boolean }>("/vendor/lots/stats");
  return {
    data: result.data?.data ?? null,
    isLoading: result.isLoading,
    error: result.error ? "Failed to load lot stats." : null,
  };
}
