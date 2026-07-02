"use client";

import { useCallback, useEffect, useState } from "react";
import { useAxios } from "@/hooks/use-axios";
import { type AuctionLot } from "../../(all-items)/_logics/auctions";
import { showToast } from "@/components/templates/toast-template";

export type WatchlistItem = {
  id: number;
  lotId: number;
  createdAt: string;
  lot: AuctionLot;
};

type WatchlistPage = {
  count: number;
  page: number;
  limit: number;
  data: WatchlistItem[];
};

type WatchlistApiResponse = {
  data: WatchlistPage;
  status: boolean;
};

export function useWatchlist(params: { page?: number; limit?: number } = {}) {
  const callApi = useAxios();
  const [data, setData] = useState<WatchlistPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());
  const [resyncToken, setResyncToken] = useState(0);
  const refetch = useCallback(() => setResyncToken(t => t + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function fetchWatchlist() {
      setIsLoading(true);
      setError(null);

      try {
        const query: Record<string, number> = {};
        if (params.page !== undefined) query.page = params.page;
        if (params.limit !== undefined) query.limit = params.limit;

        const response: any = await callApi({
          method: "GET",
          url: "/bidder/watchlist",
          params: query,
        });

        if (cancelled) return;

        if (response.status >= 400) {
          const message =
            (response.data as { error?: string; message?: string })?.error ??
            (response.data as { message?: string })?.message ??
            "Failed to load watchlist.";
          setError(message);
          setData(null);
          return;
        }

        const body = response.data as WatchlistApiResponse;
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

    void fetchWatchlist();

    return () => {
      cancelled = true;
    };
  }, [params.page, params.limit, resyncToken]);

  async function removeFromWatchlist(lotId: number) {
    setRemovingIds(prev => new Set(prev).add(lotId));
    try {
      await callApi({ method: 'DELETE', url: `/bidder/watchlist/${lotId}` });
      setData(prev => {
        if (!prev) return prev;
        return { ...prev, data: prev.data.filter(item => item.lotId !== lotId), count: prev.count - 1 };
      });
      showToast('success', 'Item removed from your watchlist.');
    } catch {
      showToast('failure', 'Failed to remove item. Please try again.');
    } finally {
      setRemovingIds(prev => {
        const next = new Set(prev);
        next.delete(lotId);
        return next;
      });
    }
  }

  return { data, isLoading, error, removeFromWatchlist, removingIds, refetch };
}
