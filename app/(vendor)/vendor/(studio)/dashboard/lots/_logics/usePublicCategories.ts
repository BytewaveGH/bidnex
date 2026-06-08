"use client";

import { useEffect, useState } from "react";

import { useAxios, useUnauthenticatedAxios } from "@/hooks/use-axios";

export type PublicCategory = {
  id: number;
  name: string;
  slug: string;
  description: string;
  iconUrl?: string;
  createdAt: string;
};

type PublicCategoriesResponse = {
  data: PublicCategory[];
  status: boolean;
};

export function usePublicCategories(enabled = true) {
  const callApi = useAxios();
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    async function fetchCategories() {
      setIsLoading(true);
      setError(null);

      try {
        const response:any = await callApi({
          method: "GET",
          url: "/public/categories",
        });

        if (cancelled) return;

        if (response.status >= 400) {
          setError("Failed to load categories.");
          setCategories([]);
          return;
        }

        const body = response.data as PublicCategoriesResponse;
        setCategories(body.data ?? []);
      } catch {
        if (!cancelled) {
          setError("Failed to load categories.");
          setCategories([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void fetchCategories();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { categories, isLoading, error };
}
