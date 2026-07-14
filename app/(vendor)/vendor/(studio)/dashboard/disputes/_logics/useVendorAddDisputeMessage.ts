"use client";

import { useState } from "react";
import { useAxios } from "@/hooks/use-axios";
import { VENDOR_DISPUTES_USE_SAMPLE_DATA } from "@/lib/mock-vendor";
import { type AddDisputeMessagePayload } from "@/app/(bidder)/bidder/(billing)/_logics/disputes";

export function useVendorAddDisputeMessage() {
  const callApi = useAxios();
  const [isLoading, setIsLoading] = useState(false);

  async function addMessage(disputeId: number, payload: AddDisputeMessagePayload) {
    setIsLoading(true);

    try {
      if (VENDOR_DISPUTES_USE_SAMPLE_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        return { status: true, data: { disputeId, ...payload } };
      }

      const response: any = await callApi({
        method: "POST",
        url: `/vendor/disputes/${disputeId}/messages`,
        data: payload,
      });

      if (response.status >= 400) {
        const message =
          (response.data as { error?: string; message?: string })?.error ??
          (response.data as { message?: string })?.message ??
          "Failed to send message.";
        throw new Error(message);
      }

      return response.data;
    } finally {
      setIsLoading(false);
    }
  }

  return { addMessage, isLoading };
}
