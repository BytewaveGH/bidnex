"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAxios } from "@/hooks/use-axios";
import type { LotsApiResponse, LotsPage } from "./auctions";

export function usePublicFeaturedLots(limit?: number) {
  const callApi = useAxios();
  const [data, setData] = useState<LotsPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);
  const [resyncToken, setResyncToken] = useState(0);
  const refetch = useCallback(() => setResyncToken((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function fetchFeaturedLots() {
      if (!hasLoadedRef.current) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const response: any = await callApi({
          method: "GET",
          url: "/public/lots/featured",
          params: limit !== undefined ? { limit } : undefined,
        });

        if (cancelled) return;

        if (response.status >= 400) {
          const message =
            (response.data as { error?: string; message?: string })?.error ??
            (response.data as { message?: string })?.message ??
            "Failed to load featured items.";
          setError(message);
          if (!hasLoadedRef.current) {
            setData(null);
          }
          return;
        }

        const body = response.data as LotsApiResponse;
        setData(body.data);
        hasLoadedRef.current = true;
      } catch {
        if (!cancelled) {
          setError("Network error. Please check your connection and try again.");
          if (!hasLoadedRef.current) {
            setData(null);
          }
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void fetchFeaturedLots();

    return () => {
      cancelled = true;
    };
  }, [limit, resyncToken]);

  return { data, isLoading, error, refetch };
}
