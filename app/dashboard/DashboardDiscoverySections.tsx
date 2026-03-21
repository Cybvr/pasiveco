'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DiscoverySkeleton } from '@/app/common/dashboard/SocialLoading'
import { getPublicUsers, type User } from '@/services/userService'
import { getDisplayAvatar } from '@/lib/avatar'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import CommunityDiscovery from './CommunityDiscovery'

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

  const topicColors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
    'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
    'linear-gradient(135deg, #fd7043 0%, #ffb300 100%)',
    'linear-gradient(135deg, #00c9ff 0%, #92fe9d 100%)',
    'linear-gradient(135deg, #fc5c7d 0%, #6a3093 100%)',
    'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
  ]

  if (loading) return <DiscoverySkeleton />
  if (users.length === 0) return null

  const Section = ({ title, creators }: { title: string; creators: DiscoveryProfile[] }) => {
    if (creators.length === 0) return null
    return (
      <div className="space-y-3 py-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-extrabold tracking-tight text-foreground">{title}</h2>
          <Link href="/dashboard/discovery" className="text-xs font-semibold text-primary hover:underline">
            View all
          </Link>
        </div>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex w-max space-x-5 pb-4">
            {creators.map((creator) => (
              <Link key={creator.id} href={creator.href} className="w-[120px]">
                <div className="flex flex-col items-start gap-3">
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl border-2 border-background ring-2 ring-muted/10">
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
    <div className="space-y-2.5 -mx-1">
      <CommunityDiscovery />
      <Section title="Popular this week" creators={popularThisWeek} />
      
      {topics.length > 0 && (
        <div className="space-y-3 py-1">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-extrabold tracking-tight text-foreground">Explore topics</h2>
          </div>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex w-max space-x-3 pb-4">
              {topics.map((topic, i) => (
                <Link
                  key={topic}
                  href={`/dashboard/discovery/${encodeURIComponent(topic)}`}
                  className="block flex-shrink-0"
                >
                  <div
                    style={{ background: topicColors[i % topicColors.length] }}
                    className="relative w-[130px] h-[130px] rounded-2xl overflow-hidden"
                  >
                    {/* subtle noise/shimmer overlay */}
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'20\' cy=\'20\' r=\'1\'/%3E%3C/g%3E%3C/svg%3E")', backgroundSize: '20px 20px' }} />
                    {/* title pinned to bottom-left */}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <span className="text-white text-[13px] font-bold leading-tight drop-shadow-sm line-clamp-2">
                        {topic}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="hidden" />
          </ScrollArea>
        </div>
      )}

      <Section title="New creators" creators={newCreators} />
      <Section title="Top creators" creators={topCreators} />
    </div>
  )
}
