'use client'

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { User } from '@/lib/types'
import api from '@/lib/api'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const profileAbortRef = useRef<AbortController | null>(null)
  const sessionEpochRef = useRef(0)

  const cancelProfileFetch = () => {
    profileAbortRef.current?.abort()
    profileAbortRef.current = null
  }

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      setLoading(false)
      return
    }

    cancelProfileFetch()
    const controller = new AbortController()
    profileAbortRef.current = controller
    const epoch = sessionEpochRef.current
    const tokenAtStart = token

    api
      .get('/auth/me', { signal: controller.signal })
      .then((response) => {
        if (controller.signal.aborted || epoch !== sessionEpochRef.current) return
        setUser(response.data)
      })
      .catch(() => {
        if (controller.signal.aborted || epoch !== sessionEpochRef.current) return
        if (localStorage.getItem('accessToken') !== tokenAtStart) return
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        setUser(null)
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })

    return () => {
      controller.abort()
    }
  }, [])

  const persistSession = (accessToken: string, refreshToken: string, nextUser: User) => {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    setUser(nextUser)
    setLoading(false)
  }

  const login = async (email: string, password: string) => {
    sessionEpochRef.current += 1
    cancelProfileFetch()
    const response = await api.post('/auth/login', {
      email: email.trim(),
      password,
    })
    const { accessToken, refreshToken, user: nextUser } = response.data

    if (!accessToken || !refreshToken || !nextUser) {
      throw new Error('Login response was incomplete. Please try again.')
    }

    persistSession(accessToken, refreshToken, nextUser)
  }

  const register = async (name: string, email: string, password: string, phone?: string) => {
    sessionEpochRef.current += 1
    cancelProfileFetch()
    const response = await api.post('/auth/register', {
      name: name.trim(),
      email: email.trim(),
      password,
      phone: phone?.trim() || undefined,
    })
    const { accessToken, refreshToken, user: nextUser } = response.data

    if (!accessToken || !refreshToken || !nextUser) {
      throw new Error('Registration response was incomplete. Please try again.')
    }

    persistSession(accessToken, refreshToken, nextUser)
  }

  const logout = () => {
    sessionEpochRef.current += 1
    cancelProfileFetch()
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
