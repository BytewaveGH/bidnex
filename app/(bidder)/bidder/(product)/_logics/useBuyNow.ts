"use client";

import { useState } from "react";
import { useAxios } from "@/hooks/use-axios";

export function useBuyNow() {
  const callApi = useAxios();
  const [isLoading, setIsLoading] = useState(false);

  async function buyNow(lotId: number) {
    setIsLoading(true);
    try {
      const response: any = await callApi({
        method: "POST",
        url: `/bidder/lots/${lotId}/buy-now`,
      });
      if (response.status >= 400) {
        const message =
          response.data?.error ?? response.data?.message ?? "Failed to complete purchase.";
        throw new Error(message);
      }
      return response.data;
    } finally {
      setIsLoading(false);
    }
  }

  return { buyNow, isLoading };
}
