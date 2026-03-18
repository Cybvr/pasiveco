'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getAllFeedPosts, type FeedPost, formatFeedPostDate } from '@/lib/dashboard-feed'

export default function DashboardHomePage() {
  const [posts, setPosts] = useState<FeedPost[]>([])

  useEffect(() => {
    setPosts(getAllFeedPosts())
  }, [])

  return (
    <div className="mx-auto max-w-2xl space-y-3">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/dashboard/posts/${post.id}`}
          className="block rounded-2xl border bg-card p-4 transition-colors hover:bg-accent/40"
        >
          <article className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11 border">
                <AvatarImage src={post.author.image} alt={post.author.name} />
                <AvatarFallback>{post.author.name.slice(0, 1)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="text-sm font-semibold">{post.author.name}</p>
                  <span className="text-xs text-muted-foreground">{post.author.handle}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{formatFeedPostDate(post.createdAt)}</span>
                </div>
                {post.author.niche && (
                  <p className="text-xs text-muted-foreground">{post.author.niche}</p>
                )}
              </div>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">{post.message}</p>
          </article>
        </Link>
      ))}
    </div>
  )
}
