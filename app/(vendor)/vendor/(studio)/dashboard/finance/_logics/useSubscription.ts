"use client";

import { useMemo } from "react";

import { useFetchData } from "@/hooks/use-fetch-data";

export type SubscriptionData = {
  plan: string;
  planLabel: string;
  status: string;
  lotLimit: number;
  lotsUsed: number;
  features: string[];
};

type SubscriptionApiPayload = {
  plan?: string;
  planName?: string;
  status?: string;
  lotLimit?: number;
  lotsUsed?: number;
  features?: string[];
  billingCycle?: string;
  amount?: number;
  currency?: string;
  renewsAt?: string | null;
};

function formatPlanLabel(plan: string) {
  if (!plan) return "Plan";
  return plan
    .split(/[_-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeSubscription(raw: unknown): SubscriptionData | null {
  if (!raw || typeof raw !== "object") return null;

  const payload = raw as SubscriptionApiPayload;

  if (payload.plan || payload.planName || payload.lotLimit !== undefined) {
    const plan = payload.plan ?? payload.planName ?? "unknown";
    return {
      plan,
      planLabel: formatPlanLabel(plan),
      status: payload.status ?? "unknown",
      lotLimit: payload.lotLimit ?? 0,
      lotsUsed: payload.lotsUsed ?? 0,
      features: payload.features ?? [],
    };
  }

  return null;
}

export function useSubscription() {
  const result = useFetchData<{ data: unknown; status: boolean }>("/vendor/subscription");

  const data = useMemo(() => normalizeSubscription(result.data?.data), [result.data?.data]);

  return {
    data,
    isLoading: result.isLoading,
    error: result.error ? "Failed to load subscription." : null,
  };
}
