"use client"

import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { setSession } from "@/lib/session-store"

export function SessionBridge() {
  const { data: session } = useSession()

  useEffect(() => {
    setSession(session ?? null)
  }, [session])

  return null
}
