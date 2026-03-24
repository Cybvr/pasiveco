"use client"
 
import { useEffect, useState } from "react"
import Link from "next/link"
import { Search, Filter, ArrowUpRight, Star, TrendingUp, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAffiliateProducts, Product } from "@/services/productsService"
import { useCurrency } from "@/context/CurrencyContext"
import { formatCurrency, EXCHANGE_RATE } from "@/utils/currency"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { getDicebearAvatar } from "@/lib/avatar"
import { getUser, getPublicUsers, type User as AppUser } from "@/services/userService"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

type NetworkProduct = Product & { sellerHandle?: string }
 
export default function NetworkPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { currency } = useCurrency()
  const [products, setProducts] = useState<NetworkProduct[]>([])
  const [merchants, setMerchants] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  const [merchantsLoading, setMerchantsLoading] = useState(true)
  const [search, setSearch] = useState("")
 
  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getAffiliateProducts(24)
        if (!data) return
        
        // Fetch unique users concurrently
        const userIds = [...new Set(data.map(p => p.userId))]
        const userDocs = await Promise.all(
          userIds.map(id => getUser(id).catch(() => null))
        )
        const userMap = new Map(userDocs.filter(Boolean).map(u => [u?.userId || u?.id, u]))
        
        // Enrich products with seller handle
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
 
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const handlePromoteProduct = (e: React.MouseEvent, p: NetworkProduct) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to promote products.');
      return;
    }
    const affiliateLink = `${window.location.origin}/${p.sellerHandle}/product/${p.slug || p.id}?ref=${user.uid}`;
    navigator.clipboard.writeText(affiliateLink).then(() => {
      toast.success('Affiliate link copied to clipboard!', {
        description: 'Share this link with your audience to start earning.',
      });
    }).catch(() => {
      toast.error('Failed to copy link.');
    });
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-950 text-white p-8 rounded-3xl overflow-hidden relative group">
        <div className="relative z-10 space-y-4">
          <Badge className="bg-primary hover:bg-primary text-primary-foreground font-bold px-3 py-1 rounded-full uppercase tracking-widest text-[10px]">Affiliate Network</Badge>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-none">PROMOTE & EARN</h1>
          <p className="text-zinc-400 max-w-lg text-lg font-light leading-relaxed">
            Discover thousands of products ready for promotion. Earn up to 50% commission on every successful referral.
          </p>
          <div className="flex gap-4 pt-2">
            <Button className="rounded-full px-8 h-12 text-sm font-bold bg-white text-zinc-950 hover:bg-zinc-200">
              Join Community
            </Button>
            <Button variant="outline" className="rounded-full px-8 h-12 text-sm font-bold border-zinc-700 bg-transparent hover:bg-zinc-800 text-white">
              Learn More
            </Button>
          </div>
        </div>
        
        {/* Decorative background for the hero card */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-1000" />
      </div>
 
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search products by niche, keywords, or creator..." 
            className="pl-10 h-12 bg-muted/40 border-none rounded-2xl focus-visible:ring-1" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-12 rounded-2xl px-6 gap-2 border-dashed">
            <Filter className="h-4 w-4 opacity-50" />
            Filters
          </Button>
          <Button variant="outline" className="h-12 rounded-2xl px-6 gap-2">
            <TrendingUp className="h-4 w-4 opacity-50" />
            Highest Earnings
          </Button>
        </div>
      </div>
 
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
            <p className="text-lg font-medium">No products found for promotion.</p>
          </div>
        ) : (
          filteredProducts.map((p) => {
            const commission = p.affiliateCommission || 20;
            return (
              <Link href={`/${p.sellerHandle}/product/${p.slug || p.id}`} key={p.id} className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card hover:shadow-lg transition-all duration-300">
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
                <div className="p-3.5 flex flex-col gap-3">
                  <div>
                    <h3 className="text-sm font-semibold truncate leading-tight">{p.name}</h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Price</p>
                      <p className="text-sm font-bold">{formatPrice(p.price, p.currency)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-primary font-medium uppercase tracking-tighter">Commission</p>
                      <p className="text-sm font-bold text-primary">{formatPrice(p.price * (commission / 100), p.currency)}</p>
                    </div>
                  </div>
                  <Button 
                    className="w-full h-9 rounded-xl text-xs font-bold bg-foreground text-background hover:bg-foreground/90 gap-1.5"
                    onClick={(e) => handlePromoteProduct(e, p)}
                  >
                    Promote Now <ArrowUpRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Link>
            )
          })
        )}
      </div>
      
      {/* Featured Creators Section */}
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
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-purple-500 p-0.5 group-hover:scale-110 transition-transform duration-500">
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
                <div className="text-center w-full min-w-0">
                  <p className="text-xs font-bold leading-none truncate">{m.displayName || m.username}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-tighter">Verified Seller</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
