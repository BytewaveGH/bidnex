"use client";

import { useState } from "react";

import { useAxios } from "@/hooks/use-axios";

type CheckoutResponse = {
  paymentUrl: string;
  subtotal: number;
  fee: number;
  total: number;
};

export function useGeneratePaymentLink() {
  const callApi = useAxios();
  const [isLoading, setIsLoading] = useState(false);

  async function generatePaymentLink(lotIds: number[]): Promise<CheckoutResponse> {
    setIsLoading(true);
    try {
      const response: any = await callApi({
        method: "POST",
        url: "/bidder/checkout",
        data: { lotIds },
      });
      if (response.status >= 400) {
        const message = response.data?.message ?? response.data?.error ?? "Failed to generate payment link.";
        throw new Error(message);
      }
      return response.data?.data as CheckoutResponse;
    } finally {
      setIsLoading(false);
    }
  }

  return { generatePaymentLink, isLoading };
}
