"use client";

import { useCallback, useEffect, useState } from "react";
import { useAxios } from "@/hooks/use-axios";
import type { Auction, AuctionsApiResponse } from "./auctions";

export function usePublicAuctionById(id: string) {
  const callApi = useAxios();
  const [data, setData] = useState<Auction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resyncToken, setResyncToken] = useState(0);
  const refetch = useCallback(() => setResyncToken((t) => t + 1), []);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function fetchAuction() {
      setIsLoading(true);
      setError(null);

      try {
        const response: any = await callApi({
          method: "GET",
          url: "/public/auctions",
          params: { limit: 100 },
        });

        if (cancelled) return;

        if (response.status >= 400) {
          const message =
            (response.data as { error?: string; message?: string })?.error ??
            (response.data as { message?: string })?.message ??
            "Failed to load auction.";
          setError(message);
          setData(null);
          return;
        }

        const body = response.data as AuctionsApiResponse;
        const auction = body.data.data.find((a) => String(a.id) === String(id)) ?? null;
        setData(auction);
        if (!auction) setError("Auction not found.");
      } catch {
        if (!cancelled) {
          setError("Network error. Please check your connection and try again.");
          setData(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void fetchAuction();

    return () => {
      cancelled = true;
    };
  }, [id, resyncToken]);

  return { data, isLoading, error, refetch };
}
