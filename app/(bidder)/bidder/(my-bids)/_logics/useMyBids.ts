"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useAxios } from "@/hooks/use-axios";
import { type AuctionLot } from "../../(all-items)/_logics/auctions";

export type MyBid = {
  id: number;
  lotId: number;
  bidderId: number;
  amount: number;
  isWinning: boolean;
  status: string;
  serverTimestamp: string;
};

export type MyBidLot = AuctionLot & {
  myBid?: MyBid;
};

type MyBidsPage = {
  count: number;
  page: number;
  limit: number;
  data: MyBidLot[];
};

type MyBidsApiResponse = {
  data: MyBidsPage;
  status: boolean;
};

export type MyBidsQueryParams = {
  page?: number;
  limit?: number;
};

function buildMyBidsParams(params: MyBidsQueryParams): Record<string, number> {
  const query: Record<string, number> = {};
  if (params.page !== undefined) query.page = params.page;
  if (params.limit !== undefined) query.limit = params.limit;
  return query;
}

function normalizeMyBidLots(lots: MyBidLot[], currentUserId: number): AuctionLot[] {
  return lots.map((lot) => ({
    ...lot,
    bidderIds: lot.bidderIds.includes(currentUserId)
      ? lot.bidderIds
      : [...lot.bidderIds, currentUserId],
  }));
}

export function useMyBids(params: MyBidsQueryParams = {}) {
  const callApi = useAxios();
  const { data: session } :any= useSession();
  const currentUserId = Number((session?.user as { userId?: number })?.userId);
  const [data, setData] = useState<MyBidsPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);
  const [resyncToken, setResyncToken] = useState(0);
  const refetch = useCallback(() => setResyncToken(t => t + 1), []);

  useEffect(() => {
    if (!session?.user) {
      setIsLoading(false);
      setData(null);
      return;
    }

    let cancelled = false;

    async function fetchMyBids() {
      if (!hasLoadedRef.current) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const response: any = await callApi({
          method: "GET",
          url: "/bidder/bids",
          params: buildMyBidsParams(params),
        });

        if (cancelled) return;

        if (response.status >= 400) {
          const message =
            (response.data as { error?: string; message?: string })?.error ??
            (response.data as { message?: string })?.message ??
            "Failed to load your bids.";
          setError(message);
          if (!hasLoadedRef.current) {
            setData(null);
          }
          return;
        }

        const body = response.data as MyBidsApiResponse;
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

    void fetchMyBids();

    return () => {
      cancelled = true;
    };
  }, [session?.user, params.page, params.limit, resyncToken]);

  const lots = data?.data && currentUserId
    ? normalizeMyBidLots(data.data, currentUserId)
    : [];

  return { data, lots, isLoading, error, refetch };
}

export function useMyBidsCount() {
  const callApi = useAxios();
  const { data: session } = useSession();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!session?.user) {
      setCount(0);
      return;
    }

    let cancelled = false;

    callApi({ method: "GET", url: "/bidder/bids", params: { page: 1, limit: 1 } })
      .then((res: any) => {
        if (cancelled || res.status >= 400) return;
        const body = res.data as MyBidsApiResponse;
        setCount(body.data?.count ?? 0);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [session?.user]);

  return count;
}
