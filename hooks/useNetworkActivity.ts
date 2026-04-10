'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getRecentCommentsCount } from '@/services/postService'

export function useNetworkActivity() {
  const { user } = useAuth()
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false)
      return
    }

    const fetchCount = async () => {
      try {
        const c = await getRecentCommentsCount(user.uid, 3)
        setCount(c)
      } catch (err) {
        console.error('Error fetching network activity count:', err)
      } finally {
        setLoading(false)
      }
    }

    void fetchCount()
  }, [user?.uid])

  return { count, loading }
}
