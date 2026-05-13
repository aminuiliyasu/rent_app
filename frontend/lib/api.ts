import axios from 'axios'

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

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // Don't retry refresh for auth endpoints to avoid infinite loops
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/')) {
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
