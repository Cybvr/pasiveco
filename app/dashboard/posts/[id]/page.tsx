'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { formatFeedPostDate, getFeedPostById, type FeedPost } from '@/lib/dashboard-feed'

export default function DashboardPostPage() {
  const params = useParams<{ id: string }>()
  const [post, setPost] = useState<FeedPost | null>(null)

  useEffect(() => {
    if (!params?.id) return
    setPost(getFeedPostById(params.id) || null)
  }, [params])

  if (!post) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <Button asChild variant="ghost" className="w-fit px-0 hover:bg-transparent">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
        <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">Post not found.</div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <Button asChild variant="ghost" className="w-fit px-0 hover:bg-transparent">
        <Link href="/dashboard">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </Button>

      <article className="rounded-2xl border bg-card p-5">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 border">
            <AvatarImage src={post.author.image} alt={post.author.name} />
            <AvatarFallback>{post.author.name.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p className="text-sm font-semibold">{post.author.name}</p>
              <span className="text-xs text-muted-foreground">{post.author.handle}</span>
            </div>
            <p className="text-xs text-muted-foreground">{formatFeedPostDate(post.createdAt)}</p>
          </div>
        </div>

        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-foreground">{post.message}</p>
      </article>
    </div>
  )
}
