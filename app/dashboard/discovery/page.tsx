'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { DiscoverySkeleton } from '@/app/common/dashboard/SocialLoading'
import { getPublicUsers, type User } from '@/services/userService'

interface DiscoveryProfile {
  id: string
  name: string
  handle: string
  bio: string
  image: string
}

const sanitizeHandle = (username?: string) => username?.replace(/^@/, '').trim() || ''

const toDiscoveryProfile = (profile: User): DiscoveryProfile => ({
  id: profile.userId || profile.id || '',
  name: profile.displayName?.trim() || '',
  handle: sanitizeHandle(profile.username),
  bio: profile.bio?.trim() || '',
  image: profile.profilePicture || '',
})

export default function DiscoveryPage() {
  const [creators, setCreators] = useState<DiscoveryProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const loadDiscovery = async () => {
      try {
        const profiles = await getPublicUsers()
        if (!active) return

        setCreators(profiles.map(toDiscoveryProfile))
      } catch (error) {
        console.error('Failed to load discovery profiles:', error)
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadDiscovery()

    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return <DiscoverySkeleton />
  }

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      {creators.map((creator) => (
        <Link
          key={creator.id}
          href={`/dashboard/users/${creator.id}`}
          className="rounded-xl border bg-card p-4 transition-colors hover:bg-accent/40"
        >
          <article className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 shrink-0">
                <AvatarImage src={creator.image} alt={creator.name} />
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{creator.name}</p>
                <p className="truncate text-xs text-muted-foreground">{creator.handle}</p>
              </div>
            </div>

            <p className="line-clamp-2 text-sm text-muted-foreground">{creator.bio}</p>
          </article>
        </Link>
      ))}
    </div>
  )
}
