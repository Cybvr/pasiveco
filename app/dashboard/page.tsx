'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import {
  RiShoppingBag3Fill,
  RiShareForwardFill,
  RiWallet3Fill,
  RiUser3Fill,
  RiTeamFill,
  RiSettings4Fill
} from 'react-icons/ri'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { HomeSkeleton } from '@/app/common/dashboard/SocialLoading'
import { getDicebearAvatar } from '@/lib/avatar'
import { getUserProducts, type Product } from '@/services/productsService'
import { getBankingDetails } from '@/services/bankingDetailsService'
import { getSellerTransactions, getAffiliateTransactions } from '@/services/transactionsService'
import { useAuth } from '@/hooks/useAuth'

import { useCurrency } from '@/context/CurrencyContext'
import { formatCurrency, EXCHANGE_RATE } from '@/utils/currency'
import { getAllCommunities } from '@/services/communityService'
import { Community } from '@/types/community'
import { Transaction } from '@/types/transaction'
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
      <section className="px-1 md:max-w-2xl">
        <ProfileCompletionCard
          user={user}
          hasBankingDetails={hasBankingDetails}
          productsLength={products.length}
          currency={currency}
        />
      </section>
      {/* ── Top Stats Grid ───────────────────────────── */}
      <section className="px-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Earnings Balance (Green) */}
        <Link
          href="/dashboard/earnings"
          className="rounded-2xl p-5 sm:p-6 bg-[#189e68] text-white flex flex-col justify-between transition-opacity hover:opacity-95"
        >
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest opacity-90 mb-1.5">Earnings Balance</p>
            <p className="text-2xl sm:text-2xl font-bold text-white">{formatCurrency(earningsSummary.availableBalance, currency)}</p>
          </div>
          <div className="mt-6">
            <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-[11px] sm:text-xs font-semibold whitespace-nowrap">
              View earnings
            </span>
          </div>
        </Link>

        {/* Products Listed */}
        <Link
          href="/dashboard/products"
          className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6 flex flex-col justify-between transition-colors hover:bg-muted/30"
        >
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/80 mb-1.5">Products Listed</p>
            <p className="text-2xl sm:text-2xl font-bold text-foreground">{products.length}</p>
          </div>
          <div className="mt-6">
            <span className="inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] sm:text-xs font-semibold text-emerald-600">
              View Products
            </span>
          </div>
        </Link>

        <InviteCard
          userId={user?.uid || ''}
          username={((user as any)?.username || (user as any)?.slug || user?.email?.split('@')[0])?.replace(/^@/, '')?.trim()}
          currency={currency}
        />

        <Link
          href="/dashboard/network"
          className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6 flex flex-col justify-between transition-colors hover:bg-muted/30"
        >
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/80 mb-1.5">Promote & Earn</p>
            <p className="text-3xl sm:text-2xl font-bold text-foreground">Up to 50% Comm.</p>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Join our affiliate network and earn high commissions by promoting top products.
            </p>
          </div>
          <div className="mt-6">
            <span className="inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] sm:text-xs font-semibold text-emerald-600">
              Explore Network
            </span>
          </div>
        </Link>
      </section>

      {/* ── Profile & Invite Row ───────────────────────────── */}


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
                className="flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-2xl bg-card px-2 py-3 text-center"
              >
                <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[11px] font-medium leading-tight text-foreground">{link.name}</span>
              </Link>
            )
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-4">
        {/* ── Your products ───────────────────────────── */}
        <section className="min-w-0 space-y-2">
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
                  <Link key={product.id} href="/dashboard/products" className={`${CARD_W} flex flex-col gap-2 bg-card border-border overflow-auto`}>
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src={product.thumbnail || getDicebearAvatar(product.id || product.name)}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="text-left p-2">
                      <p className="truncate text-sm font-semibold text-foreground leading-tight">{product.name}</p>
                      <div className="mt-0.5">
                        <p className="text-xs text-muted-foreground">
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
            <div className="rounded-2xl border border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground mx-1">
              No products yet. Add your first product to see it here.
            </div>
          )}
        </section>

        {/* ── Trending Communities ─────────────────────── */}
        <section className="min-w-0 space-y-2">
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
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
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
                {communities.slice(0, 5).map((community) => {
                  return (
                    <Link
                      key={community.id}
                      href={`/dashboard/communities/${community.slug || community.id}`}
                      className={`${CARD_W} flex flex-col gap-2 bg-card rounded-xl overflow-auto border-border`}
                    >
                      <div className="aspect-video w-full overflow-hidden  bg-muted">
                        <img
                          src={community.image || getDicebearAvatar(community.id || community.name)}
                          alt={community.name}
                          className="h-full w-full object-cover"
                          onError={(e) => { e.currentTarget.src = getDicebearAvatar(community.id || community.name) }}
                        />
                      </div>
                      <div className="min-w-0 p-2">
                        <p className="truncate text-sm font-semibold text-foreground leading-tight">{community.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{community.memberCount} members</p>
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

    </div>
  )
}
