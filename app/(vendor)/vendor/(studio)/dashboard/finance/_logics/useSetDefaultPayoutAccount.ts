"use client";

import { useState } from "react";

import { useAxios } from "@/hooks/use-axios";

export function useSetDefaultPayoutAccount() {
  const callApi = useAxios();
  const [loadingId, setLoadingId] = useState<number | null>(null);

  async function setDefault(id: number) {
    setLoadingId(id);
    try {
      const response: any = await callApi({
        method: "PUT",
        url: `/vendor/finance/payout-accounts/${id}/default`,
      });
      if (response.status >= 400) {
        const message = response.data?.message ?? response.data?.error ?? "Failed to update default account.";
        throw new Error(message);
      }
      return response.data;
    } finally {
      setLoadingId(null);
    }
  }

  return { setDefault, loadingId };
}
