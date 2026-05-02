"use client";

import React, { useState, useEffect } from 'react';
import { getUserByUsername } from '@/services/userService';
import { getSocialProfileByUsername } from '@/lib/social-data';
import { useParams, useRouter } from 'next/navigation';
import { getUserProducts, Product } from '@/services/productsService';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrency, convertAmount } from '@/utils/currency';
import { Package, Plus, Zap, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Link from 'next/link';

export default function LinksPage() {
  const { username } = useParams<{ username: string }>();
  const [links, setLinks] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem, setIsOpen } = useCart();
  const { currency: userCurrency, rates } = useCurrency();

  const router = useRouter();

  useEffect(() => {
    const fetch = async () => {
      try {
        const [firebaseProfile, socialProfile] = await Promise.all([
          getUserByUsername(username),
          getSocialProfileByUsername(username),
        ]);
        const profile = firebaseProfile || socialProfile;
        
        // Canonical URL redirection
        if (profile?.username && profile.username !== username) {
          router.replace(`/${profile.username}`);
          return;
        }

        setLinks((profile?.links || []).filter((l: any) => l.active));

        // Fetch products if user exists
        const userId = profile?.userId || profile?.id;
        if (userId) {
          const allProducts = await getUserProducts(userId);
          setProducts(allProducts.filter(p => p.status === 'active').slice(0, 3)); // Show top 3 products
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [username, router]);

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

  const formatPrice = (price: number, productCurrency: string) => {
    return formatCurrency(
      convertAmount(price, (productCurrency || 'NGN') as any, userCurrency, rates),
      userCurrency
    );
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="space-y-3">
        {links.length > 0 ? links.map((link: any) => (
          <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
            className="w-full flex items-center gap-3 border border-border rounded-lg p-4 text-base hover:bg-muted/50 hover:border-muted-foreground transition-colors bg-card/50">
            <img src={link.thumbnail} alt={link.title} className="w-5 h-5 object-contain"
              onError={e => { e.currentTarget.src = '/images/pages/website.svg' }} />
            <span className="font-medium text-foreground">{link.title}</span>
          </a>
        )) : (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No links yet.</div>
        )}
      </div>

      {products.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">Featured Store</h2>
            <Link href={`/${username}/shop`} className="text-xs font-semibold text-primary hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {products.map(product => (
              <Link key={product.id} href={`/${username}/product/${product.slug || product.id}`}
                className="group flex items-center gap-4 border rounded-2xl p-3 border-border hover:shadow-md hover:border-primary/30 transition-all bg-card/30 backdrop-blur-sm relative overflow-hidden">
                <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-xl bg-muted relative">
                  {product.thumbnail ? (
                    <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0 pr-2">
                  <h4 className="font-semibold text-sm text-foreground line-clamp-1">{product.name}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{formatPrice(product.price, product.currency || 'NGN')}</p>
                  
                  <div className="flex gap-2 mt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 text-[10px] px-2 font-bold flex-1"
                      onClick={(e) => handleAddToCart(e, product)}
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Add
                    </Button>
                    <Button 
                      size="sm" 
                      className="h-8 text-[10px] px-2 font-bold flex-1 bg-primary text-primary-foreground"
                      onClick={(e) => handleBuyNow(e, product)}
                    >
                      <Zap className="mr-1 h-3 w-3 fill-current" />
                      Buy
                    </Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
