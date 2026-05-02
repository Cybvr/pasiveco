"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ExternalLink, Package, ShieldCheck, Truck, Share2, ArrowUpRight, Plus, Store, Check, Play } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { getUser, updateUser } from '@/services/userService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ProductDetailsSummary from '@/components/products/ProductDetailsSummary';
import { getProduct, getProductBySlug, Product, getUserProducts } from '@/services/productsService';
import { checkPurchaseStatus } from '@/services/transactionsService';
import { getProductTypeLabel } from '@/lib/productTypes';
import StarRating from '@/components/products/StarRating';
import ProductReviewSection from '@/components/products/ProductReviewSection';
import { useCurrency } from "@/context/CurrencyContext";
import { useCart } from '@/context/CartContext';
import CartDrawer from '@/components/cart/CartDrawer';
import { formatCurrency, convertAmount, type ExchangeRates } from "@/utils/currency";

const formatPrice = (amount: number, productCurrency: string, userCurrency: string, rates: ExchangeRates) => {
  try {
    return formatCurrency(
      convertAmount(amount, (productCurrency || 'NGN') as any, userCurrency as any, rates),
      userCurrency as any
    );
  } catch { return `${productCurrency} ${amount}`; }
};

export default function ProductPage({ params }: { params: Promise<{ id: string; username: string }> }) {
  const { id, username } = React.use(params);
  const routeParams = useParams<{ username: string }>();
  const [productId, setProductId] = useState('');
  const [product, setProduct] = useState<Product | null>(null);
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPinned, setIsPinned] = useState(false);
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const { user } = useAuth();
  const { currency: userCurrency, rates } = useCurrency();
  const { addItem } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

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

            // Check if user has purchased this product
            if (productData?.id || paramValue) {
              const purchased = await checkPurchaseStatus(user.email!, productData?.id || paramValue);
              setHasPurchased(purchased);
            }
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
          <Link href={`/${username}`}><Button variant="outline">Back to profile</Button></Link>
        </div>
      </div>
    );
  }

  const checkoutHref = `/${username}/product/${product.slug || product.id || productId}/checkout`;
  const formattedPrice = formatPrice(product.price, product.currency || 'NGN', userCurrency, rates);
  const hasDirectLink = Boolean(product.url);
  // Prioritize native checkout (Cart) if there is a price, even if a direct link exists.
  const hasPaystack = product.price > 0;
  const isExternalOnly = hasDirectLink && !hasPaystack;

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

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product);
    toast.success('Added to cart!', {
      description: `${product.name} is now in your cart.`,
      action: {
        label: 'View Cart',
        onClick: () => setIsCartOpen(true),
      },
    });
  };

  const handleBuyNow = () => {
    if (!product) return;
    addItem(product);
    setIsCartOpen(true);
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
          description: 'audience can now find this on your public shop page.',
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
            {(product.rating || 0) > 0 && (
              <div className="flex items-center gap-2">
                <StarRating rating={product.rating} count={product.reviewsCount} className="scale-110 origin-left" />
                <span className="text-xs text-muted-foreground ml-1">Excellent ({product.rating}/5)</span>
              </div>
            )}
            <div className="text-3xl font-semibold text-foreground">{formattedPrice}</div>
            <p className="text-base leading-7 text-muted-foreground">{product.description}</p>
          </div>

          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 border-b pb-6">
              {product.tags.map((tag, i) => <Badge key={`${tag}-${i}`} variant="outline">{tag}</Badge>)}
            </div>
          )}

          <ProductDetailsSummary product={product} />

          {/* Member Access / "You Own This" Section */}
          {hasPurchased && (
            <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <ShieldCheck className="h-5 w-5" />
                  You own this product
                </div>
                <Badge className="bg-primary text-primary-foreground">Member Access</Badge>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">You have full access to this content. You can also find this in your <Link href="/dashboard/library" className="font-bold underline text-foreground">Library</Link>.</p>

                {product.details?.fileUrl && (
                  <a href={product.details.fileUrl} target="_blank" rel="noopener noreferrer" className="block">
                    <Button className="w-full h-11 gap-2" variant="default">
                      <ExternalLink className="h-4 w-4" />
                      Download {product.details.fileName || 'Files'}
                    </Button>
                  </a>
                )}

                {product.details?.videoLink && (
                  <a href={product.details.videoLink} target="_blank" rel="noopener noreferrer" className="block">
                    <Button className="w-full h-11 gap-2" variant="outline">
                      <Play className="h-4 w-4 fill-current" />
                      Access Content Link
                    </Button>
                  </a>
                )}

                {product.details?.lessons && product.details.lessons.length > 0 && (
                  <div className="pt-2">
                    <Link href={`/dashboard/library/${product.id || productId}`}>
                      <Button className="w-full h-11 gap-2" variant="secondary">
                        <Package className="h-4 w-4" />
                        Go to Course Library
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 border-b pb-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-foreground shrink-0" />Secure payment</div>
            <div className="flex items-center gap-1.5"><Truck className="h-4 w-4 text-foreground shrink-0" />Instant checkout</div>
            <div className="flex items-center gap-1.5"><Package className="h-4 w-4 text-foreground shrink-0" />Order confirmation</div>
          </div>

          <div className="space-y-3">
            {hasPurchased ? (
              <Link href="/dashboard/library" className="block">
                <Button className="h-12 w-full bg-primary/10 text-primary hover:bg-primary/20" size="lg">
                  <Package className="mr-2 h-4 w-4" />
                  View in My Library
                </Button>
              </Link>
            ) : hasPaystack ? (
              <div className="flex flex-col gap-3">
                <Button 
                  className="h-12 w-full text-base font-bold" 
                  size="lg"
                  onClick={handleAddToCart}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add to cart
                </Button>
                <Button 
                  className="h-12 w-full text-base font-bold" 
                  variant="outline"
                  size="lg"
                  onClick={handleBuyNow}
                >
                  Buy it now
                </Button>
              </div>
            ) : hasDirectLink ? (
              <a href={product.url} target="_blank" rel="noopener noreferrer" className="block">
                <Button className="h-12 w-full" size="lg"><ExternalLink className="mr-2 h-4 w-4" />Get product</Button>
              </a>
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
            <Link href={`/${username}`} className="text-sm font-semibold text-primary hover:underline">View profile</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sellerProducts.map((p) => (
              <Link key={p.id} href={`/${username}/product/${p.slug || p.id}`} className="group space-y-2">
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
                  <StarRating rating={p.rating} count={p.reviewsCount} />
                  <p className="text-xs text-muted-foreground mt-1">{formatPrice(p.price, p.currency || 'NGN', userCurrency, rates)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Product Reviews Section */}
      <ProductReviewSection productId={product.id || productId} user={user} />

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} username={username} />
    </div>
  );
}
