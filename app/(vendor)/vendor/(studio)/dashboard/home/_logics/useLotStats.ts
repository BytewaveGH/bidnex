"use client";

import { useEffect, useState } from "react";

import { useAxios } from "@/hooks/use-axios";

export type LotStats = {
  live?: number;
  scheduled?: number;
  ended?: number;
  closed?: number;
  draft?: number;
  submitted?: number;
  uniqueBidders?: number;
};

export function useLotStats() {
  const callApi = useAxios();
  const [data, setData] = useState<LotStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      setIsLoading(true);
      setError(null);
      try {
        const response: any = await callApi({ method: "GET", url: "/vendor/lots/stats" });
        if (cancelled) return;
        if (response.status >= 400) {
          setError(
            (response.data as { error?: string; message?: string })?.error ??
              (response.data as { message?: string })?.message ??
              "Failed to load lot stats.",
          );
          setData(null);
          return;
        }
        setData((response.data as { data: LotStats }).data);
      } catch {
        if (!cancelled) {
          setError("Network error.");
          setData(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void fetchStats();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, isLoading, error };
}
