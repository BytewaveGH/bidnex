"use client";

import { useFetchData } from "@/hooks/use-fetch-data";

export type AuctionToday = {
  id: string | number;
  title: string;
  status: string;
  startTime?: string;
  endTime?: string;
  bidEndTime?: string;
  bids?: number;
  bidCount?: number;
  startingBid?: number;
  currentBid?: number;
  category?: string;
  primaryImage?: string;
};

export function useAuctionsToday() {
  const result = useFetchData<{ data: unknown; status: boolean }>("/vendor/auctions/today");
  const raw = result.data?.data;
  return {
    data: Array.isArray(raw) ? (raw as AuctionToday[]) : null,
    isLoading: result.isLoading,
    error: result.error ? "Failed to load today's auctions." : null,
  };
}
