"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Package, ShieldCheck, Truck, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ProductDetailsSummary from '@/components/products/ProductDetailsSummary';
import { getProduct, getProductBySlug, Product, getUserProducts } from '@/services/productsService';
import { getProductTypeLabel } from '@/lib/productTypes';
import { getUser } from '@/services/userService';

import { useCurrency } from "@/context/CurrencyContext";
import { formatCurrency, EXCHANGE_RATE } from "@/utils/currency";

const formatPrice = (amount: number, productCurrency: string, userCurrency: string) => {
  try {
    let displayPrice = amount;
    let displayCurrency = productCurrency as any;

    if (productCurrency === 'NGN' && userCurrency === 'USD') {
      displayPrice = amount / EXCHANGE_RATE;
      displayCurrency = 'USD';
    } else if (productCurrency === 'USD' && userCurrency === 'NGN') {
      displayPrice = amount * EXCHANGE_RATE;
      displayCurrency = 'NGN';
    }

    return formatCurrency(displayPrice, displayCurrency);
  } catch {
    return `${productCurrency} ${amount}`;
  }
};

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const [productId, setProductId] = useState('');
  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<any>(null);
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { currency: userCurrency } = useCurrency();

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      const paramValue = resolvedParams.id;
      setProductId(paramValue);

      try {
        // Try fetching by slug first, then fallback to ID
        let productData = await getProductBySlug(paramValue);
        if (!productData) {
          productData = await getProduct(paramValue);
        }

        if (productData) {
          setProduct(productData);
          const [sellerProfile, products] = await Promise.all([
            getUser(productData.userId),
            getUserProducts(productData.userId)
          ]);
          setSeller(sellerProfile);
          setSellerProducts(products.filter(p => p.id !== productData.id && p.slug !== productData.slug).slice(0, 4));
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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="text-center">
          <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <h1 className="mb-2 text-2xl font-semibold">Product not found</h1>
          <p className="mb-5 text-muted-foreground">This listing is unavailable.</p>
          <Link href="/">
            <Button variant="outline">Back home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const sellerHref = seller?.username ? `/${seller.username.replace('@', '')}` : '/';
  const checkoutHref = `/product/${product.slug || product.id || productId}/checkout`;
  const formattedPrice = formatPrice(product.price, product.currency || 'NGN', userCurrency);
  const hasDirectLink = Boolean(product.url);
  const hasPaystack = Boolean((product as any).paymentIntegration?.paystack?.enabled);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 md:px-6 md:py-10">

        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="overflow-hidden rounded-2xl border bg-muted/30">
            {product.thumbnail ? (
              <img
                src={product.thumbnail}
                alt={product.name}
                className="aspect-[4/5] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[4/5] items-center justify-center bg-muted">
                <Package className="h-14 w-14 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="space-y-3 border-b pb-6">
              <Badge variant="secondary" className="w-fit">{getProductTypeLabel(product.category)}</Badge>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{product.name}</h1>
              <div className="text-3xl font-semibold text-foreground">{formattedPrice}</div>
              <p className="max-w-xl text-base leading-7 text-muted-foreground">{product.description}</p>
            </div>

            {seller && (
              <Link href={sellerHref} className="flex items-center gap-3 border-b pb-6 group hover:text-primary transition-colors">
                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-muted border group-hover:border-primary transition-colors">
                  {seller.profilePicture ? (
                    <img src={seller.profilePicture} alt={seller.username} className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold">{seller.displayName || seller.username}</p>
                  <p className="text-sm text-muted-foreground">View profile</p>
                </div>
              </Link>
            )}

            {product.tags?.length > 0 && (
              <section className="flex flex-wrap gap-2 border-b pb-6">
                {product.tags.map((tag, index) => (
                  <Badge key={`${tag}-${index}`} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </section>
            )}

            <ProductDetailsSummary product={product} />

            <section className="grid gap-3 border-b pb-6 text-sm text-muted-foreground sm:grid-cols-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-foreground" />
                Secure payment
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-foreground" />
                Instant checkout
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-foreground" />
                Order confirmation
              </div>
            </section>

            <section className="space-y-3">
              {hasDirectLink ? (
                <a href={product.url} target="_blank" rel="noopener noreferrer" className="block">
                  <Button size="lg" className="w-full">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Get product
                  </Button>
                </a>
              ) : hasPaystack ? (
                <Link href={checkoutHref} className="block">
                  <Button size="lg" className="w-full">
                    Continue to checkout
                  </Button>
                </Link>
              ) : (
                <Button size="lg" className="w-full" variant="outline" disabled>
                  Unavailable for purchase
                </Button>
              )}
            </section>
          </div>
        </section>
        {sellerProducts.length > 0 && (
          <section className="mt-12 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-xl font-bold">More from this creator</h2>
              <Link href={sellerHref} className="text-sm font-semibold text-primary hover:underline">
                View profile
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {sellerProducts.map((p) => (
                <Link key={p.id} href={`/product/${p.slug || p.id}`} className="group space-y-3">
                  <div className="aspect-square overflow-hidden rounded-xl border bg-muted/30 group-hover:border-primary transition-colors">
                    {p.thumbnail ? (
                      <img src={p.thumbnail} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="line-clamp-1 text-sm font-bold">{p.name}</p>
                    <p className="text-xs text-muted-foreground font-medium">
                      {formatPrice(p.price, p.currency || 'NGN', userCurrency)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <footer className="mt-20 border-t py-12 text-center text-sm text-muted-foreground">
          <p>© 2026 Pasive. All rights reserved.</p>
          <div className="mt-2 flex items-center justify-center gap-1.5 opacity-60">
            <span>Made with</span>
            <Link href="/" className="font-bold text-foreground hover:text-primary transition-colors">Pasive</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
