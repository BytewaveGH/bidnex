"use client";

import { useEffect, useState } from "react";

import { useAxios } from "@/hooks/use-axios";

import {
  buildVendorLotsParams,
  type VendorLotsApiResponse,
  type VendorLotsPage,
  type VendorLotsQueryParams,
} from "./vendor-lots";

export function useVendorLots(params: VendorLotsQueryParams, refreshToken = 0) {
  const callApi = useAxios();
  const [data, setData] = useState<VendorLotsPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchLots() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await callApi({
          method: "GET",
          url: "/vendor/lots",
          params: buildVendorLotsParams(params),
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

        const body = response.data as VendorLotsApiResponse;
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
    params.condition,
    params.limit,
    params.page,
    params.reviewStatus,
    params.search,
    refreshToken,
  ]);

  return {
    data,
    isLoading,
    error,
  };
}
