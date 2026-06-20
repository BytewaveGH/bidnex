"use client";

import { useFetchData } from "@/hooks/use-fetch-data";

export type PayoutAccount = {
  id: string;
  type: "bank" | "mobile_money";
  name: string;
  accountNumber?: string;
  last4?: string;
  number?: string;
  isDefault: boolean;
};

export function usePayoutAccounts() {
  const result = useFetchData<{ data: unknown; status: boolean }>("/vendor/finance/payout-accounts");
  const raw = result.data?.data;
  return {
    data: Array.isArray(raw) ? (raw as PayoutAccount[]) : null,
    isLoading: result.isLoading,
    error: result.error ? "Failed to load payout accounts." : null,
  };
}
