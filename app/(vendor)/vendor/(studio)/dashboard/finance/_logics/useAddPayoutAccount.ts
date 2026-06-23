"use client";

import { useState } from "react";

import { useAxios } from "@/hooks/use-axios";

type AddMomoAccountInput = {
  type: "mobile_money";
  provider: string;
  accountName: string;
  accountNo: string;
};

export function useAddPayoutAccount() {
  const callApi = useAxios();
  const [isLoading, setIsLoading] = useState(false);

  async function addAccount(input: AddMomoAccountInput) {
    setIsLoading(true);
    try {
      const response: any = await callApi({
        method: "POST",
        url: "/vendor/finance/payout-accounts",
        data: input,
      });
      if (response.status >= 400) {
        const message = response.data?.message ?? response.data?.error ?? "Failed to add account.";
        throw new Error(message);
      }
      return response.data;
    } finally {
      setIsLoading(false);
    }
  }

  return { addAccount, isLoading };
}
