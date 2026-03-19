'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Heart, MessageCircle, Send } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { addPostComment, formatSocialDate, getSocialPostById, getSocialProfileById, togglePostLike, type SocialPost, type SocialProfile } from '@/lib/social-data'

export default function DashboardPostPage() {
  const params = useParams<{ id: string }>()
  const [post, setPost] = useState<SocialPost | null>(null)
  const [author, setAuthor] = useState<SocialProfile | null>(null)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const loadPost = async () => {
      if (!params?.id) return

      try {
        const nextPost = await getSocialPostById(params.id)
        const nextAuthor = nextPost ? await getSocialProfileById(nextPost.authorId) : undefined
        if (!active) return
        setPost(nextPost || null)
        setAuthor(nextAuthor || null)
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadPost()

    return () => {
      active = false
    }
  }, [params])

  if (loading) {
    return <div className="mx-auto max-w-2xl rounded-2xl border bg-card p-6 text-sm text-muted-foreground">Loading post...</div>
  }

  if (!post || !author) {
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const updatedPost = await addPostComment(post.id, comment)
    setComment('')
    if (updatedPost) setPost(updatedPost)
  }

  const handleLike = async () => {
    const updatedPost = await togglePostLike(post.id)
    if (updatedPost) setPost(updatedPost)
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
            <AvatarImage src={author.image} alt={author.name} />
            <AvatarFallback>{author.name.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p className="text-sm font-semibold">{author.name}</p>
              <span className="text-xs text-muted-foreground">{author.handle}</span>
            </div>
            <p className="text-xs text-muted-foreground">{formatSocialDate(post.createdAt)}</p>
          </div>
        </div>

        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-foreground">{post.message}</p>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-y py-3 text-xs text-muted-foreground">
          <Button type="button" variant="ghost" size="sm" className={`h-8 gap-1.5 px-2 ${post.likedByMe ? 'text-primary' : ''}`} onClick={() => void handleLike()}>
            <Heart className={`h-4 w-4 ${post.likedByMe ? 'fill-current' : ''}`} />
            {post.likeCount}
          </Button>
          <span className="inline-flex items-center gap-1.5 px-2">
            <MessageCircle className="h-4 w-4" />
            {post.commentCount} comments
          </span>
          <Button asChild variant="ghost" size="sm" className="h-8 gap-1.5 px-2">
            <Link href={`/dashboard/messages?user=${author.id}`}>
              <Send className="h-4 w-4" />
              Message {author.name.split(' ')[0]}
            </Link>
          </Button>
        </div>

        <div className="mt-4 space-y-4">
          <form onSubmit={(event) => void handleSubmit(event)} className="flex items-center gap-2">
            <Input value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Add a comment..." />
            <Button type="submit" disabled={!comment.trim()}>Comment</Button>
          </form>

          <div className="space-y-3">
            {post.comments.map((item) => (
              <div key={item.id} className="flex items-start gap-3 rounded-xl bg-muted/40 p-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={item.authorImage} alt={item.authorName} />
                  <AvatarFallback>{item.authorName.slice(0, 1)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                    <span className="font-medium text-foreground">{item.authorName}</span>
                    <span className="text-muted-foreground">{item.authorHandle}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{formatSocialDate(item.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm text-foreground">{item.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </article>
    </div>
  )
}
