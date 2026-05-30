/** Client-side: extracts subdomain from window.location, falls back to 'dev' on localhost. */
export function getCurrentSubdomain(): string {
  if (typeof window === "undefined") return process.env.NEXT_PUBLIC_TENANT_DOMAIN ?? "dev"
  const { hostname } = window.location
  if (hostname === "localhost" || hostname === "127.0.0.1") return "dev"
  return hostname.split(".").length > 2 ? hostname.split(".")[0] : "dev"
}

/** Server-side: extracts subdomain from a request Host header. */
export function tenantFromHost(host: string): string {
  if (process.env.NEXT_PUBLIC_TENANT_DOMAIN) return process.env.NEXT_PUBLIC_TENANT_DOMAIN
  const hostname = host.split(":")[0]
  const parts = hostname.split(".")
  return parts.length > 2 ? parts[0] : (process.env.DEFAULT_TENANT ?? "dev")
}
