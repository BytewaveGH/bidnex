"use client";

import { useMemo } from "react";

import { useFetchData } from "@/hooks/use-fetch-data";

export type RevenueChartRange = "weekly" | "monthly" | "yearly";

export type RevenueChartItem = {
  period: string;
  revenue: number;
  lots: number;
};

type RevenueChartApiItem = {
  period?: string;
  timestamp?: string;
  revenue?: number;
  lots?: number;
  commission?: number;
};

const DAY_NAMES_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const DAY_NAMES_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

function parsePeriod(period: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(period)) {
    return new Date(`${period}T00:00:00`);
  }
  if (/^\d{4}-\d{2}$/.test(period)) {
    return new Date(`${period}-01T00:00:00`);
  }
  if (/^\d{4}$/.test(period)) {
    return new Date(`${period}-01-01T00:00:00`);
  }
  return new Date(period);
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getSundayWeekStart(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  return start;
}

function getWeekOfMonth(date: Date) {
  return Math.ceil(date.getDate() / 7);
}

function weeksInMonth(year: number, monthIndex: number) {
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  return Math.ceil(lastDay / 7);
}

function monthBucket(period: string) {
  const match = period.match(/^(\d{4}-\d{2})/);
  return match ? match[1] : period;
}

function monthWeekKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-W${getWeekOfMonth(date)}`;
}

function mapChartItem(item: RevenueChartApiItem): RevenueChartItem {
  const period = item.period ?? item.timestamp ?? "";
  return {
    period,
    revenue: item.revenue ?? 0,
    lots: item.lots ?? item.commission ?? 0,
  };
}

function normalizeChartData(raw: unknown): RevenueChartItem[] {
  if (Array.isArray(raw)) {
    return raw.map((item) => mapChartItem(item as RevenueChartApiItem));
  }

  if (raw && typeof raw === "object" && Array.isArray((raw as { series?: unknown[] }).series)) {
    return (raw as { series: RevenueChartApiItem[] }).series.map(mapChartItem);
  }

  return [];
}

function mergeItems(items: RevenueChartItem[], bucketKey: (period: string) => string): RevenueChartItem[] {
  const buckets = new Map<string, RevenueChartItem>();

  for (const item of items) {
    const key = bucketKey(item.period);
    const existing = buckets.get(key);

    if (existing) {
      buckets.set(key, {
        period: key,
        revenue: existing.revenue + item.revenue,
        lots: existing.lots + item.lots,
      });
    } else {
      buckets.set(key, { period: key, revenue: item.revenue, lots: item.lots });
    }
  }

  return Array.from(buckets.values()).sort((a, b) => a.period.localeCompare(b.period));
}

function aggregateWeekly(items: RevenueChartItem[]): RevenueChartItem[] {
  const sorted = [...items].sort((a, b) => a.period.localeCompare(b.period));
  const weekStart = getSundayWeekStart(parsePeriod(sorted[0].period));
  const merged = new Map(
    mergeItems(sorted, (period) => toDateKey(parsePeriod(period))).map((item) => [item.period, item]),
  );

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + index);
    const key = toDateKey(day);
    return merged.get(key) ?? { period: key, revenue: 0, lots: 0 };
  });
}

function aggregateMonthly(items: RevenueChartItem[]): RevenueChartItem[] {
  const sorted = [...items].sort((a, b) => a.period.localeCompare(b.period));
  const anchor = parsePeriod(sorted[0].period);
  const year = anchor.getFullYear();
  const monthIndex = anchor.getMonth();
  const month = String(monthIndex + 1).padStart(2, "0");
  const merged = new Map(
    mergeItems(sorted, (period) => monthWeekKey(parsePeriod(period))).map((item) => [item.period, item]),
  );

  return Array.from({ length: weeksInMonth(year, monthIndex) }, (_, index) => {
    const week = index + 1;
    const key = `${year}-${month}-W${week}`;
    return merged.get(key) ?? { period: key, revenue: 0, lots: 0 };
  });
}

function aggregateYearly(items: RevenueChartItem[]): RevenueChartItem[] {
  const sorted = [...items].sort((a, b) => a.period.localeCompare(b.period));
  const year = parsePeriod(sorted[0].period).getFullYear();
  const merged = new Map(mergeItems(sorted, monthBucket).map((item) => [item.period, item]));

  return Array.from({ length: 12 }, (_, index) => {
    const month = String(index + 1).padStart(2, "0");
    const key = `${year}-${month}`;
    return merged.get(key) ?? { period: key, revenue: 0, lots: 0 };
  });
}

export function aggregateChartByRange(items: RevenueChartItem[], range: RevenueChartRange): RevenueChartItem[] {
  if (!items.length) return [];

  switch (range) {
    case "weekly":
      return aggregateWeekly(items);
    case "monthly":
      return aggregateMonthly(items);
    case "yearly":
      return aggregateYearly(items);
    default:
      return items;
  }
}

export function formatChartPeriodTick(period: string, range: RevenueChartRange) {
  if (range === "weekly" && /^\d{4}-\d{2}-\d{2}$/.test(period)) {
    return DAY_NAMES_SHORT[parsePeriod(period).getDay()];
  }

  if (range === "monthly") {
    const week = period.match(/-W(\d+)$/)?.[1];
    return week ? `Week ${week}` : period;
  }

  if (range === "yearly" && /^\d{4}-\d{2}$/.test(period)) {
    return new Intl.DateTimeFormat("en-US", { month: "short" }).format(parsePeriod(period));
  }

  return period;
}

export function formatChartPeriodTooltip(period: string, range: RevenueChartRange) {
  if (range === "weekly" && /^\d{4}-\d{2}-\d{2}$/.test(period)) {
    const date = parsePeriod(period);
    const dayName = DAY_NAMES_LONG[date.getDay()];
    const dateLabel = new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
    return `${dayName}, ${dateLabel}`;
  }

  if (range === "monthly") {
    const match = period.match(/^(\d{4})-(\d{2})-W(\d+)$/);
    if (match) {
      const [, year, month, week] = match;
      const monthName = new Intl.DateTimeFormat("en-US", { month: "long" }).format(
        new Date(Number(year), Number(month) - 1, 1),
      );
      return `Week ${week}, ${monthName} ${year}`;
    }
  }

  if (range === "yearly" && /^\d{4}-\d{2}$/.test(period)) {
    return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(parsePeriod(period));
  }

  return period;
}

export function useRevenueChart(range: RevenueChartRange = "monthly") {
  const result = useFetchData<{ data: unknown; status: boolean }>("/vendor/finance/revenue-chart", {
    params: { range },
  });

  const data = useMemo(() => {
    const items = normalizeChartData(result.data?.data);
    if (!items.length) return null;
    return aggregateChartByRange(items, range);
  }, [result.data?.data, range]);

  return {
    data,
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    error: result.error ? "Failed to load revenue chart." : null,
  };
}
