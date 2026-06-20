"use client";

import { useMemo } from "react";

import { useFetchData } from "@/hooks/use-fetch-data";

import { resolveLotMediaUrl } from "./vendor-lots";

export type AwaitingPaymentItem = {
  id: string;
  title: string;
  amount: number;
  currency: string;
  paymentDueAt: string;
  overdue: boolean;
  winnerId?: number;
  bidEndTime?: string;
  primaryImageUrl?: string | null;
  buyerRef?: string;
};

export type LotsAwaitingPaymentData = {
  totalExpected: number;
  currency: string;
  lots: AwaitingPaymentItem[];
};

type AwaitingPaymentApiLot = {
  id?: string | number;
  lotId?: string | number;
  title?: string;
  lotTitle?: string;
  currentBid?: number;
  winningBid?: number;
  currency?: string;
  winnerId?: number;
  buyerRef?: string;
  bidEndTime?: string;
  auctionEndedAt?: string;
  paymentDue?: string;
  paymentDueAt?: string;
  isOverdue?: boolean;
  overdue?: boolean;
  primaryImage?: string;
};

type AwaitingPaymentWrappedData = {
  totalExpected?: number;
  currency?: string;
  lots?: AwaitingPaymentApiLot[];
};

function mapLot(item: AwaitingPaymentApiLot): AwaitingPaymentItem {
  return {
    id: String(item.id ?? item.lotId ?? ""),
    title: item.title ?? item.lotTitle ?? "Untitled lot",
    amount: item.currentBid ?? item.winningBid ?? 0,
    currency: item.currency ?? "GHS",
    paymentDueAt: item.paymentDue ?? item.paymentDueAt ?? "",
    overdue: item.isOverdue ?? item.overdue ?? false,
    winnerId: item.winnerId,
    bidEndTime: item.bidEndTime ?? item.auctionEndedAt,
    primaryImageUrl: resolveLotMediaUrl(item.primaryImage),
    buyerRef: item.buyerRef ?? (item.winnerId != null ? `Buyer #${item.winnerId}` : undefined),
  };
}

function normalizeAwaitingPayment(raw: unknown): LotsAwaitingPaymentData | null {
  if (Array.isArray(raw)) {
    const lots = raw.map((item) => mapLot(item as AwaitingPaymentApiLot));
    return {
      totalExpected: lots.reduce((sum, lot) => sum + lot.amount, 0),
      currency: lots[0]?.currency ?? "GHS",
      lots,
    };
  }

  if (raw && typeof raw === "object") {
    const payload = raw as AwaitingPaymentWrappedData;
    if (Array.isArray(payload.lots)) {
      const lots = payload.lots.map(mapLot);
      return {
        totalExpected: payload.totalExpected ?? lots.reduce((sum, lot) => sum + lot.amount, 0),
        currency: payload.currency ?? lots[0]?.currency ?? "GHS",
        lots,
      };
    }
  }

  return null;
}

export function useLotsAwaitingPayment(limit = 1) {
  const result = useFetchData<{ data: unknown; status: boolean }>("/vendor/lots/awaiting-payment", {
    params: { limit },
  });

  const data = useMemo(() => normalizeAwaitingPayment(result.data?.data), [result.data?.data]);

  return {
    data,
    isLoading: result.isLoading,
    error: result.error ? "Failed to load awaiting payment lots." : null,
  };
}
