'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import type { AppNotification } from '@/lib/types'

interface NotificationsContextValue {
  unreadCount: number
  items: AppNotification[]
  loading: boolean
  refresh: () => Promise<void>
  loadItems: () => Promise<void>
  markRead: (id: number) => Promise<void>
  markAllRead: () => Promise<void>
  openNotification: (notification: AppNotification) => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined)

const POLL_MS = 30_000

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [unreadCount, setUnreadCount] = useState(0)
  const [items, setItems] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(false)
  const prevUnreadRef = useRef(0)
  const initializedRef = useRef(false)

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0)
      prevUnreadRef.current = 0
      initializedRef.current = false
      return
    }
    try {
      const res = await api.get('/notifications/unread-count')
      const count = Number(res.data?.count ?? 0)
      if (initializedRef.current && count > prevUnreadRef.current) {
        try {
          const latestRes = await api.get('/notifications/latest-unread')
          if (latestRes.status === 200 && latestRes.data) {
            const n = latestRes.data as AppNotification
            toast(n.title, { id: `notif-${n.id}`, duration: 5000 })
          } else {
            toast('You have a new notification')
          }
        } catch {
          toast('You have a new notification')
        }
      }
      prevUnreadRef.current = count
      initializedRef.current = true
      setUnreadCount(count)
    } catch {
      // ignore polling errors
    }
  }, [isAuthenticated])

  const loadItems = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([])
      return
    }
    setLoading(true)
    try {
      const res = await api.get('/notifications?page=0&size=20')
      setItems(res.data?.content ?? [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  const markRead = useCallback(async (id: number) => {
    await api.post(`/notifications/${id}/read`)
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    setUnreadCount((c) => Math.max(0, c - 1))
    prevUnreadRef.current = Math.max(0, prevUnreadRef.current - 1)
  }, [])

  const markAllRead = useCallback(async () => {
    await api.post('/notifications/read-all')
    setItems((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
    prevUnreadRef.current = 0
  }, [])

  const openNotification = useCallback(
    async (notification: AppNotification) => {
      if (!notification.read) {
        try {
          await markRead(notification.id)
        } catch {
          // still navigate
        }
      }
      if (notification.linkPath) {
        router.push(notification.linkPath)
      }
    },
    [markRead, router],
  )

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0)
      setItems([])
      prevUnreadRef.current = 0
      initializedRef.current = false
      return
    }
    refresh()
    const id = window.setInterval(refresh, POLL_MS)
    return () => window.clearInterval(id)
  }, [isAuthenticated, refresh])

  return (
    <NotificationsContext.Provider
      value={{
        unreadCount,
        items,
        loading,
        refresh,
        loadItems,
        markRead,
        markAllRead,
        openNotification,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationsProvider')
  }
  return ctx
}
