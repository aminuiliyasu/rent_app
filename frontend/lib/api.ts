import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

declare module 'axios' {
  interface AxiosRequestConfig {
    skipRetry?: boolean
  }
}

const NETWORK_RETRY_MAX = 10
const NETWORK_RETRY_BASE_MS = 1500

function isCanceledRequest(error: AxiosError): boolean {
  return error.code === 'ERR_CANCELED' || error.name === 'CanceledError' || axios.isCancel(error)
}

function isTransientApiError(error: AxiosError): boolean {
  if (isCanceledRequest(error)) return false
  if (!error.response) return true
  const status = error.response.status
  return status === 500 || status === 502 || status === 503 || status === 504
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Browser dev: call Spring directly (CORS is configured) — the Next.js rewrite proxy
 * can reset slow auth responses (ECONNRESET / ClientAbortException).
 * Production / SSR: relative `/api/v1` or NEXT_PUBLIC_API_URL when set.
 */
export function getApiBaseUrl(): string {
  const env = process.env.NEXT_PUBLIC_API_URL
  if (env && /^https?:\/\//i.test(env)) {
    return env.replace(/\/$/, '')
  }
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    return 'http://127.0.0.1:8080/api/v1'
  }
  if (typeof window !== 'undefined') {
    return '/api/v1'
  }
  return 'http://127.0.0.1:8080/api/v1'
}

/**
 * Multipart uploads must not go through the Next.js dev rewrite proxy — it can reset
 * the connection (ECONNRESET / "socket hang up"). Spring CORS allows localhost origins.
 */
export function getUploadBaseUrl(): string {
  const env = process.env.NEXT_PUBLIC_API_URL
  if (env && /^https?:\/\//i.test(env)) {
    return env.replace(/\/$/, '')
  }
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    return 'http://127.0.0.1:8080/api/v1'
  }
  return getApiBaseUrl()
}

export const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 90_000,
})

let refreshPromise: Promise<string | null> | null = null

function isAuthPagePath(pathname: string): boolean {
  return (
    pathname === '/login' ||
    pathname === '/register' ||
    pathname.startsWith('/auth/callback') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password')
  )
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise
  }

  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) {
    return null
  }

  refreshPromise = (async () => {
    try {
      const response = await axios.post(`${getApiBaseUrl()}/auth/refresh`, {
        refreshToken,
      })
      const { accessToken, refreshToken: newRefreshToken } = response.data as {
        accessToken?: string
        refreshToken?: string
      }
      if (!accessToken) {
        return null
      }
      localStorage.setItem('accessToken', accessToken)
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken)
      }
      return accessToken
    } catch {
      return null
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

function clearSessionAndRedirectToLogin() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  if (typeof window !== 'undefined' && !isAuthPagePath(window.location.pathname)) {
    window.location.href = '/login'
  }
}

api.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl()
  return config
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Retry when Spring Boot or the dev proxy is still starting
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
      __networkRetryCount?: number
      skipRetry?: boolean
    }

    if (originalRequest && !originalRequest.skipRetry && isTransientApiError(error)) {
      const retryCount = originalRequest.__networkRetryCount ?? 0
      if (retryCount < NETWORK_RETRY_MAX) {
        originalRequest.__networkRetryCount = retryCount + 1
        await sleep(Math.min(NETWORK_RETRY_BASE_MS * (retryCount + 1), 5000))
        return api(originalRequest)
      }
    }

    // Don't retry refresh for auth endpoints to avoid infinite loops
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/')
    ) {
      originalRequest._retry = true

      const newAccessToken = await refreshAccessToken()
      if (newAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return api(originalRequest)
      }

      clearSessionAndRedirectToLogin()
    }
    
    return Promise.reject(error)
  }
)

export default api
