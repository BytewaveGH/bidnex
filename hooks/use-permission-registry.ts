"use client"

import { useQuery } from "@tanstack/react-query"
import { permissionRegistry } from "@/lib/permissions"
import { useAxios } from "./use-axios"

interface PermissionEntry {
  name: string
  key: string
  category: string
}

export function usePermissionRegistry() {
  const call = useAxios()

  return useQuery<PermissionEntry[]>({
    queryKey: ["permission-registry"],
    queryFn: async () => {
      const res = await call({ method: "GET", url: "/authorization/permissions" })
      return (res as { data: PermissionEntry[] }).data
    },
    staleTime: 10 * 60 * 1000,
    placeholderData: permissionRegistry,
  })
}
