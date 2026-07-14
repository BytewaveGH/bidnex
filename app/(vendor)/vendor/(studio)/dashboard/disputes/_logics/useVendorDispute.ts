"use client";

import { useCallback, useEffect, useState } from "react";
import { useAxios } from "@/hooks/use-axios";
import {
  VENDOR_DISPUTES_USE_SAMPLE_DATA,
  addMockVendorDisputeMessage,
  getMockVendorDisputeDetail,
} from "@/lib/mock-vendor";
import {
  normalizeDisputeDetail,
  type DisputeDetail,
} from "@/app/(bidder)/bidder/(billing)/_logics/disputes";

export function useVendorDispute(disputeId: number | null) {
  const callApi = useAxios();
  const [data, setData] = useState<DisputeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(disputeId));
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!disputeId) return;

    if (VENDOR_DISPUTES_USE_SAMPLE_DATA) {
      const sample = getMockVendorDisputeDetail(disputeId);
      setData(sample);
      setError(sample ? null : "Dispute not found.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response: any = await callApi({
        method: "GET",
        url: `/vendor/disputes/${disputeId}`,
      });

      if (response.status >= 400) {
        const message =
          (response.data as { error?: string; message?: string })?.error ??
          (response.data as { message?: string })?.message ??
          "Failed to load dispute.";
        setError(message);
        setData(null);
        return;
      }

      const body = response.data as { data?: Record<string, unknown> };
      const raw = body.data ?? (response.data as Record<string, unknown>);
      setData(normalizeDisputeDetail(raw));
    } catch {
      setError("Network error. Please check your connection and try again.");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [disputeId]);

  const appendDemoMessage = useCallback(
    (payload: { message: string; attachments: string[] }) => {
      if (!disputeId || !VENDOR_DISPUTES_USE_SAMPLE_DATA) return null;
      const updated = addMockVendorDisputeMessage(disputeId, payload);
      if (updated) setData(updated);
      return updated;
    },
    [disputeId],
  );

  useEffect(() => {
    if (!disputeId) {
      setData(null);
      setIsLoading(false);
      return;
    }

    void refetch();
  }, [disputeId, refetch]);

  return {
    data,
    isLoading,
    error,
    refetch,
    isSampleData: VENDOR_DISPUTES_USE_SAMPLE_DATA,
    appendDemoMessage,
  };
}
