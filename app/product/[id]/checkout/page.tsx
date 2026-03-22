"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, Loader2, Package, ShieldCheck, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getProduct, Product } from '@/services/productsService';
import { getUser } from '@/services/userService';
import { initializePaystackPayment } from '@/services/paystackService';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrency, EXCHANGE_RATE } from '@/utils/currency';

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

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setBuyerName(user.displayName || '');
      setBuyerEmail(user.email || '');
    }
  }, [user]);

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      try {
        const productData = await getProduct(resolvedParams.id);
        if (productData) {
          setProduct(productData);
          const sellerProfile = await getUser(productData.userId);
          setSeller(sellerProfile);
        }
      } catch (err) {
        console.error('Error fetching checkout data:', err);
      } finally {
        setLoading(false);
      }
    };
    resolveParams();
  }, [params]);

  const { currency: userCurrency } = useCurrency();
  const formattedPrice = useMemo(() => {
    if (!product) return '';
    return formatPrice(product.price, product.currency || 'NGN', userCurrency);
  }, [product, userCurrency]);

  const handlePay = async () => {
    if (!product) return;

    if (!user) {
      router.push(`/auth/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!buyerName.trim() || !buyerEmail.trim()) {
      setError('Name and email are required.');
      return;
    }

    if (!(window as any).PaystackPop) {
      setError('Paystack is unavailable right now.');
      return;
    }

    setError('');
    setPaymentLoading(true);

    try {
      initializePaystackPayment(
        buyerEmail,
        product.price,
        product.id || '',
        product.name,
        async (reference: string) => {
          try {
            const verifyResponse = await fetch('/api/paystack/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ reference }),
            });
            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok || !verifyData.success) {
              throw new Error(verifyData.error || verifyData.message || 'Verification failed');
            }

            router.push(`/product/${product.id}/confirmation?reference=${encodeURIComponent(reference)}`);
          } catch (verificationError) {
            console.error('Payment verification error:', verificationError);
            setError('Payment succeeded but confirmation is pending. Check your email.');
          } finally {
            setPaymentLoading(false);
          }
        },
        () => {
          setPaymentLoading(false);
        },
        {
          currency: product.currency || 'NGN',
          customerName: buyerName,
          customerPhone: buyerPhone,
          orderNote: notes,
        }
      );
    } catch (paymentError) {
      console.error('Payment initialization failed:', paymentError);
      setError('Could not open Paystack. Please try again.');
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="text-center">
          <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <h1 className="mb-2 text-2xl font-semibold">Checkout unavailable</h1>
          <p className="mb-5 text-muted-foreground">This product could not be loaded.</p>
          <Link href="/">
            <Button variant="outline">Back to store</Button>
          </Link>
        </div>
      </div>
    );
  }

  const sellerHref = seller?.username ? `/${seller.username.replace('@', '')}` : '/';

  return (
    <main className="min-h-screen bg-muted/30">
      {/* Top nav bar */}
      <div className="border-b bg-background px-4 py-4 md:px-8">
        <div className="mx-auto max-w-6xl">
          <Link
            href={`/product/${product.id}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to product
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete your details and pay securely via Paystack.
          </p>
        </div>

        {/* Two-column layout: form left, summary right */}
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

          {/* LEFT — Contact + billing form */}
          <div className="space-y-6">
            {!user ? (
              <div className="rounded-xl border bg-background p-6">
                <h2 className="text-base font-semibold">Sign in to continue</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  You need to be logged in to complete this purchase.
                </p>
                <Button
                  className="mt-4 w-full sm:w-auto"
                  onClick={() => router.push(`/auth/login?next=${encodeURIComponent(pathname)}`)}
                >
                  Log in to pay
                </Button>
              </div>
            ) : (
              <>
                {/* Contact details */}
                <div className="rounded-xl border bg-background p-6">
                  <h2 className="mb-4 text-base font-semibold">Contact details</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="buyer-name">Full name</Label>
                      <Input
                        id="buyer-name"
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="buyer-email">Email address</Label>
                      <Input
                        id="buyer-email"
                        type="email"
                        value={buyerEmail}
                        onChange={(e) => setBuyerEmail(e.target.value)}
                        placeholder="you@example.com"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="buyer-phone">
                        Phone{' '}
                        <span className="font-normal text-muted-foreground">(optional)</span>
                      </Label>
                      <Input
                        id="buyer-phone"
                        type="tel"
                        value={buyerPhone}
                        onChange={(e) => setBuyerPhone(e.target.value)}
                        placeholder="+234 000 000 0000"
                      />
                    </div>
                  </div>
                </div>

                {/* Order note */}
                <div className="rounded-xl border bg-background p-6">
                  <h2 className="mb-4 text-base font-semibold">
                    Order note{' '}
                    <span className="text-sm font-normal text-muted-foreground">(optional)</span>
                  </h2>
                  <Textarea
                    id="order-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any instructions or notes for the seller..."
                    className="min-h-24 resize-none"
                  />
                </div>

                {/* Error — mobile only (desktop error lives in the summary column) */}
                {error && (
                  <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive lg:hidden">
                    {error}
                  </p>
                )}

                {/* Pay button — mobile only */}
                <div className="lg:hidden">
                  <Button
                    className="h-12 w-full text-base font-medium"
                    size="lg"
                    onClick={handlePay}
                    disabled={paymentLoading}
                  >
                    {paymentLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Opening Paystack...</>
                    ) : (
                      <><CreditCard className="mr-2 h-4 w-4" /> Pay {formattedPrice}</>
                    )}
                  </Button>
                  <div className="mt-3 text-center">
                    <Link
                      href={sellerHref}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Continue shopping
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* RIGHT — Order summary (sticky on desktop) */}
          <div className="space-y-4 lg:sticky lg:top-8 lg:self-start">
            <div className="overflow-hidden rounded-xl border bg-background">
              {/* Product image */}
              {product.thumbnail ? (
                <img
                  src={product.thumbnail}
                  alt={product.name}
                  className="aspect-video w-full object-cover"
                />
              ) : (
                <div className="flex aspect-video w-full items-center justify-center bg-muted">
                  <Package className="h-10 w-10 text-muted-foreground" />
                </div>
              )}

              <div className="space-y-4 p-5">
                {/* Product name + price */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold leading-snug">{product.name}</p>
                    {product.category && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{product.category}</p>
                    )}
                  </div>
                  <p className="shrink-0 font-semibold">{formattedPrice}</p>
                </div>

                {/* Description */}
                {product.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {product.description}
                  </p>
                )}

                {/* Seller */}
                {seller && (
                  <div className="flex items-center gap-2.5 border-t pt-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                      {seller.profilePicture ? (
                        <img
                          src={seller.profilePicture}
                          alt={seller.username}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{seller.displayName || seller.username}</p>
                      <p className="text-xs text-muted-foreground">Seller</p>
                    </div>
                  </div>
                )}

                {/* Price breakdown */}
                <div className="space-y-2 border-t pt-4 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formattedPrice}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Fees</span>
                    <span>—</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-semibold text-foreground">
                    <span>Total due</span>
                    <span>{formattedPrice}</span>
                  </div>
                </div>

                {/* Trust signal */}
                <div className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-foreground" />
                  Card details are entered securely in the Paystack popup.
                </div>
              </div>
            </div>

            {/* Pay button — desktop only */}
            {user && (
              <div className="hidden lg:block space-y-3">
                {error && (
                  <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                  </p>
                )}
                <Button
                  className="h-12 w-full text-base font-medium"
                  size="lg"
                  onClick={handlePay}
                  disabled={paymentLoading}
                >
                  {paymentLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Opening Paystack...</>
                  ) : (
                    <><CreditCard className="mr-2 h-4 w-4" /> Pay {formattedPrice}</>
                  )}
                </Button>
                <div className="text-center">
                  <Link
                    href={sellerHref}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Continue shopping
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}