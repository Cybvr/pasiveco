'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { getPublicUsers, type User } from '@/services/userService'
import { getDisplayAvatar } from '@/lib/avatar'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

interface DiscoveryProfile {
  id: string
  name: string
  handle: string
  image: string
  href: string
  category: string
  bio: string
  isFeatured: boolean
  isTrending: boolean
  createdAt: any
}

const sanitizeHandle = (username?: string) => username?.replace(/^@/, '').trim() || ''

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
    category: profile.category || '',
    bio: profile.bio || '',
    isFeatured: !!profile.isFeatured,
    isTrending: !!profile.isTrending,
    createdAt: profile.createdAt,
  }
}

export default function DashboardDiscoverySections() {
  const [users, setUsers] = useState<DiscoveryProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const profiles = await getPublicUsers()
        setUsers(profiles.map(toDiscoveryProfile).filter((profile) => Boolean(profile.id)))
      } catch (error) {
        console.error('Failed to load discovery profiles:', error)
      } finally {
        setLoading(false)
      }
    }
    void loadUsers()
  }, [])

  const popularThisWeek = useMemo(() => users.filter(u => u.isTrending).slice(0, 8), [users])
  const topCreators = useMemo(() => users.filter(u => u.isFeatured).slice(0, 8), [users])
  const newCreators = useMemo(() => [...users].sort((a, b) => {
    const timeA = a.createdAt?.toMillis?.() || 0
    const timeB = b.createdAt?.toMillis?.() || 0
    return timeB - timeA
  }).slice(0, 8), [users])

  const topics = useMemo(() => {
    const categories = new Set(users.map(u => u.category).filter(Boolean))
    return Array.from(categories).sort().slice(0, 12)
  }, [users])

  if (loading || users.length === 0) return null

  const Section = ({ title, creators }: { title: string; creators: DiscoveryProfile[] }) => {
    if (creators.length === 0) return null
    return (
      <div className="space-y-4 py-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-extrabold tracking-tight text-foreground uppercase">{title}</h2>
          <Link href="/dashboard/discovery" className="text-xs font-semibold text-primary hover:underline">
            View all
          </Link>
        </div>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex w-max space-x-5 pb-4">
            {creators.map((creator) => (
              <Link key={creator.id} href={creator.href} className="w-[120px] group transition-all">
                <div className="flex flex-col items-start gap-3">
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl border-2 border-background ring-2 ring-muted/10 transition-transform group-hover:scale-[1.03]">
                    <Avatar className="h-full w-full rounded-none">
                      <AvatarImage src={creator.image} alt={creator.handle} className="object-cover" />
                      <AvatarFallback className="text-2xl font-bold rounded-none">{creator.handle.slice(0, 1).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="text-left w-full space-y-1">
                    <p className="truncate text-[13px] font-bold text-foreground leading-tight">@{creator.handle}</p>
                    {creator.bio && (
                      <p className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground/70 whitespace-normal">
                        {creator.bio}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="hidden" />
        </ScrollArea>
      </div>
    )
  }

  return (
    <div className="space-y-6 -mx-1">
      <Section title="Popular this week" creators={popularThisWeek} />
      
      {topics.length > 0 && (
        <div className="space-y-4 py-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-extrabold tracking-tight text-foreground uppercase">Explore Topics</h2>
          </div>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex w-max space-x-2 pb-2">
              {topics.map((topic) => (
                <Link key={topic} href={`/dashboard/discovery?category=${encodeURIComponent(topic)}`}>
                  <Badge variant="secondary" className="rounded-full px-4 py-1.5 text-[11px] font-semibold hover:bg-foreground hover:text-background transition-colors">
                    {topic}
                  </Badge>
                </Link>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="hidden" />
          </ScrollArea>
        </div>
      )}

      <Section title="New Creators" creators={newCreators} />
      <Section title="Top Creators" creators={topCreators} />
      
      <div className="h-px bg-border my-6" />
    </div>
  )
}
