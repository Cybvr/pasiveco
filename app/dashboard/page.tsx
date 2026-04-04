'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, Plus } from 'lucide-react'
import {
  RiShoppingBag3Fill,
  RiShareForwardFill,
  RiWallet3Fill,
  RiUser3Fill,
  RiTeamFill,
  RiSettings4Fill
} from 'react-icons/ri'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { HomeSkeleton } from '@/app/common/dashboard/SocialLoading'
import { getDisplayAvatar, getDicebearAvatar } from '@/lib/avatar'
import { getUserProducts, type Product } from '@/services/productsService'
import { getBankingDetails } from '@/services/bankingDetailsService'
import { getSellerTransactions, getAffiliateTransactions } from '@/services/transactionsService'
import { useAuth } from '@/hooks/useAuth'

import { useCurrency } from '@/context/CurrencyContext'
import { formatCurrency, EXCHANGE_RATE } from '@/utils/currency'
import { getAllCommunities } from '@/services/communityService'
import { Community } from '@/types/community'
import { getUser, type User as AppUser } from '@/services/userService'
import { Transaction } from '@/types/transaction'
import StarRating from '@/components/products/StarRating'
import ProfileCompletionCard from '@/components/dashboard/ProfileCompletionCard'
import InviteCard from '@/components/dashboard/InviteCard'
import { checkAndQualifyReferral } from '@/services/referralService'

const CARD_W = 'w-[200px]'

