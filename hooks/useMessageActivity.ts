'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { onUnreadCountSnapshot } from '@/lib/social-data'

export function useMessageActivity() {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user?.uid) {
      setUnreadCount(0)
      return
    }

    const unsubscribe = onUnreadCountSnapshot(user.uid, (count) => {
      setUnreadCount(count)
    })

    return () => unsubscribe()
  }, [user?.uid])

  return { unreadCount }
}
