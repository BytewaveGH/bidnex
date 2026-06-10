"use client";

import { useEffect, useState } from "react";
import { useAxios } from "@/hooks/use-axios";
import { type AuctionLotImage, type AuctionLotCategory } from "../../(all-items)/_logics/auctions";

export type PublicLotAuction = {
  id: number;
  title: string;
  description: string;
  status: string;
  startTime: string;
  endTime: string;
  vendorId: number;
  isFeatured: boolean;
  locationName: string;
  locationAddress: string;
  lotCount: number;
  lotInterval: number;
  createdAt: string;
};

export type PublicLotDetail = {
  id: number;
  auctionId: number;
  vendorId: number;
  title: string;
  description: string;
  condition: string;
  startingBid: number;
  currentBid: number;
  bidIncrement: number;
  bidCount: number;
  reservePrice: number;
  buyNowPrice: number;
  status: string;
  reviewStatus: string;
  reviewRejectReason: string;
  lotOrder: number;
  bidStartTime: string;
  bidEndTime: string;
  sku: string;
  pickupAvailable: boolean;
  shippingAvailable: boolean;
  category?: AuctionLotCategory | null;
  primaryImage: string;
  images: AuctionLotImage[];
  createdAt: string;
  winnerId?: number | null;
  bidderIds: number[];
  recentBids: unknown[];
  auction: PublicLotAuction;
};

export type PublicLotApiResponse = {
  data: PublicLotDetail;
  status: boolean;
};

export function usePublicLot(id: string) {
  const callApi = useAxios();
  const [data, setData] = useState<PublicLotDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function fetchLot() {
      setIsLoading(true);
      setError(null);

      try {
        const response: any = await callApi({
          method: "GET",
          url: `/public/lots/${id}`,
        });

        if (cancelled) return;

        if (response.status >= 400) {
          const message =
            (response.data as { error?: string; message?: string })?.error ??
            (response.data as { message?: string })?.message ??
            "Failed to load lot.";
          setError(message);
          setData(null);
          return;
        }

        const body = response.data as PublicLotApiResponse;
        setData(body.data);
      } catch {
        if (!cancelled) {
          setError("Network error. Please check your connection and try again.");
          setData(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void fetchLot();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { data, isLoading, error };
}
