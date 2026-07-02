"use client";

import { useCallback, useEffect, useState } from "react";

import { useAxios } from "@/hooks/use-axios";

import {
  buildAuctionsParams,
  type AuctionsApiResponse,
  type AuctionsPage,
  type AuctionsQueryParams,
} from "./auctions";

export function usePublicAuctions(params: AuctionsQueryParams, refreshToken = 0) {
  const callApi = useAxios();
  const [data, setData] = useState<AuctionsPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resyncToken, setResyncToken] = useState(0);
  const refetch = useCallback(() => setResyncToken(t => t + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function fetchAuctions() {
      setIsLoading(true);
      setError(null);

      try {
        const response: any = await callApi({
          method: "GET",
          url: "/public/auctions",
          params: buildAuctionsParams(params),
        });

        if (cancelled) return;

        if (response.status >= 400) {
          const message =
            (response.data as { error?: string; message?: string })?.error ??
            (response.data as { message?: string })?.message ??
            "Failed to load auctions.";
          setError(message);
          setData(null);
          return;
        }

        const body = response.data as AuctionsApiResponse;
        setData(body.data);
      } catch {
        if (!cancelled) {
          setError("Network error. Please check your connection and try again.");
          setData(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void fetchAuctions();

    return () => {
      cancelled = true;
    };
  }, [params.limit, params.page, params.search, params.status, params.featured, refreshToken, resyncToken]);

  return { data, isLoading, error, refetch };
}
