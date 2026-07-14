"use client";

import { useEffect, useState } from "react";
import { useAxios } from "@/hooks/use-axios";

export function useLotTitle(lotId: number | undefined) {
  const callApi = useAxios();
  const [title, setTitle] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(lotId));

  useEffect(() => {
    if (!lotId) {
      setTitle(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    callApi({ method: "GET", url: `/public/lots/${lotId}` })
      .then((response: any) => {
        if (cancelled || response.status >= 400) return;
        const lotTitle = response.data?.data?.title;
        if (lotTitle) setTitle(String(lotTitle));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [lotId]);

  return { title, isLoading };
}
