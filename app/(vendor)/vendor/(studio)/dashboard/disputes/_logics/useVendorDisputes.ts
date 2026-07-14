"use client";

import { useEffect, useState } from "react";
import { useAxios } from "@/hooks/use-axios";
import {
  VENDOR_DISPUTES_USE_SAMPLE_DATA,
  getMockVendorDisputesPage,
} from "@/lib/mock-vendor";
import {
  normalizeDisputesPage,
  type DisputesPage,
} from "@/app/(bidder)/bidder/(billing)/_logics/disputes";

export function useVendorDisputes(params: {
  page?: number;
  limit?: number;
  status?: string;
} = {}) {
  const callApi = useAxios();
  const [data, setData] = useState<DisputesPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const status = params.status;

  useEffect(() => {
    if (VENDOR_DISPUTES_USE_SAMPLE_DATA) {
      setData(getMockVendorDisputesPage(page, limit, status));
      setIsLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    async function fetchDisputes() {
      setIsLoading(true);
      setError(null);

      try {
        const response: any = await callApi({
          method: "GET",
          url: "/vendor/disputes",
          params: {
            page,
            limit,
            ...(status ? { status } : {}),
          },
        });

        if (cancelled) return;

        if (response.status >= 400) {
          const message =
            (response.data as { error?: string; message?: string })?.error ??
            (response.data as { message?: string })?.message ??
            "Failed to load disputes.";
          setError(message);
          setData({ count: 0, page, limit, data: [] });
          return;
        }

        setData(normalizeDisputesPage(response.data, page, limit));
      } catch {
        if (!cancelled) {
          setError("Network error. Please check your connection and try again.");
          setData({ count: 0, page, limit, data: [] });
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void fetchDisputes();

    return () => {
      cancelled = true;
    };
  }, [page, limit, status, refreshKey]);

  return {
    data,
    isLoading,
    error,
    refetch: () => setRefreshKey((value) => value + 1),
  };
}
