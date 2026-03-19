'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { DiscoverySkeleton } from '@/app/common/dashboard/SocialLoading'
import { getDisplayAvatar } from '@/lib/avatar'
import { getAllUsers, type User } from '@/services/userService'

interface DiscoveryProfile {
  id: string
  name: string
  handle: string
  bio: string
  image: string
  category: string
  href: string
}

const sanitizeHandle = (username?: string) => username?.replace(/^@/, '').trim() || ''

const toDiscoveryProfile = (profile: User): DiscoveryProfile => {
  const cleanHandle = sanitizeHandle(profile.username || profile.slug || profile.email?.split('@')[0])
  const displayName = profile.displayName?.trim() || cleanHandle || 'User'

  return {
    id: profile.userId || profile.id || '',
    name: displayName,
    handle: cleanHandle,
    bio: profile.bio?.trim() || 'No bio added yet.',
    image: getDisplayAvatar({
      image: profile.profilePicture || profile.photoURL || '',
      displayName,
      handle: cleanHandle || profile.email || profile.id || 'user',
    }),
    category: profile.category?.trim() || 'User',
    href: cleanHandle ? `/${cleanHandle}` : `/dashboard/users/${profile.userId || profile.id || ''}`,
  }
}

export default function DiscoveryPage() {
  const [users, setUsers] = useState<DiscoveryProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const loadDiscovery = async () => {
      try {
        const profiles = await getAllUsers()
        if (!active) return

        setUsers(profiles.map(toDiscoveryProfile))
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

  return users.length === 0 ? (
    <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
      No users found yet.
    </div>
  ) : (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {users.map((user) => (
        <Link
          key={user.id}
          href={user.href}
          className="rounded-2xl border bg-card p-4 transition-colors hover:bg-accent/40"
        >
          <article className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-14 w-14 shrink-0 border">
                <AvatarImage src={user.image} alt={user.name} />
                <AvatarFallback>{user.name.slice(0, 1).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">@{user.handle || 'user'}</p>
              </div>
              <Badge variant="secondary" className="shrink-0">{user.category}</Badge>
            </div>

            <p className="line-clamp-2 text-sm text-muted-foreground">{user.bio}</p>
          </article>
        </Link>
      ))}
    </div>
  )
}
