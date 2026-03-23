"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ExternalLink, Package, ShieldCheck, Truck, Share2, ArrowUpRight, Plus, Store, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { getUser, updateUser } from '@/services/userService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ProductDetailsSummary from '@/components/products/ProductDetailsSummary';
import { getProduct, getProductBySlug, Product, getUserProducts } from '@/services/productsService';
import { getProductTypeLabel } from '@/lib/productTypes';
import { useCurrency } from "@/context/CurrencyContext";
import { formatCurrency, EXCHANGE_RATE } from "@/utils/currency";

const formatPrice = (amount: number, productCurrency: string, userCurrency: string) => {
  try {
    let displayPrice = amount;
    let displayCurrency = productCurrency as any;
    if (productCurrency === 'NGN' && userCurrency === 'USD') { displayPrice = amount / EXCHANGE_RATE; displayCurrency = 'USD'; }
    else if (productCurrency === 'USD' && userCurrency === 'NGN') { displayPrice = amount * EXCHANGE_RATE; displayCurrency = 'NGN'; }
    return formatCurrency(displayPrice, displayCurrency);
  } catch { return `${productCurrency} ${amount}`; }
};

export default function ProductPage({ params }: { params: Promise<{ id: string; slug: string }> }) {
  const { user } = useAuth();
  const routeParams = useParams<{ slug: string }>();
  const [productId, setProductId] = useState('');
  const [product, setProduct] = useState<Product | null>(null);
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPinned, setIsPinned] = useState(false);
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const { currency: userCurrency } = useCurrency();

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      const paramValue = resolvedParams.id;
      setProductId(paramValue);
      try {
        let productData = await getProductBySlug(paramValue);
        if (!productData) productData = await getProduct(paramValue);
        if (productData) {
          setProduct(productData);
          const [sellerProfile, products] = await Promise.all([
            getUser(productData.userId),
            getUserProducts(productData.userId)
          ]);
          setSellerProducts(products.filter(p => p.id !== productData.id && p.slug !== productData.slug).slice(0, 4));
        }

        if (user?.uid) {
          const userData = await getUser(user.uid);
          if (userData) {
            setCurrentUserData(userData);
            const pinned = userData.pinnedAffiliates || [];
            setIsPinned(pinned.includes(paramValue) || pinned.includes(productData?.id || ''));
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    resolveParams();
  }, [params]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center py-24 px-4">
        <div className="text-center">
          <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <h1 className="mb-2 text-2xl font-semibold">Product not found</h1>
          <p className="mb-5 text-muted-foreground">This listing is unavailable.</p>
          <Link href={`/${routeParams.slug}`}><Button variant="outline">Back to profile</Button></Link>
        </div>
      </div>
    );
  }

  const checkoutHref = `/${routeParams.slug}/product/${product.slug || product.id || productId}/checkout`;
  const formattedPrice = formatPrice(product.price, product.currency || 'NGN', userCurrency);
  const hasDirectLink = Boolean(product.url);
  // Allow checkout for any priced product — the global Paystack key handles the actual payment.
  // Only fall back to "Unavailable" if price is 0 and there's no direct link.
  const hasPaystack = !hasDirectLink && product.price > 0;

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: product.description,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handlePromote = async () => {
    if (!user) {
      toast.error('Log in to promote and earn commission!');
      return;
    }
    const affiliateLink = `${window.location.origin}${window.location.pathname}?ref=${user.uid}`;
    try {
      await navigator.clipboard.writeText(affiliateLink);
      toast.success('Affiliate link copied!', {
        description: `You'll earn ${product?.affiliateCommission || 20}% on every sale via this link.`,
      });
    } catch (err) {
      toast.error('Failed to copy link.');
    }
  };

  const handlePinToStore = async () => {
    if (!user) {
      toast.error('Log in to pin products to your store!');
      return;
    }
    if (!product) return;

    try {
      const currentPinned = currentUserData?.pinnedAffiliates || [];
      const prodId = product.id || productId;
      
      let newPinned;
      if (isPinned) {
        newPinned = currentPinned.filter((id: string) => id !== prodId);
        toast.success('Removed from your store!');
      } else {
        newPinned = [...currentPinned, prodId];
        toast.success('Added to your store!', {
          description: 'Fans can now find this on your public shop page.',
        });
      }

      await updateUser(user.uid, { pinnedAffiliates: newPinned });
      setCurrentUserData({ ...currentUserData, pinnedAffiliates: newPinned });
      setIsPinned(!isPinned);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update store.');
    }
  };

  return (
    <div className="w-full space-y-12">

      {/* Product layout: image left, details right on desktop */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-start">

        {/* Product image */}
        <div className="overflow-hidden rounded-2xl border bg-muted/30 w-full">
          {product.thumbnail ? (
            <img src={product.thumbnail} alt={product.name} className="aspect-square w-full object-cover md:aspect-[4/5]" />
          ) : (
            <div className="flex aspect-square md:aspect-[4/5] items-center justify-center bg-muted">
              <Package className="h-14 w-14 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Product details */}
        <div className="space-y-6">
          <div className="space-y-3 border-b pb-6">
            <Badge variant="secondary" className="w-fit">{getProductTypeLabel(product.category)}</Badge>
            <h1 className="text-3xl font-bold tracking-tight leading-tight">{product.name}</h1>
            <div className="text-3xl font-semibold text-foreground">{formattedPrice}</div>
            <p className="text-base leading-7 text-muted-foreground">{product.description}</p>
          </div>

          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 border-b pb-6">
              {product.tags.map((tag, i) => <Badge key={`${tag}-${i}`} variant="outline">{tag}</Badge>)}
            </div>
          )}

          <ProductDetailsSummary product={product} />

          <div className="grid grid-cols-3 gap-3 border-b pb-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-foreground shrink-0" />Secure payment</div>
            <div className="flex items-center gap-1.5"><Truck className="h-4 w-4 text-foreground shrink-0" />Instant checkout</div>
            <div className="flex items-center gap-1.5"><Package className="h-4 w-4 text-foreground shrink-0" />Order confirmation</div>
          </div>

          <div className="space-y-3">
            {hasDirectLink ? (
              <a href={product.url} target="_blank" rel="noopener noreferrer" className="block">
                <Button className="h-12 w-full" size="lg"><ExternalLink className="mr-2 h-4 w-4" />Get product</Button>
              </a>
            ) : hasPaystack ? (
              <Link href={checkoutHref} className="block">
                <Button className="h-12 w-full" size="lg">Continue to checkout</Button>
              </Link>
            ) : (
              <Button className="h-12 w-full" size="lg" variant="outline" disabled>Unavailable for purchase</Button>
            )}
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1 h-12 gap-2 border-dashed" 
                  size="lg"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                {product.affiliateEnabled && (
                  <div className="flex gap-2 flex-1">
                    <Button 
                      variant="default" 
                      className="flex-1 h-12 gap-2 bg-zinc-900 text-white hover:bg-zinc-800" 
                      size="lg"
                      onClick={handlePromote}
                    >
                      <ArrowUpRight className="h-4 w-4" />
                      Promote
                    </Button>
                    {user?.uid !== product.userId && (
                      <Button 
                        variant="outline" 
                        size="icon"
                        className={`h-12 w-12 border-2 ${isPinned ? 'bg-primary/10 border-primary text-primary' : 'border-zinc-200'}`}
                        onClick={handlePinToStore}
                        title={isPinned ? "Remove from my store" : "Add to my store"}
                      >
                        {isPinned ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* More from this creator */}
      {sellerProducts.length > 0 && (
        <section className="space-y-4 border-t pt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">More from this creator</h2>
            <Link href={`/${routeParams.slug}`} className="text-sm font-semibold text-primary hover:underline">View profile</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sellerProducts.map((p) => (
              <Link key={p.id} href={`/${routeParams.slug}/product/${p.slug || p.id}`} className="group space-y-2">
                <div className="aspect-square overflow-hidden rounded-xl border bg-muted/30 group-hover:border-primary transition-colors">
                  {p.thumbnail ? (
                    <img src={p.thumbnail} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Package className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="line-clamp-1 text-sm font-bold">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{formatPrice(p.price, p.currency || 'NGN', userCurrency)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
