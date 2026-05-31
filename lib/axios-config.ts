import axios from "axios"
import { headers } from "next/headers"
import { tenantFromHost } from "./tenant-from-host"
import { getSession } from "./session-store"

export async function createServerAxios() {
  const [session, headersList] = await Promise.all([getSession(), headers()])

  const host = headersList.get("host") ?? ""
  const tenant = session?.user?.tenant ?? tenantFromHost(host)

  return axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
      ...(session?.user?.accessToken && {
        Authorization: `Bearer ${session.user.accessToken}`,
      }),
      "X-Tenant-Domain": tenant,
    },
  })
}
