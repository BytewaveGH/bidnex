"use client";

import { useMemo } from "react";

import { useFetchData } from "@/hooks/use-fetch-data";

export type LotsTopCategory = {
  name: string;
  share: number;
  color: string;
};

export type LotsTopProduct = {
  id: string;
  name: string;
  category: string;
  bids: number;
  topBid: string;
};

export type LotsTopData = {
  headline: string;
  categories: LotsTopCategory[];
  products: LotsTopProduct[];
};

const CATEGORY_COLORS = ["var(--chart-3)", "var(--chart-2)", "var(--chart-1)", "var(--chart-4)", "var(--chart-5)"];

type TopLotApiItem = {
  id: string | number;
  title: string;
  category?: string;
  startingBid?: number;
  currentBid?: number;
  bidCount?: number;
  margin?: number;
  status?: string;
  primaryImage?: string;
  revenueShare?: string | number;
  topBid?: number;
  currency?: string;
};

type TopLotsWrappedApiData = {
  revenueShare?: number;
  categories?: Array<{ name: string; share: number }>;
  lots?: TopLotApiItem[];
};

function formatTopBid(amount: number, currency = "GHS") {
  return `${currency} ${amount.toLocaleString("en-US")}`;
}

function extractTopLots(raw: unknown): TopLotApiItem[] {
  if (Array.isArray(raw)) return raw as TopLotApiItem[];
  if (raw && typeof raw === "object" && Array.isArray((raw as TopLotsWrappedApiData).lots)) {
    return (raw as TopLotsWrappedApiData).lots ?? [];
  }
  return [];
}

function buildCategoriesFromLots(lots: TopLotApiItem[]): LotsTopCategory[] {
  const counts = new Map<string, number>();
  for (const lot of lots) {
    const name = lot.category?.trim() || "Other";
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  const total = lots.length || 1;
  return Array.from(counts.entries()).map(([name, count], index) => ({
    name,
    share: Math.round((count / total) * 100),
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  }));
}

function mapWrappedTopLots(payload: TopLotsWrappedApiData): LotsTopData {
  const categories = (payload.categories ?? []).map((category, index) => ({
    name: category.name,
    share: category.share,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  }));

  const products = (payload.lots ?? []).map((lot) => ({
    id: String(lot.id),
    name: lot.title,
    category: lot.category ?? "—",
    bids: lot.bidCount ?? 0,
    topBid: formatTopBid(lot.topBid ?? lot.currentBid ?? lot.startingBid ?? 0, lot.currency ?? "GHS"),
  }));

  return {
    headline: payload.revenueShare ? `${payload.revenueShare}% of revenue` : `${products.length} top lots`,
    categories,
    products,
  };
}

function mapArrayTopLots(lots: TopLotApiItem[]): LotsTopData {
  const totalBids = lots.reduce((sum, lot) => sum + (lot.bidCount ?? 0), 0);

  return {
    headline: totalBids > 0 ? `${totalBids} bids on top lots` : `${lots.length} top lots`,
    categories: buildCategoriesFromLots(lots),
    products: lots.map((lot) => ({
      id: String(lot.id),
      name: lot.title,
      category: lot.category ?? "—",
      bids: lot.bidCount ?? 0,
      topBid: formatTopBid(lot.currentBid ?? lot.startingBid ?? 0),
    })),
  };
}

function mapTopLots(raw: unknown): LotsTopData | null {
  if (Array.isArray(raw)) {
    return raw.length ? mapArrayTopLots(raw) : { headline: "No top lots yet", categories: [], products: [] };
  }

  if (raw && typeof raw === "object") {
    const payload = raw as TopLotsWrappedApiData;
    if (Array.isArray(payload.lots) || payload.categories || payload.revenueShare !== undefined) {
      return mapWrappedTopLots(payload);
    }
  }

  return null;
}

export function useLotsTop(limit = 3) {
  const result = useFetchData<{ data: unknown; status: boolean }>("/vendor/lots/top", {
    params: { limit },
  });

  const data = useMemo(() => mapTopLots(result.data?.data), [result.data?.data]);

  return {
    data,
    isLoading: result.isLoading,
    error: result.error ? "Failed to load top lots." : null,
  };
}
