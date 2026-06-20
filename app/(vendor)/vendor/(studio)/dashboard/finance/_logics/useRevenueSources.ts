"use client";

import { useMemo } from "react";

import { useFetchData } from "@/hooks/use-fetch-data";

export type RevenueSource = {
  source: string;
  label: string;
  amount: number;
  count: number;
  percent: number;
};

type RevenueSourceApiItem = {
  source?: string;
  label?: string;
  amount?: number;
  count?: number;
  percent?: number;
  percentage?: number;
};

function formatSourceLabel(source: string) {
  return source
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function mapRevenueSource(item: RevenueSourceApiItem): RevenueSource {
  const source = item.source ?? item.label ?? "unknown";
  return {
    source,
    label: item.label ?? formatSourceLabel(source),
    amount: item.amount ?? 0,
    count: item.count ?? 0,
    percent: item.percent ?? item.percentage ?? 0,
  };
}

function normalizeRevenueSources(raw: unknown): RevenueSource[] {
  if (Array.isArray(raw)) {
    return raw.map((item) => mapRevenueSource(item as RevenueSourceApiItem));
  }

  if (raw && typeof raw === "object" && Array.isArray((raw as { sources?: unknown[] }).sources)) {
    return (raw as { sources: RevenueSourceApiItem[] }).sources.map(mapRevenueSource);
  }

  return [];
}

export function useRevenueSources() {
  const result = useFetchData<{ data: unknown; status: boolean }>("/vendor/finance/revenue-sources");

  const data = useMemo(() => {
    const sources = normalizeRevenueSources(result.data?.data);
    return sources.length ? sources : null;
  }, [result.data?.data]);

  return {
    data,
    isLoading: result.isLoading,
    error: result.error ? "Failed to load revenue sources." : null,
  };
}
