"use client";

import { useState } from "react";

import { useAxios } from "@/hooks/use-axios";

import { type CreateVendorLotPayload } from "./vendor-lots";

type UpdateVendorLotApiResponse = {
  data?: unknown;
  status?: boolean;
  message?: string;
  error?: string;
};

export function useUpdateVendorLot() {
  const callApi = useAxios();
  const [isLoading, setIsLoading] = useState(false);

  async function updateLot(lotId: string, payload: CreateVendorLotPayload) {
    setIsLoading(true);

    try {
      const response:any = await callApi({
        method: "PUT",
        url: `/vendor/lots/${lotId}`,
        data: payload,
      });

      if (response.status >= 400) {
        const body = response.data as UpdateVendorLotApiResponse;
        throw new Error(body.error ?? body.message ?? "Failed to update lot.");
      }

      return response.data as UpdateVendorLotApiResponse;
    } finally {
      setIsLoading(false);
    }
  }

  return { updateLot, isLoading };
}
