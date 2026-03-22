"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useParams } from 'next/navigation';
import { getUserByUsername } from '@/services/userService';
import { getUserProducts, Product } from '@/services/productsService';
import { getProductTypeLabel } from '@/lib/productTypes';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrency, EXCHANGE_RATE } from '@/utils/currency';

export default function ShopPage() {
  const { slug } = useParams<{ slug: string }>();
  const { currency: userCurrency } = useCurrency();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const profile = await getUserByUsername(slug ?? '');
        if (profile?.userId || profile?.id) {
          const all = await getUserProducts(profile.userId || profile.id);
          setProducts(all.filter(p => p.status === 'active'));
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.length > 0 ? products.map(product => (
        <Link key={product.id} href={`/${slug}/product/${product.slug || product.id}`}
          className="group block border rounded-xl p-4 border-border hover:shadow-md hover:border-primary/30 transition-all">
          <div className="w-full aspect-square overflow-hidden rounded-lg bg-muted mb-3">
            {product.thumbnail ? (
              <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
          </div>
          <h4 className="font-semibold text-sm text-foreground line-clamp-1">{product.name}</h4>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{product.description}</p>
          <div className="flex items-center justify-between mt-2">
            <Badge variant="secondary" className="text-xs">{getProductTypeLabel(product.category)}</Badge>
            <span className="font-bold text-sm text-foreground">{formatPrice(product.price, product.currency || 'NGN')}</span>
          </div>
        </Link>
      )) : (
        <div className="col-span-full rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No products yet.</div>
      )}
    </div>
  );
}
