'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, CheckCircle2, Landmark, PackagePlus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { HomeSkeleton } from '@/app/common/dashboard/SocialLoading'
import { getDicebearAvatar } from '@/lib/avatar'
import { getUserProducts, getAllLatestProducts, type Product } from '@/services/productsService'
import { getBankingDetails } from '@/services/bankingDetailsService'
import { useAuth } from '@/hooks/useAuth'
import { useCurrency } from '@/context/CurrencyContext'
import { formatCurrency, EXCHANGE_RATE } from '@/utils/currency'
import { getAllCommunities } from '@/services/communityService'
import { Community } from '@/types/community'

// Reusable standard card width for all horizontal scroll rows
const CARD_W = 'w-[200px]'

export default function DashboardHomePage() {
  const { user } = useAuth()
  const { currency } = useCurrency()

  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [hasBankingDetails, setHasBankingDetails] = useState(true)

  const [affiliateProducts, setAffiliateProducts] = useState<Product[]>([])
  const [affiliateLoading, setAffiliateLoading] = useState(true)

  const [communities, setCommunities] = useState<Community[]>([])
  const [communitiesLoading, setCommunitiesLoading] = useState(true)

  // Load user products + banking
  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const [userProducts, bankingDetails] = await Promise.all([
          user?.uid ? getUserProducts(user.uid) : Promise.resolve([]),
          user?.uid ? getBankingDetails(user.uid) : Promise.resolve(null),
        ])
        if (!active) return
        setProducts(userProducts)
        setHasBankingDetails(Boolean(bankingDetails))
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [user])

  // Load affiliate products
  useEffect(() => {
    getAllLatestProducts(8)
      .then((data) => setAffiliateProducts(data || []))
      .catch(() => {})
      .finally(() => setAffiliateLoading(false))
  }, [])

  // Load communities
  useEffect(() => {
    getAllCommunities()
      .then((data) => setCommunities(data || []))
      .catch(() => {})
      .finally(() => setCommunitiesLoading(false))
  }, [])

  const hasProducts = useMemo(() => products.length > 0, [products])
  const featuredProducts = useMemo(() => products.slice(0, 4), [products])

  const formatPrice = (amount: number, prodCurrency = 'USD') => {
    const displayAmount = currency === 'NGN' && prodCurrency === 'USD'
      ? amount * EXCHANGE_RATE
      : amount
    return formatCurrency(displayAmount, currency)
  }

  if (loading) return <HomeSkeleton />

  return (
    <div className="space-y-6">

      {/* ── Your products ───────────────────────────── */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold text-foreground">Your products</h2>
          {hasProducts && (
            <Link href="/dashboard/products" className="text-xs font-semibold text-primary hover:underline">
              View all
            </Link>
          )}
        </div>

        {hasProducts ? (
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex w-max gap-4 pb-4 px-1">
              {featuredProducts.map((product) => (
                <Link key={product.id} href="/dashboard/products" className={`${CARD_W} group flex flex-col gap-2`}>
                  <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border/60 bg-muted">
                    <img
                      src={product.thumbnail || getDicebearAvatar(product.id || product.name)}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="text-left">
                    <p className="line-clamp-1 text-sm font-semibold text-foreground leading-tight">{product.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Intl.NumberFormat(undefined, {
                        style: 'currency',
                        currency: product.currency || 'USD',
                        maximumFractionDigits: 2,
                      }).format(product.price || 0)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="hidden" />
          </ScrollArea>
        ) : (
          <div className="flex flex-wrap items-center gap-2 px-1">
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

      {/* ── Trending Communities ─────────────────────── */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold text-foreground">Trending Communities</h2>
          <Link href="/dashboard/communities" className="text-xs font-semibold text-primary hover:underline">
            View all
          </Link>
        </div>

        {communitiesLoading ? (
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex w-max gap-4 pb-4 px-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`${CARD_W} flex flex-col gap-2`}>
                  <Skeleton className="aspect-video w-full rounded-2xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3.5 w-1/3" />
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : communities.length === 0 ? (
          <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10 mx-1">
            <div className="space-y-0.5">
              <p className="text-sm font-bold">No Communities yet</p>
              <p className="text-xs text-muted-foreground">Be the first to create one.</p>
            </div>
            <Button asChild size="sm" variant="secondary" className="h-8 rounded-full text-xs font-bold gap-1.5">
              <Link href="/dashboard/communities/create">
                <Plus className="h-3 w-3" />
                Create
              </Link>
            </Button>
          </div>
        ) : (
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex w-max gap-4 pb-4 px-1">
              {communities.slice(0, 8).map((community) => (
                <Link
                  key={community.id}
                  href={`/dashboard/communities/${community.slug || community.id}`}
                  className={`${CARD_W} group flex flex-col gap-2`}
                >
                  <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border/60 bg-muted">
                    <img
                      src={community.image || getDicebearAvatar(community.id || community.name)}
                      alt={community.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => { e.currentTarget.src = getDicebearAvatar(community.id || community.name) }}
                    />
                  </div>
                  <div className="text-left">
                    <p className="line-clamp-1 text-sm font-semibold text-foreground leading-tight">{community.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{community.memberCount} members</p>
                  </div>
                </Link>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="hidden" />
          </ScrollArea>
        )}
      </section>

      {/* ── Affiliate Network ────────────────────────── */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground">Affiliate Network</h2>
            <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Earn up to 50%
            </Badge>
          </div>
          <Link href="/dashboard/network" className="text-xs font-semibold text-primary hover:underline">
            View all
          </Link>
        </div>

        {affiliateLoading ? (
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex w-max gap-4 pb-4 px-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`${CARD_W} flex flex-col gap-2`}>
                  <Skeleton className="aspect-video w-full rounded-2xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3.5 w-1/2" />
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : affiliateProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground mx-1">
            No affiliate products yet. Check back soon!
          </div>
        ) : (
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex w-max gap-4 pb-4 px-1">
              {affiliateProducts.map((p) => {
                const commission = Math.floor(Math.random() * 40) + 10
                return (
                  <Link
                    key={p.id}
                    href="/dashboard/network"
                    className={`${CARD_W} group flex flex-col gap-2`}
                  >
                    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border/60 bg-muted">
                      <img
                        src={p.thumbnail || getDicebearAvatar(p.id || p.name)}
                        alt={p.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-zinc-950/80 backdrop-blur-md text-white border-none px-2 py-0.5 text-[10px] font-bold rounded-md">
                          {commission}% Commission
                        </Badge>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="text-[10px] uppercase tracking-widest text-primary font-bold">In Demand</span>
                        <CheckCircle2 className="h-2.5 w-2.5 text-primary" />
                      </div>
                      <p className="line-clamp-1 text-sm font-semibold text-foreground leading-tight">{p.name}</p>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-xs text-muted-foreground">{formatPrice(p.price, p.currency)}</p>
                        <p className="text-xs font-bold text-primary">+{formatPrice(p.price * (commission / 100), p.currency)}</p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
            <ScrollBar orientation="horizontal" className="hidden" />
          </ScrollArea>
        )}
      </section>

    </div>
  )
}
