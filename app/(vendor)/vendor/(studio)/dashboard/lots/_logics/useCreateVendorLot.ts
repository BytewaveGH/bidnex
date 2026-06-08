"use client";

import { useState } from "react";

import { useAxios } from "@/hooks/use-axios";

import { type CreateVendorLotApiResponse, type CreateVendorLotPayload } from "./vendor-lots";

export function useCreateVendorLot() {
  const callApi = useAxios();
  const [isLoading, setIsLoading] = useState(false);

  async function createLot(payload: CreateVendorLotPayload) {
    setIsLoading(true);

    try {
      const response = await callApi({
        method: "POST",
        url: "/vendor/lots",
        data: payload,
      });

      if (response.status >= 400) {
        const body = response.data as CreateVendorLotApiResponse;
        throw new Error(body.error ?? body.message ?? "Failed to create lot.");
      }

      return response.data as CreateVendorLotApiResponse;
    } finally {
      setIsLoading(false);
    }
  }

  return { createLot, isLoading };
}
