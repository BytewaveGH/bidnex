import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      userId: string
      username: string
      avatar: string
      userType: "admin" | "manager" | "eso" | "participant" | "vendor" | "bidder"
      permission: string[]
      tenant: string
      accessToken: string
      refreshToken: string
      accessTokenExpiry: number
      refreshTokenExpiry: number
      onboarding: boolean
      organizationId: string
    } & DefaultSession["user"]
  }

  interface User {
    userId: string
    username: string
    avatar: string
    userType: "admin" | "manager" | "eso" | "participant" | "vendor" | "bidder"
    permission: string[]
    tenant: string
    accessToken: string
    refreshToken: string
    accessTokenExpiry: number
    refreshTokenExpiry: number
    onboarding: boolean
    organizationId: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string
    username: string
    avatar: string
    userType: "admin" | "manager" | "eso" | "participant" | "vendor" | "bidder"
    permission: string[]
    tenant: string
    accessToken: string
    refreshToken: string
    accessTokenExpiry: number
    refreshTokenExpiry: number
    onboarding: boolean
    organizationId: string
  }
}
