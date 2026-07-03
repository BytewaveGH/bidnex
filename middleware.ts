import NextAuth from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { authConfig, roleRedirects } from "./auth.config"

const { auth } = NextAuth(authConfig)

const PUBLIC_ROUTE_PATTERNS = [
  /^\/$/,
  /\/auth\/login/,
  /\/auth\/forgot-password/,
  /\/auth\/reset-password/,
  /\/surveys/,
  /\/kyc/,
  /\/public-applications/,
  /\/auth\/sign-up/,
  /^\/bidder/,
]

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTE_PATTERNS.some((r) => r.test(pathname))
}

export default auth((req) => {
  const request = req as NextRequest & { auth: typeof req.auth }
  const { pathname } = request.nextUrl
  const isLoggedIn = !!request.auth
  const userType = request.auth?.user?.userType as string | undefined

  if (process.env.NEXT_PUBLIC_MOCK === 'true' && pathname.startsWith('/vendor')) {
    return NextResponse.next()
  }

  // Redirect logged-in users away from auth pages (not from public browsing pages)
  const isAuthRoute = /\/auth\//.test(pathname)
  if (isLoggedIn && isAuthRoute) {
    // Unverified users must be redirected to (or kept on) the verify page,
    // never allowed through to another auth page or the dashboard.
    const isVerified = (request.auth?.user as { isVerified?: boolean } | undefined)?.isVerified
    if (!isVerified) {
      if (pathname.startsWith('/auth/verify')) {
        return NextResponse.next()
      }
      const phone = (request.auth?.user as { phone?: string } | undefined)?.phone ?? ''
      const verifyUrl = new URL('/auth/verify', request.url)
      verifyUrl.searchParams.set('phone', phone)
      verifyUrl.searchParams.set('accountType', userType ?? 'bidder')
      return NextResponse.redirect(verifyUrl)
    }
    const destination = userType ? roleRedirects[userType] : undefined
    if (destination) {
      return NextResponse.redirect(new URL(destination, request.url))
    }
  }

  if (isPublicRoute(pathname)) return NextResponse.next()

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // Redirect from root to the correct dashboard
  if (pathname === "/") {
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
