'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, Landmark, PackagePlus, Plus } from 'lucide-react'
import { 
  RiShoppingBag3Fill, 
  RiShareForwardFill, 
  RiWallet3Fill, 
  RiUser3Fill, 
  RiBarChart2Fill, 
  RiTeamFill, 
  RiSettings4Fill 
} from 'react-icons/ri'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { getUser } from '@/services/userService'
import { getAffiliateTransactions, getSellerTransactions } from '@/services/transactionsService'
import { Transaction } from '@/types/transaction'

type NetworkProduct = Product & { sellerHandle?: string }

const CARD_W = 'w-[200px]'

export default function DashboardHomePage() {
  const { user } = useAuth()
  const { currency } = useCurrency()

  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [hasBankingDetails, setHasBankingDetails] = useState(true)
  const [sellerTransactions, setSellerTransactions] = useState<Transaction[]>([])
  const [affiliateTransactions, setAffiliateTransactions] = useState<Transaction[]>([])

  const [affiliateProducts, setAffiliateProducts] = useState<NetworkProduct[]>([])
  const [affiliateLoading, setAffiliateLoading] = useState(true)

  const [communities, setCommunities] = useState<Community[]>([])
  const [communitiesLoading, setCommunitiesLoading] = useState(true)

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

  useEffect(() => {
    async function loadAffiliate() {
      try {
        const data = await getAllLatestProducts(8)
        if (!data) return

        const userIds = [...new Set(data.map(p => p.userId))]
        const userDocs = await Promise.all(
          userIds.map(id => getUser(id).catch(() => null))
        )
        const userMap = new Map(userDocs.filter(Boolean).map(u => [u?.userId || u?.id, u]))

        const enriched = data.map(p => {
          const seller = userMap.get(p.userId)
          const handle = (seller?.username || seller?.slug || "shop").replace(/^@/, '')
          return { ...p, sellerHandle: handle }
        })

        setAffiliateProducts(enriched)
      } catch (err) {
        console.error(err)
      } finally {
        setAffiliateLoading(false)
      }
    }
    void loadAffiliate()
  }, [])

  useEffect(() => {
    getAllCommunities()
      .then((data) => setCommunities(data || []))
      .catch(() => { })
      .finally(() => setCommunitiesLoading(false))
  }, [])

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

  const formatPrice = (amount: number, prodCurrency = 'USD') => {
    const displayAmount = currency === 'NGN' && prodCurrency === 'USD'
      ? amount * EXCHANGE_RATE
      : amount
    return formatCurrency(displayAmount, currency)
  }

  if (loading) return <HomeSkeleton />

  return (
    <div className="space-y-6">
      <section className="px-1">
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
      </section>

      {/* ── Quick Links Grid ───────────────────────────── */}
      <section className="px-1 md:hidden">
        <div className="grid grid-cols-4 gap-2">
          {[
            { name: 'Products', href: '/dashboard/products', icon: RiShoppingBag3Fill },
            { name: 'Network', href: '/dashboard/network', icon: RiShareForwardFill },
            { name: 'Earnings', href: '/dashboard/earnings', icon: RiWallet3Fill },
            { name: 'Customers', href: '/dashboard/customers', icon: RiUser3Fill },
            { name: 'Analytics', href: '/dashboard/analytics', icon: RiBarChart2Fill },
            { name: 'Communities', href: '/dashboard/communities', icon: RiTeamFill },
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
                <Link href="/dashboard/settings/payment-method">
                  <Landmark className="h-3.5 w-3.5" />
                  Add payment method
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
                      <AvatarImage src={getDicebearAvatar(community.creatorId || community.name)} />
                      <AvatarFallback className="text-[10px]">{community.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground leading-tight">{community.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{community.memberCount} members</p>
                    </div>
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
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
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
                const commission = p.affiliateCommission || 20
                return (
                  <Link
                    key={p.id}
                    href={`/${p.sellerHandle}/product/${p.slug || p.id}`}
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
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6 shrink-0">
                        <AvatarImage src={getDicebearAvatar(p.userId || p.name)} />
                        <AvatarFallback className="text-[10px]">{p.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground leading-tight">{p.name}</p>
                        <div className="flex items-center justify-between mt-0.5">
                          <p className="text-xs text-muted-foreground">{formatPrice(p.price, p.currency)}</p>
                          <p className="text-xs font-bold text-primary">+{formatPrice(p.price * (commission / 100), p.currency)}</p>
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
