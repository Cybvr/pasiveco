"use client";

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingBag, ArrowLeft, Trash2, Plus, Minus, ShoppingCart, ShieldCheck, Truck, Package } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrency, convertAmount } from '@/utils/currency';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export default function CartPage() {
  const { username } = useParams<{ username: string }>();
  const router = useRouter();
  const { items, removeItem, updateQuantity, cartTotal, cartCount } = useCart();
  const { currency: userCurrency, rates } = useCurrency();

  const formattedTotal = formatCurrency(
    convertAmount(cartTotal, 'NGN', userCurrency as any, rates),
    userCurrency as any
  );

  if (cartCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
          <ShoppingCart className="w-12 h-12 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground max-w-sm">
          Looks like you haven't added anything to your cart yet. Explore the shop to find something you like!
        </p>
        <Link href={`/${username}/shop`} className="mt-8">
          <Button size="lg" className="px-8">
            Go to Shop
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/${username}`} className="p-2 rounded-full hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
        <Badge variant="secondary" className="ml-2 px-3 py-1 text-sm">
          {cartCount} {cartCount === 1 ? 'item' : 'items'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border bg-card/50 overflow-hidden">
            <div className="p-6 space-y-8">
              {items.map((item, index) => {
                const itemPrice = formatCurrency(
                  convertAmount(item.price, item.currency as any || 'NGN', userCurrency as any, rates),
                  userCurrency as any
                );
                const itemTotal = formatCurrency(
                  convertAmount(item.price * item.quantity, item.currency as any || 'NGN', userCurrency as any, rates),
                  userCurrency as any
                );

                return (
                  <React.Fragment key={item.id}>
                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="w-full sm:w-32 aspect-square rounded-xl overflow-hidden border bg-muted shrink-0">
                        <img
                          src={item.thumbnail}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div className="flex justify-between gap-4">
                          <div className="space-y-1">
                            <h3 className="font-bold text-lg leading-tight">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">Seller: @{username}</p>
                          </div>
                          <p className="font-bold text-lg">{itemTotal}</p>
                        </div>

                        <div className="flex items-center justify-between mt-4 sm:mt-0">
                          <div className="flex items-center border rounded-lg p-1 bg-background">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-10 text-center font-bold text-sm">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                    {index < items.length - 1 && <Separator />}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-xl border bg-muted/30">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <div className="text-xs">
                <p className="font-bold">Secure Payment</p>
                <p className="text-muted-foreground">SSL Encrypted checkout</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl border bg-muted/30">
              <Truck className="w-5 h-5 text-primary" />
              <div className="text-xs">
                <p className="font-bold">Instant Delivery</p>
                <p className="text-muted-foreground">Digital goods sent via email</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl border bg-muted/30">
              <Package className="w-5 h-5 text-primary" />
              <div className="text-xs">
                <p className="font-bold">24/7 Support</p>
                <p className="text-muted-foreground">We're here to help</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <div className="rounded-2xl border bg-card p-6 shadow-sm sticky top-8">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal ({cartCount} items)</span>
                <span className="font-medium">{formattedTotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Taxes</span>
                <span>$0.00</span>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-base font-bold text-foreground">Total</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Including VAT</p>
                </div>
                <p className="text-2xl font-black text-primary">{formattedTotal}</p>
              </div>

              <Button 
                className="w-full h-14 text-lg font-bold mt-6 shadow-lg shadow-primary/20" 
                size="lg"
                onClick={() => router.push(`/${username}/checkout`)}
              >
                Proceed to Checkout
              </Button>
              
              <Link href={`/${username}/shop`} className="block">
                <Button variant="ghost" className="w-full mt-2">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
