'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Heart, MessageCircle, Send } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { FeedSkeleton } from '@/app/common/dashboard/SocialLoading'
import { formatSocialRelativeTime, getSocialPosts, getSocialProfiles, togglePostLike, type SocialPost, type SocialProfile } from '@/lib/social-data'

export default function DashboardHomePage() {
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [profiles, setProfiles] = useState<Record<string, SocialProfile>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const loadFeed = async () => {
      try {
        const [postsData, profilesData] = await Promise.all([getSocialPosts(), getSocialProfiles()])
        if (!active) return

        setPosts(postsData)
        setProfiles(Object.fromEntries(profilesData.map((profile) => [profile.id, profile])))
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadFeed()

    return () => {
      active = false
    }
  }, [])

  const hasPosts = useMemo(() => posts.length > 0, [posts])

  const handleLike = async (event: React.MouseEvent<HTMLButtonElement>, postId: string) => {
    event.preventDefault()
    event.stopPropagation()
    const updatedPost = await togglePostLike(postId)
    if (!updatedPost) return
    setPosts((currentPosts) =>
      currentPosts.map((post) => (post.id === postId ? updatedPost : post)),
    )
  }

  if (loading) {
    return <FeedSkeleton />
  }

  if (!hasPosts) {
    return <div className="mx-auto max-w-2xl rounded-2xl border bg-card p-4 text-sm text-muted-foreground">No posts found.</div>
  }

  return (
    <div className="mx-auto max-w-2xl space-y-3">
      {posts.map((post) => {
        const author = profiles[post.authorId]
        if (!author) return null

        return (
          <Link
            key={post.id}
            href={`/dashboard/posts/${post.id}`}
            className="block rounded-2xl border bg-card p-3 transition-colors hover:bg-accent/40"
          >
            <article className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <Avatar className="h-10 w-10 border">
                  <AvatarImage src={author.image} alt={author.name} />
                  <AvatarFallback>{author.name.slice(0, 1)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="text-sm font-semibold">{author.handle}</p>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{formatSocialRelativeTime(post.createdAt)}</span>
                  </div>
                </div>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-5 text-foreground">{post.message}</p>

              <div className="flex items-center gap-2 pt-0.5 text-xs text-muted-foreground">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={`h-8 gap-1.5 px-2 ${post.likedByMe ? 'text-primary' : ''}`}
                  onClick={(event) => void handleLike(event, post.id)}
                >
                  <Heart className={`h-4 w-4 ${post.likedByMe ? 'fill-current' : ''}`} />
                  {post.likeCount}
                </Button>
                <span className="inline-flex items-center gap-1.5 px-2">
                  <MessageCircle className="h-4 w-4" />
                  {post.commentCount}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2">
                  <Send className="h-4 w-4" />
                  Message
                </span>
              </div>
            </article>
          </Link>
        )
      })}
    </div>
  )
}
