import { auth } from "@/auth"
import { tenantFromHost } from "@/lib/tenant-from-host"
import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL!

type Context = { params: Promise<{ path: string[] }> }

async function handler(req: NextRequest, ctx: Context) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { path } = await ctx.params
  const endpoint = path.join("/")
  const { searchParams } = req.nextUrl
  const queryString = searchParams.toString()
  const url = `${BACKEND_URL}/${endpoint}${queryString ? `?${queryString}` : ""}`

  const host = req.headers.get("host") ?? ""
  const tenant = session.user.tenant ?? tenantFromHost(host)

  const controller = new AbortController()
  const timeoutMs = req.method === "GET" ? 10000 : 30000
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const hasBody = req.method !== "GET" && req.method !== "HEAD"
    const body = hasBody ? await req.text() : undefined

    const response = await fetch(url, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.user.accessToken}`,
        "X-Tenant-Domain": tenant,
      },
      body,
      signal: controller.signal,
    })

    const data = await response.json().catch(() => null)
    return NextResponse.json(data, { status: response.status })
  } catch (error: unknown) {
    const err = error as Error
    if (err?.name === "AbortError") {
      return NextResponse.json({ error: "Request timeout" }, { status: 504 })
    }
    return NextResponse.json(
      { error: "Internal server error", details: err?.message },
      { status: 500 }
    )
  } finally {
    clearTimeout(timeout)
  }
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
