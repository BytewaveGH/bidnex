"use client"

import { useSession } from "next-auth/react"
import { useEffect, useRef } from "react"

const REFRESH_BUFFER_MS = 5 * 60 * 1000
const RETRY_DELAY_MS = 30 * 1000

export function RefreshTokenHandler() {
  const { data: session, update } = useSession()
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const updateRef = useRef(update)

  useEffect(() => { updateRef.current = update })

  useEffect(() => {
    if (!session?.user?.accessTokenExpiry) return

    const timeUntilRefresh = session.user.accessTokenExpiry - Date.now() - REFRESH_BUFFER_MS
    const delay = timeUntilRefresh > 0 ? timeUntilRefresh : RETRY_DELAY_MS

    timeoutRef.current = setTimeout(() => {
      updateRef.current()
    }, delay)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [session?.user?.accessTokenExpiry])

  return null
}
