'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import Login from '@/app/auth/login/page'

export default function ProtectedRouteHandler({ targetPath }) {
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsAuthenticated(true)
        router.push(targetPath)
      } else {
        setIsAuthenticated(false)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router, targetPath])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <Login />
  }

  return null
}