"use client";

import { useState } from "react";
import { useAxios } from "@/hooks/use-axios";
import { showToast } from "@/components/templates/toast-template";

export function useAddToWatchlist() {
  const callApi = useAxios();
  const [isLoading, setIsLoading] = useState(false);

  async function addToWatchlist(lotId: number) {
    setIsLoading(true);
    try {
      const response: any = await callApi({
        method: "POST",
        url: `/bidder/watchlist/${lotId}`,
      });

      if (response.status >= 400) {
        const message =
          (response.data as { error?: string; message?: string })?.error ??
          (response.data as { message?: string })?.message ??
          "Failed to add to watchlist.";
        showToast("failure", message, "Watchlist");
        return;
      }

      const msg = (response.data as { message?: string })?.message ?? "Added to watchlist";
      showToast("success", msg, "Watchlist");
    } catch {
      showToast("failure", "Network error. Please try again.", "Watchlist");
    } finally {
      setIsLoading(false);
    }
  }

  return { addToWatchlist, isLoading };
}
