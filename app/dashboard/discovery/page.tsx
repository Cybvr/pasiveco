'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DiscoverySkeleton } from '@/app/common/dashboard/SocialLoading'
import { getDisplayAvatar } from '@/lib/avatar'
import { getUserCategories } from '@/services/categoryService'
import { getPublicUsers, type User } from '@/services/userService'

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
  const displayName = profile.displayName?.trim() || cleanHandle || 'Creator'

  return {
    id: profile.userId || profile.id || '',
    name: displayName,
    handle: cleanHandle,
    bio: profile.bio?.trim() || 'No bio added yet.',
    image: getDisplayAvatar({
      image: profile.profilePicture || profile.photoURL || '',
      displayName,
      handle: cleanHandle || profile.email || profile.id || 'creator',
    }),
    category: profile.category?.trim() || 'Creator',
    href: cleanHandle ? `/${cleanHandle}` : `/dashboard/users/${profile.userId || profile.id || ''}`,
  }
}

export default function DiscoveryPage() {
  const [creators, setCreators] = useState<DiscoveryProfile[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const loadDiscovery = async () => {
      try {
        const [profiles, categoryList] = await Promise.all([getPublicUsers(), getUserCategories()])
        if (!active) return

        setCreators(profiles.map(toDiscoveryProfile))
        setCategories(['All', ...categoryList.map((item) => item.name)])
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

  const filteredCreators = useMemo(() => {
    if (selectedCategory === 'All') {
      return creators
    }

    return creators.filter((creator) => creator.category.toLowerCase() === selectedCategory.toLowerCase())
  }, [creators, selectedCategory])

  if (loading) {
    return <DiscoverySkeleton />
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Discover creators</h2>
          <p className="text-sm text-muted-foreground">Browse public profiles by category.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              type="button"
              size="sm"
              variant={selectedCategory === category ? 'default' : 'outline'}
              className="rounded-full"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {filteredCreators.length === 0 ? (
        <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
          No creators found for this category yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filteredCreators.map((creator) => (
            <Link
              key={creator.id}
              href={creator.href}
              className="rounded-2xl border bg-card p-4 transition-colors hover:bg-accent/40"
            >
              <article className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-14 w-14 shrink-0 border">
                    <AvatarImage src={creator.image} alt={creator.name} />
                    <AvatarFallback>{creator.name.slice(0, 1).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{creator.name}</p>
                    <p className="truncate text-xs text-muted-foreground">@{creator.handle || 'creator'}</p>
                  </div>
                  <Badge variant="secondary" className="shrink-0">{creator.category}</Badge>
                </div>

                <p className="line-clamp-2 text-sm text-muted-foreground">{creator.bio}</p>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
