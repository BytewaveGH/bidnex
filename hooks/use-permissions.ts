"use client"

import { useSession } from "next-auth/react"

export function usePermissions() {
  const { data: session } = useSession()
  const permissions = session?.user?.permission

  function hasPermission(key: string): boolean {
    if (permissions == null) return true
    if (permissions.length === 0) return false
    return permissions.includes(key)
  }

  function hasAnyOf(keys: string[]): boolean {
    if (permissions == null) return true
    if (permissions.length === 0) return false
    return keys.some((k) => permissions.includes(k))
  }

  function hasAllOf(keys: string[]): boolean {
    if (permissions == null) return true
    if (permissions.length === 0) return false
    return keys.every((k) => permissions.includes(k))
  }

  function canGoTo(category: string, name?: string): boolean {
    if (permissions == null) return true
    if (permissions.length === 0) return false
    const key = name ? `${category}_${name}` : `${category}_page`
    return permissions.some((p) => p.startsWith(category) || p === key)
  }

  return { hasPermission, hasAnyOf, hasAllOf, canGoTo, permissions }
}
