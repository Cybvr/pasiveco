"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ExternalLink, Package, ShieldCheck, Truck, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ProductDetailsSummary from '@/components/products/ProductDetailsSummary';
import { getProduct, Product } from '@/services/productsService';
import { getProductTypeLabel } from '@/lib/productTypes';
import { getUser } from '@/services/userService';

const formatPrice = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'NGN',
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
};

export default function ProductPage({ params }: { params: Promise<{ id: string; slug: string }> }) {
  const routeParams = useParams<{ slug: string }>();
  const [productId, setProductId] = useState('');
  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setProductId(resolvedParams.id);

      try {
        const productData = await getProduct(resolvedParams.id);

        if (productData) {
          setProduct(productData);
          const sellerProfile = await getUser(productData.userId);
          setSeller(sellerProfile);
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
          <Link href={`/${routeParams.slug}`}>
            <Button variant="outline">Back to profile</Button>
          </Link>
        </div>
      </div>
    );
  }

  const checkoutHref = `/${routeParams.slug}/product/${product.id || productId}/checkout`;
  const formattedPrice = formatPrice(product.price, product.currency || 'NGN');
  const hasDirectLink = Boolean(product.url);
  const hasPaystack = Boolean((product as any).paymentIntegration?.paystack?.enabled);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 md:px-6 md:py-10">
        <Link
          href={`/${routeParams.slug}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

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
              <section className="flex items-center gap-3 border-b pb-6">
                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-muted">
                  {seller.profilePicture ? (
                    <img src={seller.profilePicture} alt={seller.username} className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium">{seller.displayName || seller.username}</p>
                  <p className="text-sm text-muted-foreground">Seller</p>
                </div>
              </section>
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
                  <Button className="h-12 w-full" size="lg">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Get product
                  </Button>
                </a>
              ) : hasPaystack ? (
                <Link href={checkoutHref} className="block">
                  <Button className="h-12 w-full" size="lg">
                    Continue to checkout
                  </Button>
                </Link>
              ) : (
                <Button className="h-12 w-full" size="lg" variant="outline" disabled>
                  Unavailable for purchase
                </Button>
              )}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
