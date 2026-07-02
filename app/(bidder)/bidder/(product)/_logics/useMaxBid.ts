"use client";

import { useState } from "react";
import { useAxios } from "@/hooks/use-axios";

export function useMaxBid() {
  const callApi = useAxios();
  const [isLoading, setIsLoading] = useState(false);

  async function setMaxBid(lotId: number, amount: number) {
    setIsLoading(true);
    try {
      const response: any = await callApi({
        method: "POST",
        url: `/bidder/lots/${lotId}/max-bid`,
        data: { MaxAmount: amount },
      });
      if (response.status >= 400) {
        const message =
          response.data?.error ?? response.data?.message ?? "Failed to set max bid.";
        throw new Error(message);
      }
      return response.data;
    } finally {
      setIsLoading(false);
    }
  }

  return { setMaxBid, isLoading };
}
