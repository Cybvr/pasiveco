'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
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
  bio: string
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
    bio: profile.bio || '',
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
      if (!user.category) return accumulator
      accumulator[user.category] = (accumulator[user.category] || 0) + 1
      return accumulator
    }, {})

    return Object.entries(counts)
      .sort(([catA], [catB]) => catA.localeCompare(catB))
      .map(([value, count]) => ({ value, label: `${value} (${count})` }))
  }, [users])

  const filteredUsers = useMemo(() => {
    if (selectedCategory === 'all') return users
    return users.filter((u) => u.category === selectedCategory)
  }, [selectedCategory, users])
  if (loading) {
    return <DiscoverySkeleton />
  }

  return users.length === 0 ? (
    <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
      No users found yet.
    </div>
  ) : (
    <div className="flex flex-col gap-4 p-1 md:p-0">
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <div className="relative overflow-x-auto pb-2 scrollbar-hide">
          <TabsList className="flex h-auto w-max min-w-full justify-start gap-3 bg-transparent p-0 border-none md:w-auto md:min-w-0">
            <TabsTrigger 
              value="all" 
              className="rounded-full px-6 py-2.5 text-[13px] font-bold bg-muted/50 text-muted-foreground transition-all data-[state=active]:bg-foreground data-[state=active]:text-background hover:bg-muted"
            >
              All ({users.length})
            </TabsTrigger>
            {categoryOptions.map((cat) => (
              <TabsTrigger 
                key={cat.value} 
                value={cat.value}
                className="rounded-full px-6 py-2.5 text-[13px] font-bold bg-muted/50 text-muted-foreground transition-all data-[state=active]:bg-foreground data-[state=active]:text-background hover:bg-muted"
              >
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>

      <div className="grid grid-cols-3 gap-x-2 gap-y-8 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
        {filteredUsers.map((user) => (
          <Link
            key={user.id}
            href={user.href}
            className="group block"
          >
            <article className="flex flex-col items-start gap-3 text-left">
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl border bg-gradient-to-br from-muted/5 to-muted/20 shadow-sm transition-all duration-300 ring-offset-background group-hover:ring-2 group-hover:ring-primary/20">
                <Avatar className="h-full w-full rounded-none border-none">
                  <AvatarImage 
                    src={user.image} 
                    alt={user.handle} 
                    className="object-cover" 
                  />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 text-2xl font-bold tracking-tighter text-muted-foreground/30 border-none">
                    {user.handle.slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="min-w-0 w-full space-y-1 px-0.5">
                <p className="truncate text-xs font-semibold tracking-tight text-foreground/90">
                  @{user.handle || 'user'}
                </p>
                {user.bio && (
                  <p className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground/70 sm:text-xs">
                    {user.bio}
                  </p>
                )}
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  )
}
