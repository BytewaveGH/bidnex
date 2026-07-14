"use client";

import { useState } from "react";
import { useAxios } from "@/hooks/use-axios";
import { BILLING_USE_SAMPLE_DATA, addDemoDispute } from "@/lib/mock-bidder-billing";
import { type CreateDisputePayload } from "./disputes";

export function useCreateDispute() {
  const callApi = useAxios();
  const [isLoading, setIsLoading] = useState(false);

  async function createDispute(payload: CreateDisputePayload) {
    setIsLoading(true);

    try {
      if (BILLING_USE_SAMPLE_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return addDemoDispute(payload);
      }

      const response: any = await callApi({
        method: "POST",
        url: "/bidder/disputes",
        data: payload,
      });

      if (response.status >= 400) {
        const message =
          (response.data as { error?: string; message?: string })?.error ??
          (response.data as { message?: string })?.message ??
          "Failed to file dispute.";
        throw new Error(message);
      }

      return response.data;
    } finally {
      setIsLoading(false);
    }
  }

  return { createDispute, isLoading };
}
