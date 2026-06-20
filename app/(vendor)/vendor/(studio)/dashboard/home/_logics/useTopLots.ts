"use client";

import { useMemo } from "react";

import { useFetchData } from "@/hooks/use-fetch-data";

import type { OpportunityRow } from "../_components/opportunities-table/schema";

type TopLotApiItem = {
  id: string | number;
  title: string;
  status: string;
  bids?: number;
  bidCount?: number;
  activity?: string;
  currentBid?: number;
  topBid?: number;
};

function mapStatus(status: string): string {
  const s = status?.toLowerCase();
  if (s === "live") return "Live";
  if (s === "scheduled") return "Scheduled";
  if (s === "ended" || s === "closed") return "Ended";
  return "Draft";
}

function mapActivity(lot: TopLotApiItem): string {
  if (lot.activity) {
    const a = lot.activity.toLowerCase();
    if (a.includes("expiring")) return "Expiring Soon";
    if (a.includes("withdrawn")) return "Withdrawn";
    if (a === "no bids" || a === "no_bids") return "No Bids";
    return "Active";
  }
  const bids = lot.bids ?? lot.bidCount ?? 0;
  if ((lot.status ?? "").toLowerCase() === "withdrawn") return "Withdrawn";
  if (bids === 0) return "No Bids";
  return "Active";
}

function mapTopLot(lot: TopLotApiItem): OpportunityRow {
  const currentBid = lot.currentBid ?? lot.topBid ?? 0;
  return {
    id: String(lot.id),
    title: lot.title,
    status: mapStatus(lot.status),
    bids: lot.bids ?? lot.bidCount ?? 0,
    activity: mapActivity(lot),
    currentBid: `GHS ${currentBid.toLocaleString("en-US")}`,
  };
}

function extractLots(raw: unknown): TopLotApiItem[] {
  if (Array.isArray(raw)) return raw as TopLotApiItem[];
  if (raw && typeof raw === "object" && Array.isArray((raw as { lots?: unknown }).lots)) {
    return (raw as { lots: TopLotApiItem[] }).lots;
  }
  return [];
}

export function useTopLots() {
  const result = useFetchData<{ data: unknown; status: boolean }>("/vendor/lots/top", {
    params: { limit: 10 },
  });

  const data = useMemo(() => {
    const items = extractLots(result.data?.data);
    return items.map(mapTopLot);
  }, [result.data?.data]);

  return {
    data,
    isLoading: result.isLoading,
    error: result.error ? "Failed to load top lots." : null,
  };
}
