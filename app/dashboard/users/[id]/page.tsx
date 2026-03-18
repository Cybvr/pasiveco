'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, MessageCircle } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatSocialDate, getSocialPostById, getSocialPosts, getSocialProfileById, type SocialPost } from '@/lib/social-data'

export default function DashboardUserProfilePage() {
  const params = useParams<{ id: string }>()
  const [posts, setPosts] = useState<SocialPost[]>([])

  useEffect(() => {
    if (!params?.id) return
    setPosts(getSocialPosts().filter((post) => post.authorId === params.id))
  }, [params])

  const profile = params?.id ? getSocialProfileById(params.id) : null

  if (!profile) {
    return <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">User not found.</div>
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Button asChild variant="ghost" className="w-fit px-0 hover:bg-transparent">
        <Link href="/dashboard/discovery">
          <ArrowLeft className="h-4 w-4" />
          Back to discovery
        </Link>
      </Button>

      <Card className="overflow-hidden rounded-3xl">
        <CardContent className="space-y-6 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border">
                <AvatarImage src={profile.image} alt={profile.name} />
                <AvatarFallback>{profile.name.slice(0, 1)}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-semibold">{profile.name}</h1>
                <p className="text-sm text-muted-foreground">{profile.handle} · {profile.category}</p>
                <p className="text-sm text-muted-foreground">{profile.location}</p>
              </div>
            </div>
            <Button asChild>
              <Link href={`/dashboard/messages?user=${profile.id}`}>
                <MessageCircle className="h-4 w-4" />
                Message
              </Link>
            </Button>
          </div>

          <p className="text-sm leading-6 text-muted-foreground">{profile.bio}</p>

          <Tabs defaultValue="links" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="links">Links</TabsTrigger>
              <TabsTrigger value="shop">Shop</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
            </TabsList>
            <TabsContent value="links" className="mt-4 space-y-3">
              {profile.links.map((link) => (
                <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className="block rounded-2xl border p-4 hover:bg-accent/40">
                  <p className="text-sm font-medium">{link.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{link.description}</p>
                </a>
              ))}
            </TabsContent>
            <TabsContent value="shop" className="mt-4 space-y-3">
              {profile.shop.map((item) => (
                <a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="block rounded-2xl border p-4 hover:bg-accent/40">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{item.name}</p>
                    <span className="text-sm font-semibold">{item.price}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                </a>
              ))}
            </TabsContent>
            <TabsContent value="posts" className="mt-4 space-y-3">
              {posts.map((post) => (
                <Link key={post.id} href={`/dashboard/posts/${post.id}`} className="block rounded-2xl border p-4 hover:bg-accent/40">
                  <p className="text-sm leading-6 text-foreground">{post.message}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{formatSocialDate(getSocialPostById(post.id)?.createdAt || post.createdAt)} · {post.likeCount} likes · {post.commentCount} comments</p>
                </Link>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
