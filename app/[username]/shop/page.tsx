"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, ShoppingCart, Zap, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { getUserByUsername } from '@/services/userService';
import { getUserProducts, Product, getProduct } from '@/services/productsService';
import { getProductTypeLabel } from '@/lib/productTypes';
import { useCurrency } from '@/context/CurrencyContext';
import { useCart } from '@/context/CartContext';
import { formatCurrency, convertAmount } from '@/utils/currency';
import StarRating from '@/components/products/StarRating';

export default function ShopPage() {
  const { username } = useParams<{ username: string }>();
  const { currency: userCurrency, rates } = useCurrency();
  const { addItem, setIsOpen } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [affiliateProducts, setAffiliateProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success('Added to cart!', {
      description: `${product.name} is now in your cart.`,
      action: {
        label: 'View Cart',
        onClick: () => setIsOpen(true),
      },
    });
  };

  const handleBuyNow = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setIsOpen(true);
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        const profile = await getUserByUsername(username ?? '');
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
  }, [username]);

  const formatPrice = (price: number, productCurrency: string) => {
    return formatCurrency(
      convertAmount(price, (productCurrency || 'NGN') as any, userCurrency, rates),
      userCurrency
    );
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-12">
      {/* ── Personal Products ────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60 px-1">Shop</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.length > 0 ? products.map(product => (
            <Link key={product.id} href={`/${username}/product/${product.slug || product.id}`}
              className="group block border rounded-2xl p-4 border-border hover:shadow-md hover:border-primary/30 transition-all bg-card/30 backdrop-blur-sm relative overflow-hidden">
              <div className="w-full aspect-square overflow-hidden rounded-xl bg-muted mb-3 relative">
                {product.thumbnail ? (
                  <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                {/* Overlay buttons on hover for desktop, or always visible on mobile if needed */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 px-4">
                  <Button 
                    className="w-full h-9 text-xs font-bold bg-white text-black hover:bg-zinc-200" 
                    onClick={(e) => handleAddToCart(e, product)}
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Add to Cart
                  </Button>
                  <Button 
                    className="w-full h-9 text-xs font-bold bg-primary text-primary-foreground"
                    onClick={(e) => handleBuyNow(e, product)}
                  >
                    <Zap className="mr-1.5 h-3.5 w-3.5 fill-current" />
                    Buy Now
                  </Button>
                </div>
              </div>
              <h4 className="font-semibold text-sm text-foreground line-clamp-1">{product.name}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <StarRating rating={product.rating} count={product.reviewsCount} />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between mt-2">
                <Badge variant="secondary" className="text-[10px] font-bold uppercase">{getProductTypeLabel(product.category)}</Badge>
                <div className="flex flex-col items-end">
                  <span className="font-bold text-sm text-foreground">{formatPrice(product.price, product.currency || 'NGN')}</span>
                  {/* Mobile Quick Action Buttons - Visible when not hovering or on touch devices */}
                  <div className="flex gap-1 mt-1 sm:hidden">
                     <button onClick={(e) => handleAddToCart(e, product)} className="p-1 rounded-full bg-muted text-foreground"><Plus size={14} /></button>
                     <button onClick={(e) => handleBuyNow(e, product)} className="p-1 rounded-full bg-primary text-primary-foreground"><ShoppingCart size={14} /></button>
                  </div>
                </div>
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
              <Link key={product.id} href={`/${username}/product/${product.slug || product.id}`}
                className="group block border rounded-2xl p-4 border-border hover:shadow-md hover:border-primary/30 transition-all bg-muted/10 relative overflow-hidden">
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
                  {/* Overlay buttons on hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 px-4">
                    <Button 
                      className="w-full h-9 text-xs font-bold bg-white text-black hover:bg-zinc-200" 
                      onClick={(e) => handleAddToCart(e, product)}
                    >
                      <Plus className="mr-1.5 h-3.5 w-3.5" />
                      Add to Cart
                    </Button>
                    <Button 
                      className="w-full h-9 text-xs font-bold bg-primary text-primary-foreground"
                      onClick={(e) => handleBuyNow(e, product)}
                    >
                      <Zap className="mr-1.5 h-3.5 w-3.5 fill-current" />
                      Buy Now
                    </Button>
                  </div>
                </div>
                <h4 className="font-semibold text-sm text-foreground line-clamp-1">{product.name}</h4>
                <div className="mt-1">
                  <StarRating rating={product.rating} count={product.reviewsCount} />
                </div>
                <div className="flex items-center justify-between mt-2">
                   <div className="flex flex-col">
                     <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Promoted by {username}</span>
                     <span className="font-bold text-sm text-foreground">{formatPrice(product.price, product.currency || 'NGN')}</span>
                   </div>
                   <div className="flex flex-col items-end gap-2">
                     <Badge variant="outline" className="text-[9px] pointer-events-none">Affiliate</Badge>
                     {/* Mobile Quick Action Buttons */}
                     <div className="flex gap-1 sm:hidden">
                        <button onClick={(e) => handleAddToCart(e, product)} className="p-1 rounded-full bg-muted text-foreground"><Plus size={14} /></button>
                        <button onClick={(e) => handleBuyNow(e, product)} className="p-1 rounded-full bg-primary text-primary-foreground"><ShoppingCart size={14} /></button>
                     </div>
                   </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
