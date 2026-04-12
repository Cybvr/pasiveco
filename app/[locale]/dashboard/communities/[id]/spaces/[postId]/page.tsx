"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Loader2, MessageSquare } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getCommunity, getCommunityBySlug } from "@/services/communityService"
import { getCommunityPosts, getPostById, type Post } from "@/services/postService"
import { type Community } from "@/types/community"

export default function CommunityPostPage() {
  const params = useParams<{ id: string; postId: string }>()
  const router = useRouter()
  const [community, setCommunity] = useState<Community | null>(null)
  const [focusPost, setFocusPost] = useState<Post | null>(null)
  const [threadRoot, setThreadRoot] = useState<Post | null>(null)
  const [replies, setReplies] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const loadThread = async () => {
      if (!params?.id || !params?.postId) return

      try {
        let resolvedCommunity = await getCommunityBySlug(params.id)
        if (!resolvedCommunity) {
          resolvedCommunity = await getCommunity(params.id)
        }

        if (!resolvedCommunity) {
          router.push("/dashboard/communities")
          return
        }

        const targetPost = await getPostById(params.postId)
        if (!targetPost || targetPost.communityId !== resolvedCommunity.id) {
          if (active) {
            setCommunity(resolvedCommunity)
            setFocusPost(null)
            setThreadRoot(null)
            setReplies([])
          }
          return
        }

        const posts = await getCommunityPosts(resolvedCommunity.id)
        const rootPost = targetPost.parentId
          ? posts.find((post) => post.id === targetPost.parentId) || targetPost
          : targetPost
        const threadReplies = posts
          .filter((post) => post.parentId === rootPost.id)
          .sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis())

        if (!active) return

        setCommunity(resolvedCommunity)
        setFocusPost(targetPost)
        setThreadRoot(rootPost)
        setReplies(threadReplies)
      } catch (error) {
        console.error("Error loading community post:", error)
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadThread()

    return () => {
      active = false
    }
  }, [params, router])

  const getAuthorHref = (post: Pick<Post, "authorUsername" | "authorSlug">) => {
    const handle = (post.authorUsername || post.authorSlug || "").replace(/^@/, "").trim()
    return handle ? `/${handle}` : null
  }

  const renderPost = (post: Post, emphasized = false) => {
    const authorHref = getAuthorHref(post)
    const isReplyTarget = focusPost?.id === post.id && post.id !== threadRoot?.id

    return (
      <div
        key={post.id}
        className={`rounded-xl border bg-card p-4 ${emphasized ? "border-primary/30 shadow-sm" : "border-border/50"} ${isReplyTarget ? "ring-1 ring-primary/30" : ""}`}
      >
        <div className="flex items-start gap-3">
          {authorHref ? (
            <Link href={authorHref} className="shrink-0">
              <Avatar className="h-10 w-10 border border-border/60 transition-opacity hover:opacity-80">
                <AvatarImage src={post.authorImage} />
                <AvatarFallback className="bg-muted font-semibold text-primary">
                  {post.authorName?.[0] || post.authorUsername?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Avatar className="h-10 w-10 border border-border/60">
              <AvatarImage src={post.authorImage} />
              <AvatarFallback className="bg-muted font-semibold text-primary">
                {post.authorName?.[0] || post.authorUsername?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
          )}

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {authorHref ? (
                <Link href={authorHref} className="text-sm font-semibold hover:underline">
                  {post.authorName || `@${post.authorUsername}`}
                </Link>
              ) : (
                <span className="text-sm font-semibold">
                  {post.authorName || `@${post.authorUsername}`}
                </span>
              )}
              {post.authorUsername && (
                <span className="text-xs text-muted-foreground">
                  @{post.authorUsername.replace(/^@/, "")}
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true })}
              </span>
              {focusPost?.id === post.id && (
                <Badge variant="secondary" className="h-5 px-2 text-[10px] uppercase tracking-wide">
                  {post.parentId ? "Reply" : "Post"}
                </Badge>
              )}
            </div>

            <div className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/90">
              {post.message}
            </div>

            {post.mediaUrl && (
              <div className="overflow-hidden rounded-lg border border-border/40 max-w-xl">
                <img src={post.mediaUrl} alt="Shared media" className="h-auto max-h-[420px] w-full object-contain" />
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center py-16">
        <Loader2 className="mb-3 h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading thread...</p>
      </div>
    )
  }

  if (!community || !focusPost || !threadRoot) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 py-8">
        <Button variant="ghost" size="sm" asChild className="px-0">
          <Link href="/dashboard/communities" className="inline-flex items-center gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to spaces
          </Link>
        </Button>
        <div className="rounded-xl border border-dashed border-border/50 bg-card/40 px-6 py-12 text-center">
          <p className="text-sm font-medium">Post not found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-4">
      <div className="space-y-3">
        <Button variant="ghost" size="sm" asChild className="px-0">
          <Link
            href={`/dashboard/communities/${community.slug || community.id}`}
            className="inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to {community.name}
          </Link>
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-wide">
            {community.name}
          </Badge>
          <span className="text-xs text-muted-foreground">Thread view</span>
        </div>
      </div>

      {renderPost(threadRoot, true)}

      <section className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          Replies
          <span className="text-muted-foreground">{replies.length}</span>
        </div>

        {replies.length > 0 ? (
          <div className="space-y-3">
            {replies.map((reply) => renderPost(reply))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border/50 bg-card/40 px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">No replies yet.</p>
          </div>
        )}
      </section>
    </div>
  )
}
