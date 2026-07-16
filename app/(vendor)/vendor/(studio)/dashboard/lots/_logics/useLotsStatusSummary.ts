"use client";

import { useFetchData } from "@/hooks/use-fetch-data";

export type LotReviewStatus = "draft" | "submitted" | "approved" | "rejected";

export type LotsStatusSummary = {
  draft: number;
  submitted: number;
  approved: number;
  rejected: number;
  total: number;
};

type StatusSummaryResponse = {
  data: { status: LotReviewStatus; count: number }[];
  status: boolean;
};

export function useLotsStatusSummary() {
  const result = useFetchData<StatusSummaryResponse>("/vendor/lots/status-summary");

  const data: LotsStatusSummary | null = Array.isArray(result.data?.data)
    ? result.data.data.reduce<LotsStatusSummary>(
        (summary, entry) => {
          if (entry.status in summary) summary[entry.status] += entry.count;
          summary.total += entry.count;
          return summary;
        },
        { draft: 0, submitted: 0, approved: 0, rejected: 0, total: 0 },
      )
    : null;

  return {
    data,
    isLoading: result.isLoading,
    error: result.error ? "Failed to load lot status summary." : null,
  };
}
