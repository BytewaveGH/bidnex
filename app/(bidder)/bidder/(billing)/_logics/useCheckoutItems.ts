"use client";

import { useFetchData } from "@/hooks/use-fetch-data";

export type CheckoutItem = {
  id: number;
  title: string;
  amount: number;
  fee: number;
};

type CheckoutItemsData = {
  items: CheckoutItem[];
  subtotal: number;
  fee: number;
  total: number;
};

export function useCheckoutItems() {
  const result = useFetchData<{ data: CheckoutItemsData; status: boolean }>("/bidder/checkout-items");
  const raw = result.data?.data;
  return {
    data: raw ?? null,
    isLoading: result.isLoading,
    error: result.error ? "Failed to load checkout items." : null,
    refetch: result.refetch,
  };
}
