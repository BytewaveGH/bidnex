"use client";

import { useFetchData } from "@/hooks/use-fetch-data";

export type DashboardStats = {
  totalRevenue: number;
  revenueLastMonth?: number;
  revenueChange?: number;
  winRate: number;
  winRateLastMonth?: number;
  winRateChange?: number;
  activeAuctions: number;
  activeAuctionsLastMonth?: number;
  closedAuctions?: number;
  avgBidsPerLot: number;
  avgBidsPerLotLastMonth?: number;
};

export function useDashboardStats() {
  const result = useFetchData<{ data: DashboardStats; status: boolean }>("/vendor/dashboard/stats");
  return {
    data: result.data?.data ?? null,
    isLoading: result.isLoading,
    error: result.error ? "Failed to load dashboard stats." : null,
  };
}
