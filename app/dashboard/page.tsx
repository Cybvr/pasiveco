'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Heart, MessageCircle, Send } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { formatSocialDate, getSocialPostById, getSocialPosts, getSocialProfileById, togglePostLike, type SocialPost } from '@/lib/social-data'

export default function DashboardHomePage() {
  const [posts, setPosts] = useState<SocialPost[]>([])

  useEffect(() => {
    setPosts(getSocialPosts())
  }, [])

  const handleLike = (event: React.MouseEvent<HTMLButtonElement>, postId: string) => {
    event.preventDefault()
    event.stopPropagation()
    const updatedPost = togglePostLike(postId)
    if (!updatedPost) return
    setPosts((currentPosts) =>
      currentPosts.map((post) => (post.id === postId ? updatedPost : post)),
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-3">
      {posts.map((post) => {
        const author = getSocialProfileById(post.authorId)
        if (!author) return null

        return (
          <Link
            key={post.id}
            href={`/dashboard/posts/${post.id}`}
            className="block rounded-2xl border bg-card p-4 transition-colors hover:bg-accent/40"
          >
            <article className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-11 w-11 border">
                  <AvatarImage src={author.image} alt={author.name} />
                  <AvatarFallback>{author.name.slice(0, 1)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="text-sm font-semibold">{author.name}</p>
                    <span className="text-xs text-muted-foreground">{author.handle}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{formatSocialDate(post.createdAt)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{author.category}</p>
                </div>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">{post.message}</p>

              <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={`h-8 gap-1.5 px-2 ${post.likedByMe ? 'text-primary' : ''}`}
                  onClick={(event) => handleLike(event, post.id)}
                >
                  <Heart className={`h-4 w-4 ${post.likedByMe ? 'fill-current' : ''}`} />
                  {getSocialPostById(post.id)?.likeCount ?? post.likeCount}
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
