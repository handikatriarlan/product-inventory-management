import axios from 'axios'
import type { AxiosError } from 'axios'

export interface ApiErrorDetail {
  path: string
  message: string
}

interface ApiErrorBody {
  error?: {
    code?: string
    message?: string
    details?: ApiErrorDetail[]
  }
}

export class ApiError extends Error {
  readonly code: string
  readonly status?: number
  readonly details?: ApiErrorDetail[]

  constructor(message: string, code: string, status?: number, details?: ApiErrorDetail[]) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.details = details
  }
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    const body = error.response?.data?.error
    if (body) {
      return Promise.reject(
        new ApiError(
          body.message ?? 'Terjadi kesalahan',
          body.code ?? 'INTERNAL_ERROR',
          error.response?.status,
          body.details,
        ),
      )
    }
    return Promise.reject(new ApiError('Tidak dapat menghubungi server', 'NETWORK_ERROR'))
  },
)

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return 'Terjadi kesalahan yang tidak diketahui'
}
