"use client";

import { useEffect, useState } from "react";
import { useAxios } from "@/hooks/use-axios";
import {
  buildLotsParams,
  type LotsApiResponse,
  type LotsPage,
  type LotsQueryParams,
} from "./auctions";

export function usePublicLots(params: LotsQueryParams) {
  const callApi = useAxios();
  const [data, setData] = useState<LotsPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchLots() {
      setIsLoading(true);
      setError(null);

      try {
        const response: any = await callApi({
          method: "GET",
          url: "/public/lots",
          params: buildLotsParams(params),
        });

        if (cancelled) return;

        if (response.status >= 400) {
          const message =
            (response.data as { error?: string; message?: string })?.error ??
            (response.data as { message?: string })?.message ??
            "Failed to load lots.";
          setError(message);
          setData(null);
          return;
        }

        const body = response.data as LotsApiResponse;
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

    void fetchLots();

    return () => {
      cancelled = true;
    };
  }, [
    params.page,
    params.limit,
    params.search,
    params.condition,
    params.minPrice,
    params.maxPrice,
    params.categoryId,
    params.auctionId,
  ]);

  return { data, isLoading, error };
}
