"use client"

import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { setSession } from "@/lib/session-store"

export function SessionBridge() {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'loading') return
    setSession(session ?? null)
  }, [session, status])

  return null
}
