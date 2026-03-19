'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, ExternalLink, Link as LinkIcon, MessageCircle } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getUserProfile, type UserProfile } from '@/services/userProfilesService'

const normalizeHandle = (username?: string) => {
  const cleanUsername = (username || '').replace(/^@/, '').trim()
  return cleanUsername ? `@${cleanUsername}` : '@user'
}

const sourceLabel = (profile: UserProfile | null) => {
  const cleanedSource = profile?.source?.trim()
  return cleanedSource || 'Pasive creator'
}

export default function DashboardUserProfilePage() {
  const params = useParams<{ id: string }>()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const loadProfile = async () => {
      if (!params?.id) return

      try {
        const profileData = await getUserProfile(params.id)
        if (!active) return
        setProfile(profileData || null)
      } catch (error) {
        console.error('Failed to load dashboard profile:', error)
        if (active) setProfile(null)
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadProfile()

    return () => {
      active = false
    }
  }, [params])

  const activeLinks = useMemo(
    () => profile?.links.filter((link) => link.active !== false && Boolean(link.url?.trim())) || [],
    [profile],
  )

  const activeSocialLinks = useMemo(
    () => profile?.socialLinks.filter((link) => link.active !== false && Boolean(link.url?.trim())) || [],
    [profile],
  )

  if (loading) {
    return <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">Loading user...</div>
  }

  if (!profile) {
    return <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">User not found.</div>
  }

  const displayName = profile.displayName || normalizeHandle(profile.username)
  const handle = normalizeHandle(profile.username)

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Button asChild variant="ghost" className="w-fit px-0 hover:bg-transparent">
        <Link href="/dashboard/discovery">
          <ArrowLeft className="h-4 w-4" />
          Back to discovery
        </Link>
      </Button>

      <Card className="overflow-hidden rounded-3xl">
        {profile.bannerImage ? (
          <div
            className="h-36 w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${profile.bannerImage})` }}
            aria-hidden="true"
          />
        ) : null}
        <CardContent className="space-y-6 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border">
                <AvatarImage src={profile.profilePicture || ''} alt={displayName} />
                <AvatarFallback>{displayName.slice(0, 1).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-semibold">{displayName}</h1>
                <p className="text-sm text-muted-foreground">{handle} · {sourceLabel(profile)}</p>
                <p className="text-sm text-muted-foreground">/{profile.slug || profile.username}</p>
              </div>
            </div>
            <Button asChild>
              <Link href={`/${profile.username.replace(/^@/, '')}`}>
                <MessageCircle className="h-4 w-4" />
                Open bio page
              </Link>
            </Button>
          </div>

          <p className="text-sm leading-6 text-muted-foreground">{profile.bio?.trim() || 'No bio added yet.'}</p>

          <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            <div className="rounded-2xl border p-4">
              <p className="text-xs uppercase tracking-wide">Public links</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{activeLinks.length}</p>
            </div>
            <div className="rounded-2xl border p-4">
              <p className="text-xs uppercase tracking-wide">Social profiles</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{activeSocialLinks.length}</p>
            </div>
            <div className="rounded-2xl border p-4">
              <p className="text-xs uppercase tracking-wide">Visibility</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{profile.isPublic === false ? 'Private' : 'Public'}</p>
            </div>
          </div>

          <Tabs defaultValue="links" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="links">Links</TabsTrigger>
              <TabsTrigger value="socials">Socials</TabsTrigger>
            </TabsList>
            <TabsContent value="links" className="mt-4 space-y-3">
              {activeLinks.length > 0 ? (
                activeLinks.map((link) => (
                  <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className="block rounded-2xl border p-4 hover:bg-accent/40">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{link.title}</p>
                        {link.description ? <p className="text-sm text-muted-foreground">{link.description}</p> : null}
                      </div>
                      <LinkIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    </div>
                  </a>
                ))
              ) : (
                <div className="rounded-2xl border p-4 text-sm text-muted-foreground">No public links yet.</div>
              )}
            </TabsContent>
            <TabsContent value="socials" className="mt-4 space-y-3">
              {activeSocialLinks.length > 0 ? (
                activeSocialLinks.map((item) => (
                  <a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="block rounded-2xl border p-4 hover:bg-accent/40">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{item.platform}</p>
                        <p className="text-sm text-muted-foreground">{item.url}</p>
                      </div>
                      <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </div>
                  </a>
                ))
              ) : (
                <div className="rounded-2xl border p-4 text-sm text-muted-foreground">No connected social profiles yet.</div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
