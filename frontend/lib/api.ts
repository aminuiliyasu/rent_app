import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

const NETWORK_RETRY_MAX = 10
const NETWORK_RETRY_BASE_MS = 1500

function isTransientApiError(error: AxiosError): boolean {
  if (!error.response) return true
  const status = error.response.status
  return status === 500 || status === 502 || status === 503 || status === 504
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Browser: relative `/api/v1` → Next.js rewrites → Spring (same origin, avoids CORS).
 * Set NEXT_PUBLIC_API_URL only if the API must be called directly (e.g. unusual hosting).
 */
export function getApiBaseUrl(): string {
  const env = process.env.NEXT_PUBLIC_API_URL
  if (typeof window !== 'undefined') {
    if (env && /^https?:\/\//i.test(env)) {
      return env.replace(/\/$/, '')
    }
    return '/api/v1'
  }
  if (env && /^https?:\/\//i.test(env)) {
    return env.replace(/\/$/, '')
  }
  return 'http://127.0.0.1:8080/api/v1'
}

export const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
})

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
    }

    if (originalRequest && isTransientApiError(error)) {
      const retryCount = originalRequest.__networkRetryCount ?? 0
      if (retryCount < NETWORK_RETRY_MAX) {
        originalRequest.__networkRetryCount = retryCount + 1
        await sleep(Math.min(NETWORK_RETRY_BASE_MS * (retryCount + 1), 5000))
        return api(originalRequest)
      }
    }

    // Don't retry refresh for auth endpoints to avoid infinite loops
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !originalRequest.url?.includes('/auth/')) {
      originalRequest._retry = true
      
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          // Attempt to refresh the token
          const response = await axios.post(`${getApiBaseUrl()}/auth/refresh`, {
            refreshToken: refreshToken
          })
          
          const { accessToken, refreshToken: newRefreshToken } = response.data
          
          // Update tokens in localStorage
          localStorage.setItem('accessToken', accessToken)
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken)
          }
          
          // Update the original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          
          // Retry the original request
          return api(originalRequest)
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          
          // Only redirect if we're not already on the login page
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
        }
      } else {
        // No refresh token, redirect to login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
    }
    
    return Promise.reject(error)
  }
)

export default api