export default function DashboardHomePage() {
  const { user, loading: authLoading } = useAuth()
  const { currency } = useCurrency()

  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [hasBankingDetails, setHasBankingDetails] = useState(true)
  const [sellerTransactions, setSellerTransactions] = useState<Transaction[]>([])
  const [affiliateTransactions, setAffiliateTransactions] = useState<Transaction[]>([])

  const [communities, setCommunities] = useState<Community[]>([])
  const [communitiesLoading, setCommunitiesLoading] = useState(true)
  const [communityCreators, setCommunityCreators] = useState<Record<string, AppUser | null>>({})

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const [userProducts, bankingDetails, sellerTx, affiliateTx] = await Promise.all([
          user?.uid ? getUserProducts(user.uid) : Promise.resolve([]),
          user?.uid ? getBankingDetails(user.uid) : Promise.resolve(null),
          user?.uid ? getSellerTransactions(user.uid) : Promise.resolve([]),
          user?.uid ? getAffiliateTransactions(user.uid) : Promise.resolve([]),
        ])
        if (!active) return
        setProducts(userProducts)
        setHasBankingDetails(Boolean(bankingDetails))
        setSellerTransactions(sellerTx)
        setAffiliateTransactions(affiliateTx)
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [user])

  // ── Auto-qualify referral when this user finishes their own 4 steps ──────────
  useEffect(() => {
    if (!user?.uid || loading) return
    const u = user as any
    const allFourDone =
      Boolean(u?.profilePicture || u?.photoURL) &&
      Boolean(u?.phoneNumber) &&
      products.length > 0 &&
      hasBankingDetails
    // Fire-and-forget: only writes to Firestore if status isn't already 'qualified'
    checkAndQualifyReferral(user.uid, allFourDone).catch(console.warn)
  }, [user, products, hasBankingDetails, loading])
  // ─────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    getAllCommunities()
      .then((data) => setCommunities(data || []))
      .catch(() => { })
      .finally(() => setCommunitiesLoading(false))
  }, [])

  useEffect(() => {
    let active = true

    const loadCommunityCreators = async () => {
      const creatorIds = [...new Set(communities.map((community) => community.creatorId).filter(Boolean))]
      if (creatorIds.length === 0) {
        if (active) setCommunityCreators({})
        return
      }

      try {
        const profiles = await Promise.all(
          creatorIds.map((creatorId) => getUser(creatorId).catch(() => null))
        )

        if (!active) return

        const nextCreators = creatorIds.reduce<Record<string, AppUser | null>>((acc, creatorId, index) => {
          acc[creatorId] = profiles[index]
          return acc
        }, {})

        setCommunityCreators(nextCreators)
      } catch (error) {
        console.error('Error loading community creator avatars:', error)
      }
    }

    void loadCommunityCreators()

    return () => {
      active = false
    }
  }, [communities])

  const hasProducts = useMemo(() => products.length > 0, [products])
  const featuredProducts = useMemo(() => products.slice(0, 4), [products])
  const earningsSummary = useMemo(() => {
    const allTransactions = [...sellerTransactions, ...affiliateTransactions]
    const successfulTransactions = allTransactions.filter((tx) => tx.status === 'success')
    const displayCurrency = currency.toUpperCase()

    const convertAmount = (amountValue: number, sourceCurrency?: string) => {
      const sourceCurrencyCode = (sourceCurrency || "NGN").toUpperCase()

      if (sourceCurrencyCode === displayCurrency) return amountValue
      if (sourceCurrencyCode === "NGN" && displayCurrency === "USD") return amountValue / EXCHANGE_RATE
      if (sourceCurrencyCode === "USD" && displayCurrency === "NGN") return amountValue * EXCHANGE_RATE
      return amountValue
    }

    return {
      availableBalance: successfulTransactions
        .filter((tx) => !tx.payoutDate)
        .reduce((sum, tx) => sum + convertAmount(tx.yourProfit || tx.amount || 0, tx.currency), 0),
    }
  }, [affiliateTransactions, currency, sellerTransactions])

  if (loading || authLoading) return <HomeSkeleton />

  return (
    <div className="space-y-6">
      <section className="px-1 flex flex-col md:flex-row gap-4 items-stretch">
        <ProfileCompletionCard
          user={user}
          hasBankingDetails={hasBankingDetails}
          productsLength={products.length}
          availableBalance={earningsSummary.availableBalance}
          currency={currency}
        />

        <div className="flex-1 flex flex-col gap-4">
          <Link
            href="/dashboard/earnings"
            className="flex items-start justify-between gap-4 rounded-2xl border border-border/60 bg-card px-4 py-4 transition-colors hover:bg-muted/20"
          >
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Earnings balance
              </p>
              <p className="text-2xl font-semibold tracking-tight text-foreground">
                {formatCurrency(earningsSummary.availableBalance, currency)}
              </p>
            </div>
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/60 text-muted-foreground">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </Link>
          <InviteCard
            userId={user?.uid || ''}
            username={((user as any)?.username || (user as any)?.slug || user?.email?.split('@')[0])?.replace(/^@/, '')?.trim()}
            currency={currency}
          />
          <Link
            href="/dashboard/network"
            className="group block w-full rounded-2xl border border-border/60 bg-card overflow-hidden transition-all hover:bg-muted/5 active:scale-[0.99]"
          >
            <div className="flex items-center justify-between p-4 sm:p-5 gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <RiShareForwardFill className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-foreground">Promote & Earn</h3>
                    <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold px-2 py-0 rounded-full h-4">
                      50% Comm.
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-snug max-w-[280px] sm:max-w-md">
                    Join our affiliate network and earn high commissions by promoting top products.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-muted/40 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ── Quick Links Grid ───────────────────────────── */}
      <section className="px-1 md:hidden">
        <div className="grid grid-cols-3 gap-2">
          {[
            { name: 'Products', href: '/dashboard/products', icon: RiShoppingBag3Fill },
            { name: 'Network', href: '/dashboard/network', icon: RiShareForwardFill },
            { name: 'Earnings', href: '/dashboard/earnings', icon: RiWallet3Fill },
            { name: 'Customers', href: '/dashboard/customers', icon: RiUser3Fill },
            { name: 'Spaces', href: '/dashboard/communities', icon: RiTeamFill },
            { name: 'Customize', href: '/dashboard/settings', icon: RiSettings4Fill },
          ].map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-2xl bg-card px-2 py-3 text-center transition-colors hover:bg-muted/20"
              >
                <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[11px] font-medium leading-tight text-foreground">{link.name}</span>
              </Link>
            )
          })}
        </div>
      </section>

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
                  <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border/60 bg-muted">
                    <img
                      src={product.thumbnail || getDicebearAvatar(product.id || product.name)}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="text-left">
                    <p className="truncate text-sm font-semibold text-foreground leading-tight">{product.name}</p>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs text-muted-foreground">
                        {new Intl.NumberFormat(undefined, {
                          style: 'currency',
                          currency: product.currency || 'USD',
                          maximumFractionDigits: 2,
                        }).format(product.price || 0)}
                      </p>
                      <StarRating rating={product.rating} count={product.reviewsCount} className="scale-90 origin-right" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="hidden" />
          </ScrollArea>
        ) : (
          <div className="rounded-2xl border border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground mx-1">
            No products yet. Add your first product to see it here.
          </div>
        )}
      </section>

      {/* ── Trending Communities ─────────────────────── */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold text-foreground">Trending Spaces</h2>
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
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : communities.length === 0 ? (
          <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10 mx-1">
            <div className="space-y-0.5">
              <p className="text-sm font-bold">No Spaces yet</p>
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
              {communities.slice(0, 8).map((community) => {
                const creator = communityCreators[community.creatorId]
                const creatorAvatar = getDisplayAvatar({
                  image: creator?.profilePicture || creator?.photoURL || '',
                  displayName: creator?.displayName || community.creatorName || community.name,
                  handle: creator?.username || creator?.slug || community.creatorId || community.name,
                })

                return (
                  <Link
                    key={community.id}
                    href={`/dashboard/communities/${community.slug || community.id}`}
                    className={`${CARD_W} group flex flex-col gap-2`}
                  >
                    <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border/60 bg-muted">
                      <img
                        src={community.image || getDicebearAvatar(community.id || community.name)}
                        alt={community.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => { e.currentTarget.src = getDicebearAvatar(community.id || community.name) }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6 shrink-0">
                        <AvatarImage src={creatorAvatar} />
                        <AvatarFallback className="text-[10px]">{community.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground leading-tight">{community.name}</p>
                        <div className="flex items-center justify-between mt-0.5">
                          <p className="text-xs text-muted-foreground">{community.memberCount} members</p>
                          <StarRating rating={community.rating} count={community.reviewsCount} className="scale-90 origin-right" />
                        </div>
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
