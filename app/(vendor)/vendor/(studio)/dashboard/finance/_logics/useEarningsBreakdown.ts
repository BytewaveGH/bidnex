"use client";

import { useMemo } from "react";

import { useFetchData } from "@/hooks/use-fetch-data";

export type EarningsBreakdownItem = {
  label: string;
  amount: number;
  currency: string;
  percent: number;
  key: string;
};

type EarningsBreakdownApiItem = {
  label?: string;
  amount?: number;
  currency?: string;
  percent?: number;
  percentage?: number;
};

type LegacyEarningsBreakdown = {
  gross?: number;
  fees?: number;
  net?: number;
};

const LABEL_KEYS: Record<string, string> = {
  "gross sales": "gross",
  "gross revenue": "gross",
  "platform fees": "fees",
  "net earnings": "net",
};

function toKey(label: string) {
  return LABEL_KEYS[label.toLowerCase()] ?? label.toLowerCase().replace(/\s+/g, "-");
}

function mapItem(item: EarningsBreakdownApiItem): EarningsBreakdownItem {
  const label = item.label ?? "Unknown";
  return {
    label,
    amount: item.amount ?? 0,
    currency: item.currency ?? "GHS",
    percent: item.percent ?? item.percentage ?? 0,
    key: toKey(label),
  };
}

function fromLegacy(payload: LegacyEarningsBreakdown): EarningsBreakdownItem[] {
  const gross = payload.gross ?? 0;
  const fees = payload.fees ?? 0;
  const net = payload.net ?? 0;
  const total = gross || fees + net;

  return [
    { label: "Gross Sales", amount: gross || total, currency: "GHS", percent: 100, key: "gross" },
    {
      label: "Platform Fees",
      amount: fees,
      currency: "GHS",
      percent: total > 0 ? (fees / total) * 100 : 0,
      key: "fees",
    },
    {
      label: "Net Earnings",
      amount: net,
      currency: "GHS",
      percent: total > 0 ? (net / total) * 100 : 0,
      key: "net",
    },
  ];
}

function normalizeEarningsBreakdown(raw: unknown): EarningsBreakdownItem[] {
  if (Array.isArray(raw)) {
    return raw.map((item) => mapItem(item as EarningsBreakdownApiItem));
  }

  if (raw && typeof raw === "object") {
    const payload = raw as LegacyEarningsBreakdown;
    if (payload.gross !== undefined || payload.fees !== undefined || payload.net !== undefined) {
      return fromLegacy(payload);
    }
  }

  return [];
}

export function useEarningsBreakdown(currency = "GHS") {
  const result = useFetchData<{ data: unknown; status: boolean }>("/vendor/finance/earnings-breakdown", {
    params: { currency },
  });

  const data = useMemo(() => {
    const items = normalizeEarningsBreakdown(result.data?.data);
    return items.length ? items : null;
  }, [result.data?.data]);

  return {
    data,
    isLoading: result.isLoading,
    error: result.error ? "Failed to load earnings breakdown." : null,
  };
}
