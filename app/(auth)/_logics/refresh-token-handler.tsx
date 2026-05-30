"use client"

import { useSession } from "next-auth/react"
import { useEffect, useRef } from "react"

const REFRESH_BUFFER_MS = 5 * 60 * 1000

export function RefreshTokenHandler() {
  const { data: session, update } = useSession()
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!session?.user?.accessTokenExpiry) return

    const delay = Math.max(
      0,
      session.user.accessTokenExpiry - Date.now() - REFRESH_BUFFER_MS
    )

    timeoutRef.current = setTimeout(() => {
      update()
    }, delay)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [session?.user?.accessTokenExpiry, update])

  return null
}
