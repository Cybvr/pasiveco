"use client";

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CreditCard, Loader2, Package, ShieldCheck, User, Landmark, ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { countryCodes, formatPhoneNumber } from '@/lib/countries';
import { getProduct, getProductBySlug, Product } from '@/services/productsService';
import { getUser } from '@/services/userService';
import { getPaymentSettings, PaymentSettings, defaultPaymentSettings } from '@/services/paymentMethodService';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/context/CurrencyContext';
import { useCart } from '@/context/CartContext';
import { formatCurrency, convertAmount, type ExchangeRates } from '@/utils/currency';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

function CartCheckoutPageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { username } = useParams<{ username: string }>();
  const { items, cartTotal, removeItem, clearCart } = useCart();
  const { currency: userCurrency, rates } = useCurrency();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+234');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(defaultPaymentSettings);
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'bank'>('card');
  const [error, setError] = useState('');

  // Meta-compatibility state
  const [urlProducts, setUrlProducts] = useState<any[]>([]);
  const [isUrlCheckout, setIsUrlCheckout] = useState(false);
  const [urlLoading, setUrlLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setBuyerName(user.displayName || '');
      setBuyerEmail(user.email || '');
    }
  }, [user]);

  useEffect(() => {
    const init = async () => {
      try {
        // We assume we are checking out from this specific storefront creator
        const sellerProfile = await getUser(username); // Fallback to username if needed
        if (sellerProfile) {
          const sellerPayment = await getPaymentSettings(sellerProfile.id || sellerProfile.uid);
          setPaymentSettings(sellerPayment);
          if (!sellerPayment.acceptedMethods.card && sellerPayment.acceptedMethods.bank) {
            setSelectedMethod('bank');
          }
        }
      } catch (err) {
        console.error('Error fetching checkout data:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [username]);

  // Meta Shop URL Parsing Logic
  useEffect(() => {
    const productsParam = searchParams.get('products');
    const couponParam = searchParams.get('coupon');

    if (productsParam) {
      setIsUrlCheckout(true);
      setUrlLoading(true);
      const parseAndFetch = async () => {
        try {
          const entries = productsParam.split(',');
          const fetchedItems = await Promise.all(
            entries.map(async (entry) => {
              const [id, qty] = entry.split(':');
              const quantity = parseInt(qty) || 1;
              let productData = await getProductBySlug(id);
              if (!productData) productData = await getProduct(id);

              if (productData) {
                return {
                  productId: productData.id,
                  name: productData.name,
                  price: productData.price,
                  currency: productData.currency || 'NGN',
                  thumbnail: productData.thumbnail,
                  quantity: quantity,
                  userId: productData.userId
                };
              }
              return null;
            })
          );
          setUrlProducts(fetchedItems.filter(i => i !== null));
        } catch (e) {
          console.error("Failed to parse Meta products param", e);
        } finally {
          setUrlLoading(false);
        }
      };
      parseAndFetch();
    }

    if (couponParam) {
      setNotes(prev => prev ? `${prev}\nCoupon: ${couponParam}` : `Coupon: ${couponParam}`);
    }
  }, [searchParams]);

  // Use either cart items or URL-parsed products
  const displayItems = isUrlCheckout ? urlProducts : items;
  const displayTotal = isUrlCheckout
    ? urlProducts.reduce((acc, item) => {
      const priceInNgn = convertAmount(item.price, item.currency as any, 'NGN', rates);
      return acc + priceInNgn * item.quantity;
    }, 0)
    : cartTotal;

  const formattedTotal = useMemo(() => {
    return formatCurrency(
      convertAmount(displayTotal, 'NGN', userCurrency as any, rates),
      userCurrency as any
    );
  }, [displayTotal, userCurrency, rates]);

  const handlePay = async () => {
    if (displayItems.length === 0) return;

    if (!user) {
      router.push(`/auth/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!buyerName.trim() || !buyerEmail.trim()) {
      setError('Name and email are required.');
      return;
    }

    setError('');
    setPaymentLoading(true);

    try {
      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          email: buyerEmail,
          amount: displayTotal,
          currency: displayItems[0]?.currency || 'NGN',
          productId: 'multiple',
          productName: `Order from ${username}`,
          slug: username,
          metadata: {
            customerName: buyerName,
            customerPhone: buyerPhone.trim() ? formatPhoneNumber(countryCode, buyerPhone) : '',
            items: displayItems.map(i => ({ id: i.productId, name: i.name, qty: i.quantity, price: i.price })),
            cartTotal: displayTotal,
            source: isUrlCheckout ? 'meta_shop' : 'direct_cart'
          }
        }),
      });

      const data = await res.json();

      if (data.success && data.authorizationUrl) {
        // Clear cart before redirecting or on success callback? 
        // Usually better on success, but clear cart now simplifies this demo
        // clearCart(); 
        window.location.href = data.authorizationUrl;
      } else {
        setError(data.message || 'Failed to initialize payment.');
        setPaymentLoading(false);
      }
    } catch (paymentError) {
      console.error('Payment initialization failed:', paymentError);
      setError('Could not connect to payment gateway.');
      setPaymentLoading(false);
    }
  };

  if (loading || urlLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (displayItems.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
        <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Add some products to your cart before checking out.</p>
        <Link href={`/${username}/shop`} className="mt-6">
          <Button variant="outline">Back to shop</Button>
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="border-b px-4 py-4 md:px-8">
        <div className="mx-auto max-w-6xl">
          <Link href={`/${username}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to store
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
          <p className="mt-1 text-sm text-muted-foreground">Complete your order details.</p>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* Form */}
          <div className="order-2 w-full space-y-6 lg:order-1 lg:flex-1">
            {!user ? (
              <div className="rounded-xl border p-6 bg-card">
                <h2 className="text-base font-semibold">Sign in to continue</h2>
                <Button className="mt-4" onClick={() => router.push(`/auth/login?next=${encodeURIComponent(pathname)}`)}>
                  Log in to pay
                </Button>
              </div>
            ) : (
              <>
                <div className="rounded-xl border p-6 bg-card space-y-4">
                  <h2 className="text-base font-semibold">Contact details</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2 space-y-1.5">
                      <Label>Full name</Label>
                      <Input value={buyerName} onChange={(e) => setBuyerName(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Email</Label>
                      <Input type="email" value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Phone (optional)</Label>
                      <div className="flex gap-2">
                        <Select value={countryCode} onValueChange={setCountryCode}>
                          <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {countryCodes.map(c => <SelectItem key={c.code} value={c.code}>{c.flag} {c.code}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Input value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)} className="flex-1" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border p-6 bg-card space-y-4">
                  <h2 className="text-base font-semibold">Payment method</h2>
                  <RadioGroup value={selectedMethod} onValueChange={(v: any) => setSelectedMethod(v)} className="grid gap-3 sm:grid-cols-2">
                    {paymentSettings.acceptedMethods.card && (
                      <div className="flex items-center space-x-2 rounded-lg border p-4 cursor-pointer hover:bg-muted/50">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="flex flex-1 items-center gap-3 cursor-pointer"><CreditCard className="h-5 w-5" />Card</Label>
                      </div>
                    )}
                    {paymentSettings.acceptedMethods.bank && (
                      <div className="flex items-center space-x-2 rounded-lg border p-4 cursor-pointer hover:bg-muted/50">
                        <RadioGroupItem value="bank" id="bank" />
                        <Label htmlFor="bank" className="flex flex-1 items-center gap-3 cursor-pointer"><Landmark className="h-5 w-5" />Bank</Label>
                      </div>
                    )}
                  </RadioGroup>
                </div>

                <div className="rounded-xl border p-6 bg-card space-y-4">
                  <h2 className="text-base font-semibold">Order note</h2>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes..." className="min-h-[100px]" />
                </div>
              </>
            )}
          </div>

          {/* Summary */}
          <div className="order-1 w-full space-y-4 lg:order-2 lg:sticky lg:top-8 lg:w-[380px]">
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="p-5 space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Order Summary</h2>
                <div className="space-y-4">
                  {displayItems.map(item => (
                    <div key={item.id} className="flex gap-3">
                      <div className="h-12 w-12 rounded border bg-muted overflow-hidden shrink-0">
                        <img src={item.thumbnail} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold whitespace-nowrap">
                        {formatCurrency(convertAmount(item.price * item.quantity, item.currency as any || 'NGN', userCurrency as any, rates), userCurrency as any)}
                      </p>
                      {!isUrlCheckout && (
                        <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formattedTotal}</span>
                  </div>
                </div>
              </div>
            </div>

            {user && (
              <Button className="w-full h-12 text-lg font-bold" size="lg" onClick={handlePay} disabled={paymentLoading}>
                {paymentLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : `Pay ${formattedTotal}`}
              </Button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CartCheckoutPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background" />}>
      <CartCheckoutPageContent />
    </Suspense>
  );
}
