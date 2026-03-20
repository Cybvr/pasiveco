'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Heart, MessageCircle, Send } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
    return () => { active = false }
  }, [params])

  if (loading) {
    return <div className="mx-auto max-w-xl py-8 text-sm text-muted-foreground">Loading...</div>
  }

  if (!post || !author) {
    return (
      <div className="mx-auto max-w-xl space-y-4 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>
        <p className="text-sm text-muted-foreground">Post not found.</p>
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

  const authorHref = `/${author.username || author.handle.replace(/^@/, '')}`

  return (
    <div className="mx-auto max-w-xl space-y-6 py-2">

      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </Link>

      <article className="space-y-5">

        {/* Author */}
        <div className="flex items-center gap-3">
          <Link href={authorHref}>
            <Avatar className="h-10 w-10 transition-opacity hover:opacity-80">
              <AvatarImage src={author.image} alt={author.name} />
              <AvatarFallback>{author.name.slice(0, 1)}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Link href={authorHref} className="text-sm font-medium hover:underline">{author.name}</Link>
              <Link href={authorHref} className="text-xs text-muted-foreground hover:underline">{author.handle}</Link>
            </div>
            <p className="text-xs text-muted-foreground">{formatSocialDate(post.createdAt)}</p>
          </div>
        </div>

        {/* Post body */}
        <p className="whitespace-pre-wrap text-sm leading-7">{post.message}</p>

        {/* Actions */}
        <div className="flex items-center gap-1 border-y py-2.5 text-sm text-muted-foreground">
          <button
            type="button"
            onClick={() => void handleLike()}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition-colors hover:text-foreground ${post.likedByMe ? 'text-primary' : ''}`}
          >
            <Heart className={`h-4 w-4 ${post.likedByMe ? 'fill-current' : ''}`} />
            {post.likeCount}
          </button>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5">
            <MessageCircle className="h-4 w-4" />
            {post.commentCount}
          </span>

          <Link
            href={`/dashboard/messages?user=${author.id}`}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition-colors hover:text-foreground"
          >
            <Send className="h-4 w-4" />
            Message {author.name.split(' ')[0]}
          </Link>
        </div>

        {/* Comment input */}
        <form onSubmit={(event) => void handleSubmit(event)} className="flex items-center gap-2">
          <Input
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Add a comment..."
            className="h-9"
          />
          <button
            type="submit"
            disabled={!comment.trim()}
            className="shrink-0 text-sm font-medium text-primary disabled:opacity-40 transition-opacity hover:opacity-70"
          >
            Post
          </button>
        </form>

        {/* Comments */}
        {post.comments.length > 0 && (
          <div className="divide-y">
            {post.comments.map((item) => (
              <div key={item.id} className="flex items-start gap-3 py-4">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={item.authorImage} alt={item.authorName} />
                  <AvatarFallback>{item.authorName.slice(0, 1)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{item.authorName}</span>
                    <span>{item.authorHandle}</span>
                    <span>·</span>
                    <span>{formatSocialDate(item.createdAt)}</span>
                  </div>
                  <p className="text-sm leading-relaxed">{item.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}

      </article>
    </div>
  )
}