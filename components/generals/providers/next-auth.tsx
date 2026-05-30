"use client"

import { SessionProvider } from "next-auth/react"
import { RefreshTokenHandler } from "@/app/(auth)/_logics/refresh-token-handler"
import { SessionBridge } from "./session-bridge"

interface NextAuthProviderProps {
  children: React.ReactNode
}

export function NextAuthProvider({ children }: NextAuthProviderProps) {
  return (
    <SessionProvider>
      <SessionBridge />
      <RefreshTokenHandler />
      {children}
    </SessionProvider>
  )
}
