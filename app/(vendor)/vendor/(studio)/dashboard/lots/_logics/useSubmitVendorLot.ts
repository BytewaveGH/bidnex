"use client";

import { useState } from "react";

import { useAxios } from "@/hooks/use-axios";

type SubmitVendorLotApiResponse = {
  data?: unknown;
  status?: boolean;
  message?: string;
  error?: string;
};

export function useSubmitVendorLot() {
  const callApi = useAxios();
  const [submittingLotId, setSubmittingLotId] = useState<string | null>(null);

  async function submitLotForReview(lotId: string) {
    setSubmittingLotId(lotId);

    try {
      const response = await callApi({
        method: "POST",
        url: `/vendor/lots/${lotId}/submit`,
      });

      if (response.status >= 400) {
        const body = response.data as SubmitVendorLotApiResponse;
        throw new Error(body.error ?? body.message ?? "Failed to submit lot for review.");
      }

      return response.data as SubmitVendorLotApiResponse;
    } finally {
      setSubmittingLotId(null);
    }
  }

  return { submitLotForReview, submittingLotId };
}
