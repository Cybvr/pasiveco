"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, Loader2, Package, ShieldCheck, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getProduct, Product } from '@/services/productsService';
import { getUser } from '@/services/userService';
import { initializePaystackPayment } from '@/services/paystackService';
import { useAuth } from '@/hooks/useAuth';

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

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuth();
  const router = useRouter();

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
      } catch (fetchError) {
        console.error('Error fetching checkout data:', fetchError);
      } finally {
        setLoading(false);
      }
    };

    resolveParams();
  }, [params]);

  const formattedPrice = useMemo(() => {
    if (!product) return '';
    return formatPrice(product.price, product.currency || 'NGN');
  }, [product]);

  const handlePay = async () => {
    if (!product) return;

    if (!buyerName.trim() || !buyerEmail.trim()) {
      setError('Enter buyer name and email to continue.');
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
            setError('Payment succeeded, but confirmation could not be completed yet.');
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
            <Button variant="outline">Back</Button>
          </Link>
        </div>
      </div>
    );
  }

  const sellerHref = seller?.username ? `/${seller.username.replace('@', '')}` : '/';

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 md:px-6 md:py-10">
        <Link
          href={`/product/${product.id}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to product
        </Link>

        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="space-y-5 lg:pr-8">
            <div className="space-y-3 border-b pb-5">
              <p className="text-sm text-muted-foreground">Checkout</p>
              <h1 className="text-3xl font-semibold tracking-tight">Complete your order</h1>
              <p className="text-muted-foreground">Review the product, confirm your details, then pay with Paystack.</p>
            </div>

            <div className="overflow-hidden rounded-2xl border bg-muted/30">
              {product.thumbnail ? (
                <img src={product.thumbnail} alt={product.name} className="aspect-[4/5] w-full object-cover" />
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center bg-muted">
                  <Package className="h-14 w-14 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="space-y-4 border-b pb-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">{product.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{product.category}</p>
                </div>
                <div className="text-xl font-semibold">{formattedPrice}</div>
              </div>
              <p className="leading-7 text-muted-foreground">{product.description}</p>
            </div>

            {seller && (
              <div className="flex items-center gap-3 border-b pb-5">
                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-muted">
                  {seller.profilePicture ? (
                    <img src={seller.profilePicture} alt={seller.username} className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{seller.displayName || seller.username}</p>
                  <p className="text-sm text-muted-foreground">Seller</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-foreground" />
              Card entry is handled securely in the Paystack popup.
            </div>
          </section>

          <section className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="buyer-name">Buyer name</Label>
                <Input id="buyer-name" value={buyerName} onChange={(event) => setBuyerName(event.target.value)} placeholder="Full name" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="buyer-email">Email</Label>
                <Input id="buyer-email" type="email" value={buyerEmail} onChange={(event) => setBuyerEmail(event.target.value)} placeholder="you@example.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="buyer-phone">Phone</Label>
                <Input id="buyer-phone" value={buyerPhone} onChange={(event) => setBuyerPhone(event.target.value)} placeholder="Phone number" />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="order-notes">Order note</Label>
                <Textarea id="order-notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional note" className="min-h-28 resize-none" />
              </div>
            </div>

            <div className="space-y-4 border-y py-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Product</span>
                <span>{product.name}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Buyer</span>
                <span>{buyerName || '—'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Email</span>
                <span>{buyerEmail || '—'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="text-base font-semibold text-foreground">{formattedPrice}</span>
              </div>
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <Button className="h-12 w-full" size="lg" onClick={handlePay} disabled={paymentLoading}>
              {paymentLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
              {paymentLoading ? 'Opening Paystack...' : `Pay ${formattedPrice}`}
            </Button>

            <Link href={sellerHref} className="inline-flex text-sm text-muted-foreground transition-colors hover:text-foreground">
              Continue shopping
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}
