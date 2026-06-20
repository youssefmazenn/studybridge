import axios from 'axios'

export type ApiErrorBody = {
  timestamp?: string
  status?: number
  error?: string
  message?: string
  path?: string
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorBody | undefined
    if (data?.message && typeof data.message === 'string') {
      return data.message
    }
    if (error.response?.status === 401) {
      return 'Please sign in again.'
    }
    if (error.message) {
      return error.message
    }
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Something went wrong. Please try again.'
}
