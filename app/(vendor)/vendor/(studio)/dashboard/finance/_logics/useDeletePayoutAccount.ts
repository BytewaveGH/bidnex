"use client";

import { useState } from "react";

import { useAxios } from "@/hooks/use-axios";

export function useDeletePayoutAccount() {
  const callApi = useAxios();
  const [loadingId, setLoadingId] = useState<number | null>(null);

  async function deleteAccount(id: number) {
    setLoadingId(id);
    try {
      const response: any = await callApi({
        method: "DELETE",
        url: `/vendor/finance/payout-accounts/${id}`,
      });
      if (response.status >= 400) {
        const message = response.data?.message ?? response.data?.error ?? "Failed to remove account.";
        throw new Error(message);
      }
      return response.data;
    } finally {
      setLoadingId(null);
    }
  }

  return { deleteAccount, loadingId };
}
