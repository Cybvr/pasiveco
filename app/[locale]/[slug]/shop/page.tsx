"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useParams } from 'next/navigation';
import { getUserByUsername } from '@/services/userService';
import { getUserProducts, Product, getProduct } from '@/services/productsService';
import { getProductTypeLabel } from '@/lib/productTypes';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrency, EXCHANGE_RATE } from '@/utils/currency';
import StarRating from '@/components/products/StarRating';

export default function ShopPage() {
  const { slug } = useParams<{ slug: string }>();
  const { currency: userCurrency } = useCurrency();
  const [products, setProducts] = useState<Product[]>([]);
  const [affiliateProducts, setAffiliateProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const profile = await getUserByUsername(slug ?? '');
        const targetUserId = profile?.userId || profile?.id;
        if (targetUserId) {
          const [all, pinnedIds] = await Promise.all([
            getUserProducts(targetUserId),
            Promise.resolve(profile.pinnedAffiliates || [])
          ]);
          setProducts(all.filter(p => p.status === 'active'));
          
          if (pinnedIds.length > 0) {
            const pinnedDocs = await Promise.all(
              pinnedIds.map((id: string) => getProduct(id).catch(() => null))
            );
            setAffiliateProducts(pinnedDocs.filter((p): p is Product => p !== null && p.status === 'active'));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [slug]);

  const formatPrice = (price: number, productCurrency: string) => {
    let displayPrice = price;
    let displayCurrency = productCurrency as any;
    if (productCurrency === 'NGN' && userCurrency === 'USD') { displayPrice = price / EXCHANGE_RATE; displayCurrency = 'USD'; }
    else if (productCurrency === 'USD' && userCurrency === 'NGN') { displayPrice = price * EXCHANGE_RATE; displayCurrency = 'NGN'; }
    return formatCurrency(displayPrice, displayCurrency);
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-12">
      {/* ── Personal Products ────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60 px-1">Shop</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.length > 0 ? products.map(product => (
            <Link key={product.id} href={`/${slug}/product/${product.slug || product.id}`}
              className="group block border rounded-2xl p-4 border-border hover:shadow-md hover:border-primary/30 transition-all bg-card/30 backdrop-blur-sm">
              <div className="w-full aspect-square overflow-hidden rounded-xl bg-muted mb-3">
                {product.thumbnail ? (
                  <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <h4 className="font-semibold text-sm text-foreground line-clamp-1">{product.name}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <StarRating rating={product.rating} count={product.reviewsCount} />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between mt-2">
                <Badge variant="secondary" className="text-[10px] font-bold uppercase">{getProductTypeLabel(product.category)}</Badge>
                <span className="font-bold text-sm text-foreground">{formatPrice(product.price, product.currency || 'NGN')}</span>
              </div>
            </Link>
          )) : (
            <div className="col-span-full rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No products yet.</div>
          )}
        </div>
      </section>

      {/* ── Affiliate/Pinned Products ─────────────────── */}
      {affiliateProducts.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60 px-1">Picks for you</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {affiliateProducts.map(product => (
              <Link key={product.id} href={`/product/${product.slug || product.id}`}
                className="group block border rounded-2xl p-4 border-border hover:shadow-md hover:border-primary/30 transition-all bg-muted/10">
                <div className="w-full aspect-square overflow-hidden rounded-xl bg-muted mb-3 relative">
                  {product.thumbnail ? (
                    <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-primary text-primary-foreground border-none text-[10px] font-bold uppercase shadow-lg">Recommended</Badge>
                  </div>
                </div>
                <h4 className="font-semibold text-sm text-foreground line-clamp-1">{product.name}</h4>
                <div className="mt-1">
                  <StarRating rating={product.rating} count={product.reviewsCount} />
                </div>
                <div className="flex items-center justify-between mt-2">
                   <div className="flex flex-col">
                     <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Promoted by {slug}</span>
                     <span className="font-bold text-sm text-foreground">{formatPrice(product.price, product.currency || 'NGN')}</span>
                   </div>
                   <Badge variant="outline" className="text-[9px] pointer-events-none">Affiliate</Badge>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
