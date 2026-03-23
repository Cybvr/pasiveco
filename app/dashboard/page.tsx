'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Heart, Landmark, MessageCircle, Package, PackagePlus, Send } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { HomeSkeleton } from '@/app/common/dashboard/SocialLoading'
import { getDicebearAvatar } from '@/lib/avatar'
import DashboardDiscoverySections from './DashboardDiscoverySections'
import { getUserProducts, type Product } from '@/services/productsService'
import { getBankingDetails } from '@/services/bankingDetailsService'
import { useAuth } from '@/hooks/useAuth'
import {
  formatSocialRelativeTime,
  getSocialPosts,
  getSocialProfiles,
  togglePostLike,
  type SocialPost,
  type SocialProfile,
} from '@/lib/social-data'

export default function DashboardHomePage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [profiles, setProfiles] = useState<Record<string, SocialProfile>>({})
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [hasBankingDetails, setHasBankingDetails] = useState(true)

  useEffect(() => {
    let active = true

    const loadDashboard = async () => {
      try {
        const [postsData, profilesData, products, bankingDetails] = await Promise.all([
          getSocialPosts(),
          getSocialProfiles(),
          user?.uid ? getUserProducts(user.uid) : Promise.resolve([]),
          user?.uid ? getBankingDetails(user.uid) : Promise.resolve(null),
        ])

        if (!active) return

        setPosts(postsData)
        setProfiles(Object.fromEntries(profilesData.map((profile) => [profile.id, profile])))
        setProducts(products)
        setHasBankingDetails(Boolean(bankingDetails))
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadDashboard()

    return () => {
      active = false
    }
  }, [user])

  const hasPosts = useMemo(() => posts.length > 0, [posts])
  const hasProducts = useMemo(() => products.length > 0, [products])
  const featuredProducts = useMemo(() => products.slice(0, 4), [products])

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
    return <HomeSkeleton />
  }

  return (
    <div className="space-y-3">
      <section className="space-y-1.5 py-0">
        <div className="flex items-center justify-between gap-3 px-1">
          <h2 className="text-sm font-semibold text-foreground">Your products</h2>
          {hasProducts && (
            <Link href="/dashboard/products" className="text-xs font-semibold text-primary hover:underline">
              View all
            </Link>
          )}
        </div>

        {hasProducts ? (
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex w-max space-x-5 pb-4 px-1">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  href="/dashboard/products"
                  className="w-[170px] group"
                >
                  <div className="flex flex-col items-start gap-1">
                    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border-2 border-background ring-2 ring-muted/10 transition-all">
                      <img
                        src={product.thumbnail || getDicebearAvatar(product.id || product.name)}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500"
                      />
                    </div>
                    <div className="w-full space-y-0 text-left">
                      <p className="line-clamp-2 text-[13px] font-semibold leading-tight text-foreground">{product.name}</p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {new Intl.NumberFormat(undefined, {
                          style: 'currency',
                          currency: product.currency || 'USD',
                          maximumFractionDigits: 2,
                        }).format(product.price || 0)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="hidden" />
          </ScrollArea>
        ) : (
          <div className="flex flex-wrap items-center gap-2 px-1 pb-2">
            <Button asChild size="sm" className="gap-1.5 rounded-full">
              <Link href="/dashboard/products?new=1">
                <PackagePlus className="h-3.5 w-3.5" />
                Add product
              </Link>
            </Button>
            {!hasBankingDetails && (
              <Button asChild size="sm" variant="outline" className="gap-1.5 rounded-full">
                <Link href="/dashboard/settings/banking-details">
                  <Landmark className="h-3.5 w-3.5" />
                  Add banking details
                </Link>
              </Button>
            )}
          </div>
        )}
      </section>

      <DashboardDiscoverySections isHome={true} />

      {hasPosts ? (
        <section className="space-y-2 py-0">
          <div className="flex items-center justify-between gap-3 px-1">
            <h2 className="text-sm font-semibold text-foreground">Post feed</h2>
          </div>

          <div className="space-y-2">
          {posts.map((post) => {
            const author = profiles[post.authorId]
            if (!author) return null

            return (
              <Link
                key={post.id}
                href={`/dashboard/posts/${post.id}`}
                className="block rounded-2xl border bg-card p-2.5"
              >
                <article className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 border">
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
                  <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-foreground">{post.message}</p>

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
        </section>
      ) : (
        <div className="rounded-2xl border bg-card p-4 text-sm text-muted-foreground">No posts found.</div>
      )}
    </div>
  )
}
