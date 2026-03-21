'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { getDisplayAvatar } from '@/lib/avatar'
import { getPublicUsers, type User } from '@/services/userService'

interface DiscoveryProfile {
  id: string
  handle: string
  image: string
  href: string
  category: string
  bio: string
}

const sanitizeHandle = (username?: string) => username?.replace(/^@/, '').trim() || ''

const toDiscoveryProfile = (profile: User): DiscoveryProfile => {
  const cleanHandle = sanitizeHandle(profile.username || profile.slug || profile.email?.split('@')[0])
  const displayName = profile.displayName?.trim() || cleanHandle || 'User'
  const userId = profile.userId || profile.id || ''
  const publicPath = cleanHandle ? `/${cleanHandle}` : '/'

  return {
    id: userId,
    handle: cleanHandle,
    image: getDisplayAvatar({
      image: profile.profilePicture || profile.photoURL || '',
      displayName,
      handle: cleanHandle || profile.email || profile.id || 'user',
    }),
    href: publicPath,
    category: profile.category || '',
    bio: profile.bio || '',
  }
}

const normalizeCategory = (value: string) => decodeURIComponent(value).trim().toLowerCase()

export default function DiscoveryCategoryPage() {
  const params = useParams<{ category: string }>()
  const [users, setUsers] = useState<DiscoveryProfile[]>([])
  const [loading, setLoading] = useState(true)

  const categorySlug = typeof params?.category === 'string' ? params.category : ''
  const categoryName = decodeURIComponent(categorySlug)

  useEffect(() => {
    let active = true

    const loadUsers = async () => {
      try {
        const profiles = await getPublicUsers()
        if (!active) return

        setUsers(profiles.map(toDiscoveryProfile).filter((profile) => Boolean(profile.id)))
      } catch (error) {
        console.error('Failed to load discovery category profiles:', error)
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadUsers()

    return () => {
      active = false
    }
  }, [])

  const filteredUsers = useMemo(
    () => users.filter((user) => normalizeCategory(user.category) === normalizeCategory(categorySlug)),
    [categorySlug, users]
  )

  if (loading) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <Link href="/dashboard/discovery" className="transition-colors hover:text-foreground">
                Discovery
              </Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{categoryName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{categoryName}</h1>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-sm text-muted-foreground">No creators found in this category.</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {filteredUsers.map((creator) => (
            <Link key={creator.id} href={creator.href}>
              <div className="flex flex-col items-start gap-3">
                <div className="relative aspect-square w-full overflow-hidden rounded-2xl border-2 border-background ring-2 ring-muted/10">
                  <Avatar className="h-full w-full rounded-none">
                    <AvatarImage src={creator.image} alt={creator.handle} className="object-cover" />
                    <AvatarFallback className="text-2xl font-bold rounded-none">
                      {creator.handle.slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="w-full space-y-1 text-left">
                  <p className="truncate text-[13px] font-bold leading-tight text-foreground">@{creator.handle}</p>
                  {creator.bio && (
                    <p className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground/70">
                      {creator.bio}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
