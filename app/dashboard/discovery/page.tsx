'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DiscoverySkeleton } from '@/app/common/dashboard/SocialLoading'
import { getDisplayAvatar } from '@/lib/avatar'
import { getAllUsers, type User } from '@/services/userService'

interface DiscoveryProfile {
  id: string
  name: string
  handle: string
  image: string
  href: string
  category: string
}

const sanitizeHandle = (username?: string) => username?.replace(/^@/, '').trim() || ''
const sanitizeCategory = (category?: string) => category?.trim() || ''

const toDiscoveryProfile = (profile: User): DiscoveryProfile => {
  const cleanHandle = sanitizeHandle(profile.username || profile.slug || profile.email?.split('@')[0])
  const displayName = profile.displayName?.trim() || cleanHandle || 'User'
  const userId = profile.userId || profile.id || ''
  const publicPath = cleanHandle ? `/${cleanHandle}` : '/'

  return {
    id: userId,
    name: displayName,
    handle: cleanHandle,
    image: getDisplayAvatar({
      image: profile.profilePicture || profile.photoURL || '',
      displayName,
      handle: cleanHandle || profile.email || profile.id || 'user',
    }),
    href: publicPath,
    category: sanitizeCategory(profile.category),
  }
}

export default function DiscoveryPage() {
  const [users, setUsers] = useState<DiscoveryProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    let active = true

    const loadDiscovery = async () => {
      try {
        const profiles = await getAllUsers()
        if (!active) return

        setUsers(profiles.map(toDiscoveryProfile).filter((profile) => Boolean(profile.id)))
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

  const categoryOptions = useMemo(() => {
    const counts = users.reduce<Record<string, number>>((accumulator, user) => {
      if (!user.category) {
        return accumulator
      }

      accumulator[user.category] = (accumulator[user.category] || 0) + 1
      return accumulator
    }, {})

    return Object.entries(counts)
      .sort(([categoryA], [categoryB]) => categoryA.localeCompare(categoryB))
      .map(([category, count]) => ({ value: category, label: `${category} (${count})` }))
  }, [users])

  const filteredUsers = useMemo(() => {
    if (selectedCategory === 'all') {
      return users
    }

    return users.filter((user) => user.category === selectedCategory)
  }, [selectedCategory, users])

  const allTabLabel = useMemo(() => `All (${users.length})`, [users.length])

  if (loading) {
    return <DiscoverySkeleton />
  }

  return users.length === 0 ? (
    <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
      No users found yet.
    </div>
  ) : (
    <div className="space-y-4">
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="inline-flex h-auto flex-wrap rounded-2xl border bg-card p-1">
          <TabsTrigger value="all" className="rounded-xl px-4 py-2 text-sm font-medium">
            {allTabLabel}
          </TabsTrigger>
          {categoryOptions.map((category) => (
            <TabsTrigger key={category.value} value={category.value} className="rounded-xl px-4 py-2 text-sm font-medium">
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
        {filteredUsers.map((user) => (
          <Link
            key={user.id}
            href={user.href}
            className="rounded-2xl border bg-card p-4 transition-colors hover:bg-accent/40"
          >
            <article className="flex flex-col items-center gap-3 text-center">
              <div className="flex items-center justify-center">
                <Avatar className="h-14 w-14 shrink-0 border">
                  <AvatarImage src={user.image} alt={user.name} />
                  <AvatarFallback>{user.name.slice(0, 1).toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
              <div className="min-w-0 space-y-1">
                <p className="truncate text-sm font-semibold">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">@{user.handle || 'user'}</p>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  )
}
