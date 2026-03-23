'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, CheckCircle2, Landmark, Package, PackagePlus, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { HomeSkeleton } from '@/app/common/dashboard/SocialLoading'
import { getDicebearAvatar } from '@/lib/avatar'
import { getUserProducts, getAllLatestProducts, type Product } from '@/services/productsService'
import { getBankingDetails } from '@/services/bankingDetailsService'
import { useAuth } from '@/hooks/useAuth'
import { useCurrency } from '@/context/CurrencyContext'
import { formatCurrency, EXCHANGE_RATE } from '@/utils/currency'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardHomePage() {
  const { user } = useAuth()
  const { currency } = useCurrency()
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [affiliateProducts, setAffiliateProducts] = useState<Product[]>([])
  const [hasBankingDetails, setHasBankingDetails] = useState(true)
  const [affiliateLoading, setAffiliateLoading] = useState(true)

  useEffect(() => {
    let active = true

    const loadDashboard = async () => {
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

    void loadDashboard()

    return () => {
      active = false
    }
  }, [user])

  useEffect(() => {
    async function loadAffiliate() {
      try {
        const data = await getAllLatestProducts(8)
        setAffiliateProducts(data || [])
      } catch {
        // silent
      } finally {
        setAffiliateLoading(false)
      }
    }
    void loadAffiliate()
  }, [])

  const hasProducts = useMemo(() => products.length > 0, [products])
  const featuredProducts = useMemo(() => products.slice(0, 4), [products])

  const formatPrice = (amount: number, prodCurrency: string = 'USD') => {
    let displayAmount = amount
    if (currency === 'NGN' && prodCurrency === 'USD') {
      displayAmount = amount * EXCHANGE_RATE
    }
    return formatCurrency(displayAmount, currency)
  }

  if (loading) {
    return <HomeSkeleton />
  }

  return (
    <div className="space-y-5">
      {/* Your Products */}
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

      {/* Affiliate Network Row */}
      <section className="space-y-2 py-0">
        <div className="flex items-center justify-between gap-3 px-1">
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
            <div className="flex w-max space-x-4 pb-4 px-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-[170px] space-y-2">
                  <Skeleton className="aspect-video w-full rounded-2xl" />
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : affiliateProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground">
            No affiliate products available yet. Check back soon!
          </div>
        ) : (
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex w-max space-x-4 pb-4 px-1">
              {affiliateProducts.map((p) => {
                const commission = Math.floor(Math.random() * 40) + 10
                return (
                  <Link
                    key={p.id}
                    href="/dashboard/network"
                    className="w-[185px] group flex flex-col gap-2"
                  >
                    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-muted">
                      <img
                        src={p.thumbnail || getDicebearAvatar(p.id || p.name)}
                        alt={p.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-zinc-950/80 backdrop-blur-md text-white border-none px-1.5 py-0.5 text-[9px] font-bold rounded-md">
                          {commission}% Commission
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-0.5 text-left">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] uppercase tracking-widest text-primary font-bold">In Demand</span>
                        <CheckCircle2 className="h-2.5 w-2.5 text-primary" />
                      </div>
                      <p className="line-clamp-1 text-[13px] font-semibold leading-tight text-foreground">{p.name}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] text-muted-foreground">{formatPrice(p.price, p.currency)}</p>
                        <p className="text-[11px] font-bold text-primary">+{formatPrice(p.price * (commission / 100), p.currency)}</p>
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
