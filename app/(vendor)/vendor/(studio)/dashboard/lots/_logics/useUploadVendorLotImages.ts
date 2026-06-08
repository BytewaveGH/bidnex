"use client";

import { useState } from "react";

import { useAxios } from "@/hooks/use-axios";

type UploadVendorLotImagesApiResponse = {
  data?: unknown;
  status?: boolean;
  message?: string;
  error?: string;
};

export function useUploadVendorLotImages() {
  const callApi = useAxios();
  const [isLoading, setIsLoading] = useState(false);

  async function uploadLotImages(lotId: string, files: File[]) {
    if (files.length === 0) return;

    setIsLoading(true);

    try {
      const formData = new FormData();
      for (const file of files) {
        formData.append("images", file);
      }

      const response:any = await callApi({
        method: "POST",
        url: `/vendor/lots/${lotId}/images`,
        data: formData,
      });

      if (response.status >= 400) {
        const body = response.data as UploadVendorLotImagesApiResponse;
        throw new Error(body.error ?? body.message ?? "Failed to upload images.");
      }

      return response.data as UploadVendorLotImagesApiResponse;
    } finally {
      setIsLoading(false);
    }
  }

  return { uploadLotImages, isLoading };
}
