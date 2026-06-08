"use client";

import { useState } from "react";

import { useAxios } from "@/hooks/use-axios";

type DeleteVendorLotApiResponse = {
  data?: unknown;
  status?: boolean;
  message?: string;
  error?: string;
};

export function useDeleteVendorLot() {
  const callApi = useAxios();
  const [deletingLotId, setDeletingLotId] = useState<string | null>(null);

  async function deleteLot(lotId: string) {
    setDeletingLotId(lotId);

    try {
      const response:any = await callApi({
        method: "DELETE",
        url: `/vendor/lots/${lotId}`,
      });

      if (response.status >= 400) {
        const body = response.data as DeleteVendorLotApiResponse;
        throw new Error(body.error ?? body.message ?? "Failed to delete lot.");
      }

      return response.data as DeleteVendorLotApiResponse;
    } finally {
      setDeletingLotId(null);
    }
  }

  return { deleteLot, deletingLotId };
}
