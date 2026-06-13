"use client";

import { useEffect, useState } from "react";
import { useAxios } from "@/hooks/use-axios";
import { type AuctionLot } from "../../(all-items)/_logics/auctions";

type WonItemsPage = {
  count: number;
  page: number;
  limit: number;
  data: AuctionLot[];
};

type WonItemsApiResponse = {
  data: WonItemsPage;
  status: boolean;
};

export function useWonItems(params: { page?: number; limit?: number } = {}) {
  const callApi = useAxios();
  const [data, setData] = useState<WonItemsPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchWonItems() {
      setIsLoading(true);
      setError(null);

      try {
        const query: Record<string, number> = {};
        if (params.page !== undefined) query.page = params.page;
        if (params.limit !== undefined) query.limit = params.limit;

        const response: any = await callApi({
          method: "GET",
          url: "/bidder/lots/won",
          params: query,
        });

        if (cancelled) return;

        if (response.status >= 400) {
          const message =
            (response.data as { error?: string; message?: string })?.error ??
            (response.data as { message?: string })?.message ??
            "Failed to load won items.";
          setError(message);
          setData(null);
          return;
        }

        const body = response.data as WonItemsApiResponse;
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

    void fetchWonItems();

    return () => {
      cancelled = true;
    };
  }, [params.page, params.limit]);

  return { data, isLoading, error };
}

export function useWonItemsCount() {
  const callApi = useAxios();
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    callApi({ method: "GET", url: "/bidder/lots/won", params: { page: 1, limit: 1 } })
      .then((response: any) => {
        if (cancelled || response.status >= 400) return;
        const body = response.data as WonItemsApiResponse;
        setCount(body.data?.count ?? 0);
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, []);

  return count;
}
