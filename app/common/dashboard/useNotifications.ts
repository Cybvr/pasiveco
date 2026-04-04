'use client'

import { useEffect, useMemo, useState } from 'react'
import { Timestamp } from 'firebase/firestore'
import { Users, Rss, ShoppingBag } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { getAllUsers, getUser } from '@/services/userService'
import { blogService } from '@/services/blogService'
import { getSellerTransactions } from '@/services/transactionsService'
import {
  getBaseNotificationsForAudience,
  type NotificationAudience,
  type NotificationItem,
} from './NotificationsList'

const MAX_ADMIN_SIGNUP_NOTIFICATIONS = 5

function formatRelativeTime(value?: Timestamp | Date | string | number) {
  if (!value) return 'Just now'

  let millis: number
  if (value instanceof Timestamp) {
    millis = value.toMillis()
  } else if (value instanceof Date) {
    millis = value.getTime()
  } else if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value)
    if (isNaN(date.getTime())) return 'Just now'
    millis = date.getTime()
  } else {
    return 'Just now'
  }

  const diffMs = Date.now() - millis
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diffMs < 0) return 'Just now'
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

function buildBlogNotifications(): Promise<NotificationItem[]> {
  return blogService.getAllPosts().then((posts) =>
    (posts as any[])
      .sort((a: any, b: any) => {
        const aTime = a.createdAt?.toMillis?.() || new Date(a.date || 0).getTime()
        const bTime = b.createdAt?.toMillis?.() || new Date(b.date || 0).getTime()
        return bTime - aTime
      })
      .slice(0, 3)
      .map((post: any) => ({
        id: `blog-${post.id}`,
        icon: Rss,
        title: 'New Pasive blog update',
        body: post.title || 'Pasive shared a new post in the blog.',
        time: formatRelativeTime(post.createdAt || post.date),
        status: 'done' as const,
        category: 'updates' as const,
        visibility: 'all' as const,
      }))
  )
}

async function buildSaleNotifications(userId: string): Promise<NotificationItem[]> {
  try {
    const transactions = await getSellerTransactions(userId)
    return transactions
      .filter((tx) => tx.status === 'success')
      .slice(0, 5)
      .map((tx) => ({
        id: `sale-${tx.id}`,
        icon: ShoppingBag,
        title: 'New sale recorded',
        body: `You received a payment for ${tx.productName || 'a product'}.`,
        time: formatRelativeTime(tx.createdAt),
        status: 'new' as const,
        category: 'activity' as const,
        visibility: 'creator' as const,
      }))
  } catch (error) {
    console.warn('Error building sale notifications:', error)
    return []
  }
}

export function useNotifications(forcedAudience?: NotificationAudience) {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [dynamicItems, setDynamicItems] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(false)

  // Resolve user role
  useEffect(() => {
    let isMounted = true
    const checkRole = async () => {
      if (!user?.uid) return
      try {
        const profile = await getUser(user.uid)
        if (isMounted) {
          setIsAdmin(profile?.isAdmin || profile?.role === 'admin')
        }
      } catch (error) {
        console.error('Error resolving notifications audience:', error)
      }
    }
    void checkRole()
    return () => { isMounted = false }
  }, [user])

  const audience: NotificationAudience = forcedAudience ?? (isAdmin ? 'admin' : 'creator')

  useEffect(() => {
    let isMounted = true

    const loadDynamicNotifications = async () => {
      setLoading(true)
      try {
        const promises: Promise<NotificationItem[]>[] = [buildBlogNotifications()]

        // Always show signups to admins
        if (isAdmin) {
          promises.push(buildAdminSignupNotifications())
        }
        
        // Always show sales to the current user (if any exist)
        if (user?.uid) {
          promises.push(buildSaleNotifications(user.uid))
        }

        const results = await Promise.all(promises)
        if (isMounted) {
          // Merge and sort by time (though build functions have some slicing/sorting already)
          const allItems = results.flat()
          setDynamicItems(allItems)
        }
      } catch (error) {
        console.error('Error loading dynamic notifications:', error)
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
  }, [isAdmin, user?.uid])

  const items = useMemo(() => {
    // Merge dynamic items with any hardcoded base notifications for this audience
    return [...dynamicItems, ...getBaseNotificationsForAudience(audience)]
  }, [audience, dynamicItems])

  return { audience, items, loading }
}
