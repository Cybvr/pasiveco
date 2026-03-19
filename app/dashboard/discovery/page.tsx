'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DiscoverySkeleton } from '@/app/common/dashboard/SocialLoading'
import { getPublicUserProfiles, type UserProfile } from '@/services/userProfilesService'

interface DiscoveryProfile {
  id: string
  name: string
  handle: string
  category: string
  bio: string
  image: string
  linkCount: number
  socialCount: number
}

const normalizeHandle = (username: string) => {
  const cleanUsername = username.replace(/^@/, '').trim()
  return cleanUsername ? `@${cleanUsername}` : '@user'
}

const formatCategory = (source?: string) => {
  const cleanedSource = source?.trim()
  return cleanedSource ? cleanedSource : 'Creators'
}

const toDiscoveryProfile = (profile: UserProfile): DiscoveryProfile => ({
  id: profile.userId,
  name: profile.displayName || normalizeHandle(profile.username),
  handle: normalizeHandle(profile.username),
  category: formatCategory(profile.source),
  bio: profile.bio?.trim() || 'No bio added yet.',
  image: profile.profilePicture || '',
  linkCount: profile.links.filter((link) => link.active !== false).length,
  socialCount: profile.socialLinks.filter((link) => link.active !== false && Boolean(link.url?.trim())).length,
})

export default function DiscoveryPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [creators, setCreators] = useState<DiscoveryProfile[]>([])
  const [categories, setCategories] = useState<string[]>(['All'])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const loadDiscovery = async () => {
      try {
        const profiles = await getPublicUserProfiles()
        if (!active) return

        const discoveryProfiles = profiles.map(toDiscoveryProfile)
        const nextCategories = Array.from(new Set(discoveryProfiles.map((profile) => profile.category)))

        setCreators(discoveryProfiles)
        setCategories(['All', ...nextCategories])
      } catch (error) {
        console.error('Failed to load discovery profiles:', error)
        if (active) {
          setCreators([])
          setCategories(['All'])
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadDiscovery()

    return () => {
      active = false
    }
  }, [])

  const filteredCreators = useMemo(
    () => creators.filter((creator) => activeCategory === 'All' || creator.category === activeCategory),
    [activeCategory, creators],
  )

  if (loading) {
    return <DiscoverySkeleton />
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="h-auto w-full justify-start gap-2 overflow-x-auto rounded-xl border-0 bg-transparent p-0">
          {categories.map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              className="rounded-full border px-4 py-2 after:hidden data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {filteredCreators.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCreators.map((creator) => (
            <Link
              key={creator.id}
              href={`/dashboard/users/${creator.id}`}
              className="rounded-xl border bg-card p-4 transition-colors hover:bg-accent/40"
            >
              <article className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={creator.image} alt={creator.name} />
                    <AvatarFallback>{creator.name.slice(0, 1).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{creator.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{creator.handle}</p>
                  </div>
                </div>

                <p className="line-clamp-2 text-sm text-muted-foreground">{creator.bio}</p>

                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>{creator.category}</span>
                  <span>{creator.linkCount} links · {creator.socialCount} socials</span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
          No public creator profiles yet.
        </div>
      )}
    </div>
  )
}
