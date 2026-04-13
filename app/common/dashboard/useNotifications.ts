'use client'

import { useEffect, useMemo, useState } from 'react'
import { Timestamp } from 'firebase/firestore'
import { Users, Rss, ShoppingBag, MessageSquare, Shield } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { markThreadAsRead, onMessageThreadsSnapshot } from '@/lib/social-data'
import { getAllUsers, getUser, updateUser } from '@/services/userService'
import { blogService } from '@/services/blogService'
import { getSellerTransactions } from '@/services/transactionsService'
import { getRecentCommentsCount, getRecentPostsCount } from '@/services/postService'
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

async function buildNetworkNotifications(userId: string): Promise<NotificationItem[]> {
  try {
    const [postsToday, commentsCount] = await Promise.all([
      getRecentPostsCount(userId, 1),
      getRecentCommentsCount(userId, 3),
    ])

    const items: NotificationItem[] = []

    if (postsToday > 0) {
      items.push({
        id: `network-posts-${userId}`,
        icon: MessageSquare,
        title: 'New posts in your spaces',
        body: `There ${postsToday === 1 ? 'is' : 'are'} ${postsToday} new ${postsToday === 1 ? 'post' : 'posts'} in your Spaces today.`,
        time: 'Today',
        status: 'new' as const,
        category: 'activity' as const,
        visibility: 'creator' as const,
      })
    }

    if (commentsCount > 0) {
      items.push({
        id: `network-comments-${userId}`,
        icon: MessageSquare,
        title: 'Recent replies in your spaces',
        body: `There ${commentsCount === 1 ? 'is' : 'are'} ${commentsCount} new ${commentsCount === 1 ? 'reply' : 'replies'} across your Spaces from the last 3 days.`,
        time: 'Recent',
        status: 'new' as const,
        category: 'activity' as const,
        visibility: 'creator' as const,
      })
    }

    return items
  } catch (error) {
    console.warn('Error building network notifications:', error)
    return []
  }
}

async function buildLoginSessionNotifications(userId: string): Promise<NotificationItem[]> {
  try {
    const profile = await getUser(userId)
    if (!profile?.lastLoginAt) return []

    const loginAt = profile.lastLoginAt.toDate()
    const ageMs = Date.now() - loginAt.getTime()
    const sevenDays = 7 * 24 * 60 * 60 * 1000

    if (ageMs > sevenDays) return []

    return [
      {
        id: `login-session-${userId}-${profile.lastLoginAt.toMillis()}`,
        icon: Shield,
        title: 'Recent login session',
        body: 'Your account signed in successfully. Review this if the session was not you.',
        time: formatRelativeTime(profile.lastLoginAt),
        status: ageMs < 24 * 60 * 60 * 1000 ? 'new' as const : 'done' as const,
        category: 'activity' as const,
        visibility: 'creator' as const,
      },
    ]
  } catch (error) {
    console.warn('Error building login session notifications:', error)
    return []
  }
}

export function useNotifications(forcedAudience?: NotificationAudience) {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [dynamicItems, setDynamicItems] = useState<NotificationItem[]>([])
  const [messageItems, setMessageItems] = useState<NotificationItem[]>([])
  const [clearedNotificationIds, setClearedNotificationIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [markingAllRead, setMarkingAllRead] = useState(false)
  const [preferences, setPreferences] = useState({
    email: true,
    push: true,
    sales: true,
    updates: true,
    spaces: true,
    security: true,
  })

  // Resolve user role
  useEffect(() => {
    let isMounted = true
    const checkRole = async () => {
      if (!user?.uid) return
      try {
        const profile = await getUser(user.uid)
        if (isMounted) {
          setIsAdmin(profile?.isAdmin || profile?.role === 'admin')
          setPreferences({
            email: profile?.notificationPreferences?.email ?? true,
            push: profile?.notificationPreferences?.push ?? true,
            sales: profile?.notificationPreferences?.sales ?? true,
            updates: profile?.notificationPreferences?.updates ?? true,
            spaces: profile?.notificationPreferences?.spaces ?? true,
            security: profile?.notificationPreferences?.security ?? true,
          })
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

    const loadClearedNotifications = async () => {
      if (!user?.uid) {
        setClearedNotificationIds([])
        return
      }

      try {
        const profile = await getUser(user.uid)
        if (!isMounted) return
        setClearedNotificationIds(profile?.notificationState?.clearedIds || [])
      } catch (error) {
        console.error('Error loading cleared notifications:', error)
        if (isMounted) {
          setClearedNotificationIds([])
        }
      }
    }

    void loadClearedNotifications()

    return () => {
      isMounted = false
    }
  }, [user?.uid])

  useEffect(() => {
    if (!user?.uid || isAdmin) {
      setMessageItems([])
      return
    }

    const unsubscribe = onMessageThreadsSnapshot(user.uid, (threads) => {
      const nextMessageItems = threads
        .filter((thread) => thread.hasUnread)
        .slice(0, 5)
        .map((thread) => ({
          id: `message-${thread.id}-${thread.lastMessage.id}`,
          threadId: thread.id,
          icon: MessageSquare,
          title: thread.participant.name || thread.participant.handle || 'New message',
          body: thread.lastMessage.text || 'Sent you a new message.',
          time: formatRelativeTime(thread.lastMessage.createdAt),
          status: 'new' as const,
          category: 'activity' as const,
          visibility: 'creator' as const,
          unreadAmount: thread.unreadCount || 1,
        }))

      setMessageItems(nextMessageItems)
    })

    return () => unsubscribe()
  }, [isAdmin, user?.uid])

  useEffect(() => {
    let isMounted = true

    const loadDynamicNotifications = async () => {
      setLoading(true)
      try {
        const promises: Promise<NotificationItem[]>[] = []

        if (preferences.updates) {
          promises.push(buildBlogNotifications())
        }

        // Always show signups to admins
        if (isAdmin) {
          promises.push(buildAdminSignupNotifications())
        }
        
        // Always show sales to the current user (if any exist)
        if (user?.uid && preferences.sales) {
          promises.push(buildSaleNotifications(user.uid))
        }

        if (user?.uid && preferences.spaces) {
          promises.push(buildNetworkNotifications(user.uid))
        }

        if (user?.uid && preferences.security) {
          promises.push(buildLoginSessionNotifications(user.uid))
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
  }, [isAdmin, preferences.sales, preferences.security, preferences.spaces, preferences.updates, user?.uid])

  const items = useMemo(() => {
    // Hide notifications the user has already cleared in this session.
    return [...messageItems, ...dynamicItems, ...getBaseNotificationsForAudience(audience)].filter(
      (item) => !clearedNotificationIds.includes(item.id)
    )
  }, [audience, clearedNotificationIds, dynamicItems, messageItems])

  const markAllRead = async () => {
    if (!user?.uid) return

    const visibleItems = items
    if (visibleItems.length === 0) return

    setMarkingAllRead(true)
    try {
      await Promise.all(
        visibleItems
          .filter((item) => item.threadId)
          .map((item) => markThreadAsRead(item.threadId as string, user.uid))
      )

      const nextClearedIds = Array.from(new Set([...clearedNotificationIds, ...visibleItems.map((item) => item.id)]))
      setClearedNotificationIds(nextClearedIds)
      await updateUser(user.uid, {
        notificationState: {
          clearedIds: nextClearedIds,
        },
      })
    } catch (error) {
      console.error('Error marking notifications as read:', error)
    } finally {
      setMarkingAllRead(false)
    }
  }

  return { audience, items, loading, markAllRead, markingAllRead }
}
