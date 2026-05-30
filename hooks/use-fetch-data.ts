"use client"

import { useQuery, type UseQueryOptions } from "@tanstack/react-query"
import { useAxios } from "./use-axios"

interface FetchOptions<T>
  extends Omit<UseQueryOptions<T>, "queryKey" | "queryFn"> {
  params?: Record<string, unknown>
}

export function useFetchData<T = unknown>(
  url: string,
  options?: FetchOptions<T>
) {
  const call = useAxios()
  const { params, ...queryOptions } = options ?? {}

  return useQuery<T>({
    queryKey: [url, params],
    queryFn: async () => {
      const res = await call({ method: "GET", url, params })
      return (res as { data: T }).data
    },
    retry: (failureCount, error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response?.status
      if (status !== undefined && status >= 400 && status < 500) return false
      return failureCount < 2
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    ...queryOptions,
  })
}
