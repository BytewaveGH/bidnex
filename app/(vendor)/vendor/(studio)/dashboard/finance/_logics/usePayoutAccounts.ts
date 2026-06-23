"use client";

import { useFetchData } from "@/hooks/use-fetch-data";

export type PayoutAccount = {
  id: number;
  vendorId: number;
  type: "bank" | "mobile_money";
  provider: string;
  accountName: string;
  accountNo: string;
  isDefault: boolean;
  createdAt: string;
};

export function usePayoutAccounts() {
  const result = useFetchData<{ data: PayoutAccount[]; status: boolean }>("/vendor/finance/payout-accounts");
  const raw = result.data?.data;
  return {
    data: Array.isArray(raw) ? (raw as PayoutAccount[]) : null,
    isLoading: result.isLoading,
    error: result.error ? "Failed to load payout accounts." : null,
    refetch: result.refetch,
  };
}
