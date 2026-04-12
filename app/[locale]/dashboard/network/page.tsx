"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Search, SlidersHorizontal, ArrowUpRight, Star, Package, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { getAffiliateProducts, Product } from "@/services/productsService"
import { useCurrency } from "@/context/CurrencyContext"
import { formatCurrency, EXCHANGE_RATE } from "@/utils/currency"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { getDicebearAvatar } from "@/lib/avatar"
import { getUser, getPublicUsers, type User as AppUser } from "@/services/userService"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import VerifiedBadge from "@/components/common/VerifiedBadge"

type NetworkProduct = Product & { sellerHandle?: string }

type SortOption =
  | "default"
  | "highest_commission"
  | "lowest_commission"
  | "lowest_price"
  | "highest_price"
  | "newest"
  | "popular"

type FilterOption = "all" | "digital" | "physical"

type PriceRange = "all" | "under_10" | "10_50" | "50_100" | "over_100"

type CommissionTier = "all" | "10_plus" | "20_plus" | "30_plus" | "50_plus"

interface FilterState {
  type: FilterOption
  priceRange: PriceRange
  commissionTier: CommissionTier
  sort: SortOption
}

const DEFAULT_FILTERS: FilterState = {
  type: "all",
  priceRange: "all",
  commissionTier: "all",
  sort: "default",
}

function countActiveFilters(filters: FilterState): number {
  let count = 0
  if (filters.type !== "all") count++
  if (filters.priceRange !== "all") count++
  if (filters.commissionTier !== "all") count++
  if (filters.sort !== "default") count++
  return count
}

