import axios, { type AxiosRequestConfig } from 'axios'
import { waitForSession } from '@/lib/session-store'
import { getCurrentSubdomain } from '@/lib/tenant-from-host'

export const useAxios = () => async (config: AxiosRequestConfig) => {
  const session = await waitForSession()
  try {
    return await axios({
      ...config,
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      headers: {
        Authorization: `Bearer ${session?.user?.accessToken}`,
        'X-Tenant-Domain': session?.user?.tenant || getCurrentSubdomain(),
        'Cache-Control': 'no-cache',
        ...config.headers,
      },
    })
  } catch (error: unknown) {
    const err = error as { response?: unknown }
    if (err?.response) return err.response as Awaited<ReturnType<typeof axios>>
    throw error
  }
}

export const useUnauthenticatedAxios = () => async (config: AxiosRequestConfig) => {
  try {
    return await axios({
      ...config,
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      headers: {
        'X-Tenant-Domain': getCurrentSubdomain(),
        'Cache-Control': 'no-cache',
        ...config.headers,
      },
    })
  } catch (error: unknown) {
    const err = error as { response?: unknown }
    if (err?.response) return err.response as Awaited<ReturnType<typeof axios>>
    throw error
  }
}
