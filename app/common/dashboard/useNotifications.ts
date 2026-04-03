'use client'

import { useEffect, useMemo, useState } from 'react'
import { Timestamp } from 'firebase/firestore'
import { Users } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { getAllUsers, getUser } from '@/services/userService'
import {
  getBaseNotificationsForAudience,
  type NotificationAudience,
  type NotificationItem,
} from './NotificationsList'

const MAX_ADMIN_SIGNUP_NOTIFICATIONS = 5

function formatRelativeTime(value?: Timestamp) {
  if (!(value instanceof Timestamp)) return 'Just now'

  const diffMs = Date.now() - value.toMillis()
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diffMs < minute) return 'Just now'
  if (diffMs < hour) {
    const minutes = Math.floor(diffMs / minute)
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  }
  if (diffMs < day) {
    const hours = Math.floor(diffMs / hour)
    return `${hours} hour${hours === 1 ? '' : 's'} ago`
  }

  const days = Math.floor(diffMs / day)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

function buildAdminSignupNotifications(): Promise<NotificationItem[]> {
  return getAllUsers().then((users) =>
    users
      .filter((user) => !user.isAdmin && user.role !== 'admin')
      .slice(0, MAX_ADMIN_SIGNUP_NOTIFICATIONS)
      .map((user) => {
        const name = user.displayName || user.username || user.email || 'A new user'

        return {
          id: `signup-${user.id || user.userId || user.email}`,
          icon: Users,
          title: 'New user registered',
          body: `${name} joined Pasive${user.email ? ` with ${user.email}.` : '.'}`,
          time: formatRelativeTime(user.createdAt),
          status: 'new' as const,
          category: 'activity' as const,
          visibility: 'admin' as const,
        }
      })
  )
}

export function useNotifications(forcedAudience?: NotificationAudience) {
  const { user } = useAuth()
  const [audience, setAudience] = useState<NotificationAudience>(forcedAudience ?? 'creator')
  const [dynamicItems, setDynamicItems] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let isMounted = true

    const resolveAudience = async () => {
      if (forcedAudience) {
        if (isMounted) setAudience(forcedAudience)
        return
      }

      if (!user?.uid) {
        if (isMounted) setAudience('creator')
        return
      }

      try {
        const profile = await getUser(user.uid)
        if (isMounted) {
          setAudience(profile?.isAdmin || profile?.role === 'admin' ? 'admin' : 'creator')
        }
      } catch (error) {
        console.error('Error resolving notifications audience:', error)
        if (isMounted) setAudience('creator')
      }
    }

    void resolveAudience()

    return () => {
      isMounted = false
    }
  }, [forcedAudience, user])

  useEffect(() => {
    let isMounted = true

    const loadDynamicNotifications = async () => {
      if (audience !== 'admin') {
        if (isMounted) setDynamicItems([])
        return
      }

      setLoading(true)
      try {
        const adminItems = await buildAdminSignupNotifications()
        if (isMounted) {
          setDynamicItems(adminItems)
        }
      } catch (error) {
        console.error('Error loading admin notifications:', error)
        if (isMounted) {
          setDynamicItems([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void loadDynamicNotifications()

    return () => {
      isMounted = false
    }
  }, [audience])

  const items = useMemo(() => {
    return [...dynamicItems, ...getBaseNotificationsForAudience(audience)]
  }, [audience, dynamicItems])

  return { audience, items, loading }
}