export default function NetworkPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { currency } = useCurrency()
  const [products, setProducts] = useState<NetworkProduct[]>([])
  const [merchants, setMerchants] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  const [merchantsLoading, setMerchantsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  // Temp state for mobile modal (applied only on confirm)
  const [pendingFilters, setPendingFilters] = useState<FilterState>(DEFAULT_FILTERS)

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getAffiliateProducts(24)
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

        setProducts(enriched)
      } catch (err) {
        console.error("Error loading products:", err)
      } finally {
        setLoading(false)
      }
    }

    async function loadMerchants() {
      try {
        const data = await getPublicUsers()
        setMerchants(data.slice(0, 10))
      } catch (err) {
        console.error("Error loading merchants:", err)
      } finally {
        setMerchantsLoading(false)
      }
    }

    loadProducts()
    loadMerchants()
  }, [])

  const formatPrice = (amount: number, prodCurrency: string = 'USD') => {
    let displayAmount = amount
    if (currency === 'NGN' && prodCurrency === 'USD') {
      displayAmount = amount * EXCHANGE_RATE
    }
    return formatCurrency(displayAmount, currency)
  }

  const applyPriceRangeFilter = (p: NetworkProduct, range: PriceRange): boolean => {
    if (range === "all") return true
    const price = p.price
    if (range === "under_10") return price < 10
    if (range === "10_50") return price >= 10 && price <= 50
    if (range === "50_100") return price > 50 && price <= 100
    if (range === "over_100") return price > 100
    return true
  }

  const applyCommissionFilter = (p: NetworkProduct, tier: CommissionTier): boolean => {
    if (tier === "all") return true
    const commission = p.affiliateCommission || 20
    if (tier === "10_plus") return commission >= 10
    if (tier === "20_plus") return commission >= 20
    if (tier === "30_plus") return commission >= 30
    if (tier === "50_plus") return commission >= 50
    return true
  }

  const filteredProducts = products
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter(p => filters.type === "all" || p.type === filters.type)
    .filter(p => applyPriceRangeFilter(p, filters.priceRange))
    .filter(p => applyCommissionFilter(p, filters.commissionTier))
    .sort((a, b) => {
      if (filters.sort === "highest_commission") return (b.affiliateCommission || 20) - (a.affiliateCommission || 20)
      if (filters.sort === "lowest_commission") return (a.affiliateCommission || 20) - (b.affiliateCommission || 20)
      if (filters.sort === "lowest_price") return a.price - b.price
      if (filters.sort === "highest_price") return b.price - a.price
      return 0
    })

  const handlePromoteProduct = (e: React.MouseEvent, p: NetworkProduct) => {
    e.preventDefault()
    if (!user) {
      toast.error('You must be logged in to promote products.')
      return
    }
    const affiliateLink = `${window.location.origin}/${p.sellerHandle}/product/${p.slug || p.id}?ref=${user.uid}`
    navigator.clipboard.writeText(affiliateLink).then(() => {
      toast.success('Affiliate link copied to clipboard!', {
        description: 'Share this link with your audience to start earning.',
      })
    }).catch(() => {
      toast.error('Failed to copy link.')
    })
  }

  const openMobileFilters = () => {
    setPendingFilters(filters)
    setMobileFiltersOpen(true)
  }

  const applyMobileFilters = () => {
    setFilters(pendingFilters)
    setMobileFiltersOpen(false)
  }

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS)
  }

  const activeFilterCount = countActiveFilters(filters)

  return (
    <div className="space-y-8 pb-20">
      {/* Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-950 text-white p-8 rounded-3xl overflow-hidden relative group">
        <div className="relative z-10 space-y-4">
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-none">PROMOTE & EARN</h1>
          <p className="text-zinc-400 max-w-lg text-lg font-light leading-relaxed">
            Discover thousands of products ready for promotion. Earn up to 50% commission on every successful referral.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-1000" />
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-10 h-12 bg-muted/40 border-none rounded-2xl focus-visible:ring-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Desktop filters */}
        <div className="hidden sm:flex gap-2 shrink-0">
          <Select value={filters.type} onValueChange={(v) => setFilters(f => ({ ...f, type: v as FilterOption }))}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="digital">Digital</SelectItem>
              <SelectItem value="physical">Physical</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.priceRange} onValueChange={(v) => setFilters(f => ({ ...f, priceRange: v as PriceRange }))}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Price</SelectItem>
              <SelectItem value="under_10">Under $10</SelectItem>
              <SelectItem value="10_50">$10 – $50</SelectItem>
              <SelectItem value="50_100">$50 – $100</SelectItem>
              <SelectItem value="over_100">Over $100</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.commissionTier} onValueChange={(v) => setFilters(f => ({ ...f, commissionTier: v as CommissionTier }))}>
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Commission" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Commission</SelectItem>
              <SelectItem value="10_plus">10%+</SelectItem>
              <SelectItem value="20_plus">20%+</SelectItem>
              <SelectItem value="30_plus">30%+</SelectItem>
              <SelectItem value="50_plus">50%+</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.sort} onValueChange={(v) => setFilters(f => ({ ...f, sort: v as SortOption }))}>
            <SelectTrigger className="w-[190px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Sort by</SelectItem>
              <SelectItem value="highest_commission">Highest Commission</SelectItem>
              <SelectItem value="lowest_commission">Lowest Commission</SelectItem>
              <SelectItem value="lowest_price">Lowest Price</SelectItem>
              <SelectItem value="highest_price">Highest Price</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
            </SelectContent>
          </Select>

          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-2xl text-muted-foreground hover:text-foreground shrink-0"
              onClick={resetFilters}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Mobile filter button */}
        <Button
          variant="outline"
          className="sm:hidden h-12 rounded-2xl font-medium gap-2 relative"
          onClick={openMobileFilters}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Active filter count indicator (desktop) */}
      {activeFilterCount > 0 && (
        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
          <span>{filteredProducts.length} results</span>
          <span>·</span>
          <button className="text-primary font-medium hover:underline" onClick={resetFilters}>
            Clear all filters
          </button>
        </div>
      )}

      {/* Product grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-video w-full rounded-2xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full h-64 flex flex-col items-center justify-center text-muted-foreground bg-muted/20 rounded-3xl border-2 border-dashed">
            <Package className="h-10 w-10 mb-4 opacity-20" />
            <p className="text-lg font-medium">No products found.</p>
            {activeFilterCount > 0 && (
              <button className="mt-2 text-sm text-primary font-medium hover:underline" onClick={resetFilters}>
                Clear filters
              </button>
            )}
          </div>
        ) : (
          filteredProducts.map((p) => {
            const commission = p.affiliateCommission || 20
            return (
              <Link
                href={`/${p.sellerHandle}/product/${p.slug || p.id}`}
                key={p.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card hover:shadow-lg transition-all duration-300"
              >
                <div className="aspect-[3/2] relative overflow-hidden">
                  <img
                    src={p.thumbnail || getDicebearAvatar(p.id || p.name)}
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-zinc-950/80 backdrop-blur-md text-white border-none px-2 py-0.5 text-[10px] font-bold rounded-md">
                      {commission}% Commission
                    </Badge>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="secondary" className="h-7 w-7 rounded-lg shadow-lg">
                      <Star className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="absolute -bottom-0.5 -left-0.5">
                    <div className="rounded-tr-lg bg-card p-1.5 pt-2 pr-2">
                      <Avatar className="h-6 w-6 border-2 border-background">
                        <AvatarImage src={getDicebearAvatar(p.userId || p.name)} />
                        <AvatarFallback className="text-[10px]">{p.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                </div>
                <div className="p-3 flex flex-col gap-2.5">
                  <h3 className="text-sm font-semibold truncate leading-tight">{p.name}</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Price</p>
                      <p className="text-sm font-bold">{formatPrice(p.price, p.currency)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-primary font-medium uppercase tracking-tighter">You earn</p>
                      <p className="text-sm font-bold text-primary">{formatPrice(p.price * (commission / 100), p.currency)}</p>
                    </div>
                  </div>
                  <Button
                    className="w-full h-9 rounded-xl text-xs font-bold bg-foreground text-background hover:bg-foreground/90 gap-1.5"
                    onClick={(e) => handlePromoteProduct(e, p)}
                  >
                    Promote <ArrowUpRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Link>
            )
          })
        )}
      </div>

      {/* Top Merchants */}
      <div className="pt-12 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Top Merchant Networks</h2>
            <p className="text-muted-foreground text-sm">Follow merchants with the highest conversion rates.</p>
          </div>
          <Button variant="ghost" size="sm" className="font-bold gap-1 group">
            View all <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar">
          {merchantsLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-3 min-w-[120px] p-6 rounded-3xl bg-muted/30">
                <Skeleton className="w-16 h-16 rounded-full" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))
          ) : merchants.length === 0 ? (
            <div className="text-sm text-muted-foreground p-4">No top merchants found yet.</div>
          ) : (
            merchants.map((m) => (
              <Link
                key={m.id || m.userId}
                href={`/${(m.username || m.slug || "user").replace(/^@/, '')}`}
                className="flex flex-col items-center gap-3 min-w-[120px] p-6 rounded-3xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group"
              >
                <div className="relative group-hover:scale-110 transition-transform duration-500">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-purple-500 p-0.5">
                    <div className="w-full h-full rounded-full bg-background overflow-hidden flex items-center justify-center font-bold text-lg">
                      {m.profilePicture || m.photoURL ? (
                        <img src={m.profilePicture || m.photoURL || ""} alt={m.displayName || "Merchant"} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                          {(m.displayName || m.username || "M").charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                  {m.isVerified && (
                    <VerifiedBadge size="sm" className="absolute -top-0.5 -right-0.5 z-10" />
                  )}
                </div>
                <div className="text-center w-full min-w-0">
                  <p className="text-xs font-bold leading-none truncate">{m.displayName || m.username}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Mobile Filters Modal */}
      <Dialog open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight">Filters</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* Product Type */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product Type</p>
              <Select
                value={pendingFilters.type}
                onValueChange={(v) => setPendingFilters(f => ({ ...f, type: v as FilterOption }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="digital">Digital</SelectItem>
                  <SelectItem value="physical">Physical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price Range</p>
              <Select
                value={pendingFilters.priceRange}
                onValueChange={(v) => setPendingFilters(f => ({ ...f, priceRange: v as PriceRange }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Any Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Price</SelectItem>
                  <SelectItem value="under_10">Under $10</SelectItem>
                  <SelectItem value="10_50">$10 – $50</SelectItem>
                  <SelectItem value="50_100">$50 – $100</SelectItem>
                  <SelectItem value="over_100">Over $100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Commission */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Min. Commission</p>
              <Select
                value={pendingFilters.commissionTier}
                onValueChange={(v) => setPendingFilters(f => ({ ...f, commissionTier: v as CommissionTier }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Any Commission" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Commission</SelectItem>
                  <SelectItem value="10_plus">10%+</SelectItem>
                  <SelectItem value="20_plus">20%+</SelectItem>
                  <SelectItem value="30_plus">30%+</SelectItem>
                  <SelectItem value="50_plus">50%+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sort By</p>
              <Select
                value={pendingFilters.sort}
                onValueChange={(v) => setPendingFilters(f => ({ ...f, sort: v as SortOption }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="highest_commission">Highest Commission</SelectItem>
                  <SelectItem value="lowest_commission">Lowest Commission</SelectItem>
                  <SelectItem value="lowest_price">Lowest Price</SelectItem>
                  <SelectItem value="highest_price">Highest Price</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex gap-2 flex-row">
            <Button
              variant="outline"
              className="flex-1 rounded-xl h-11 font-medium"
              onClick={() => {
                setPendingFilters(DEFAULT_FILTERS)
              }}
            >
              Reset
            </Button>
            <Button
              className="flex-1 rounded-xl h-11 font-bold gap-1.5"
              onClick={applyMobileFilters}
            >
              <Check className="h-4 w-4" />
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}