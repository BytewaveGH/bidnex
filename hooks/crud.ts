import type { AxiosInstance } from "axios"

export interface CrudResult<T = unknown> {
  success: boolean
  data?: T
  message?: string
  status?: number
  errors?: Record<string, string[]>
}

type HttpMethod = "get" | "post" | "put" | "patch" | "delete"

export async function crud<T = unknown>(
  axiosInstance: AxiosInstance,
  method: HttpMethod,
  url: string,
  payload?: unknown
): Promise<CrudResult<T>> {
  try {
    const response = await axiosInstance[method]<T>(url, payload)
    return {
      success: true,
      data: response.data,
      status: response.status,
      message: (response.data as Record<string, unknown>)?.message as string | undefined,
    }
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: { message?: string; errors?: Record<string, string[]> } }; message?: string }
    return {
      success: false,
      status: err?.response?.status,
      message: err?.response?.data?.message ?? err?.message ?? "An error occurred",
      errors: err?.response?.data?.errors,
    }
  }
}
