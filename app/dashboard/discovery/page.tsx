'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DiscoverySkeleton } from '@/app/common/dashboard/SocialLoading'
import { getSocialCategories, getSocialProfiles, type SocialProfile } from '@/lib/social-data'

export default function DiscoveryPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [creators, setCreators] = useState<SocialProfile[]>([])
  const [categories, setCategories] = useState<string[]>(['All'])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const loadDiscovery = async () => {
      try {
        const [profiles, categoryList] = await Promise.all([getSocialProfiles(), getSocialCategories()])
        if (!active) return
        setCreators(profiles.filter((profile) => profile.id !== 'viewer-me'))
        setCategories(['All', ...categoryList])
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
                  <AvatarFallback>{creator.name.slice(0, 1)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{creator.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{creator.handle}</p>
                </div>
              </div>

              <p className="line-clamp-2 text-sm text-muted-foreground">{creator.bio}</p>

              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>{creator.location}</span>
                <span>{creator.links.length} links · {creator.shop.length} offers</span>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  )
}
