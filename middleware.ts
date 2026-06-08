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
  /\/vendor\/auth\//,
]

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTE_PATTERNS.some((r) => r.test(pathname))
}

export default auth((req) => {
  const request = req as NextRequest & { auth: typeof req.auth }
  const { pathname } = request.nextUrl
  const isLoggedIn = !!request.auth
  const tenant = request.auth?.user?.tenant

  if (process.env.NEXT_PUBLIC_MOCK === 'true' && pathname.startsWith('/vendor')) {
    return NextResponse.next()
  }

  // Redirect already-logged-in vendors away from vendor auth pages
  if (isLoggedIn && tenant === 'vendor' && /\/vendor\/auth\//.test(pathname)) {
    return NextResponse.redirect(new URL('/vendor/dashboard/home', request.url))
  }

  if (isPublicRoute(pathname)) return NextResponse.next()

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  const isAtSignIn = pathname === "/auth/login" || pathname === "/"
  if (isAtSignIn) {
    if (tenant === 'vendor') {
      return NextResponse.redirect(new URL('/vendor/dashboard/home', request.url))
    }
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
