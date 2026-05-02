"use client";

import React from 'react';
import { ShoppingCart, X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrency, convertAmount } from '@/utils/currency';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
}

export default function CartDrawer({ isOpen, onClose, username }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, cartTotal, cartCount } = useCart();
  const { currency: userCurrency, rates } = useCurrency();
  const router = useRouter();

  const formattedTotal = formatCurrency(
    convertAmount(cartTotal, 'NGN', userCurrency as any, rates),
    userCurrency as any
  );

  const handleCheckout = () => {
    onClose();
    // Redirect to a general checkout or the first item's seller checkout
    // For now, let's assume we checkout through the current storefront's user
    router.push(`/${username}/checkout`);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="flex flex-col w-full sm:max-w-md p-0 gap-0">
        <SheetHeader className="p-6 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Your Cart
              {cartCount > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-primary text-primary-foreground rounded-full">
                  {cartCount}
                </span>
              )}
            </SheetTitle>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">Your cart is empty</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Looks like you haven't added anything to your cart yet.
              </p>
              <Button variant="outline" className="mt-6" onClick={onClose}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {items.map((item) => {
                const itemPrice = formatCurrency(
                  convertAmount(item.price, item.currency as any || 'NGN', userCurrency as any, rates),
                  userCurrency as any
                );

                return (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden border bg-muted shrink-0">
                      <img
                        src={item.thumbnail}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="font-medium text-sm line-clamp-1">{item.name}</h4>
                      <p className="text-sm font-bold text-primary">{itemPrice}</p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border rounded-md">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-muted transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-muted transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {items.length > 0 && (
          <SheetFooter className="p-6 border-t bg-muted/30">
            <div className="w-full space-y-4">
              <div className="flex items-center justify-between text-base font-semibold">
                <span>Subtotal</span>
                <span>{formattedTotal}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Shipping and taxes calculated at checkout.
              </p>
              <div className="space-y-2 pt-2">
                <Button className="w-full h-12 text-base font-bold" onClick={handleCheckout}>
                  Checkout Now
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full h-10 text-sm font-medium" 
                  onClick={() => {
                    onClose();
                    router.push(`/${username}/cart`);
                  }}
                >
                  View full cart
                </Button>
              </div>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
