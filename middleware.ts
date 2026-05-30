import NextAuth from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { authConfig, roleRedirects } from "./auth.config"

const { auth } = NextAuth(authConfig)

const PUBLIC_ROUTE_PATTERNS = [
  /\/auth\/login/,
  /\/auth\/forgot-password/,
  /\/auth\/reset-password/,
  /\/surveys/,
  /\/kyc/,
  /\/public-applications/,
  /\/auth\/sign-up/,
]

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTE_PATTERNS.some((r) => r.test(pathname))
}

export default auth((req) => {
  const request = req as NextRequest & { auth: typeof req.auth }
  const { pathname } = request.nextUrl
  const isLoggedIn = !!request.auth

  if (isPublicRoute(pathname)) return NextResponse.next()

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  const isAtSignIn = pathname === "/auth/login" || pathname === "/"
  if (isAtSignIn) {
    const userType = request.auth?.user?.userType as string | undefined
    const destination = userType ? roleRedirects[userType] : undefined
    if (destination) {
      return NextResponse.redirect(new URL(destination, request.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
