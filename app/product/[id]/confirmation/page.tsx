"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Loader2, Package, Receipt, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getProduct, Product } from '@/services/productsService';
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

export default function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference') || '';

  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verificationLoading, setVerificationLoading] = useState(true);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paidAmount, setPaidAmount] = useState<number | null>(null);

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
        console.error('Error fetching confirmation data:', fetchError);
      } finally {
        setLoading(false);
      }
    };

    resolveParams();
  }, [params]);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference) {
        setVerificationMessage('Reference unavailable.');
        setVerificationLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/paystack/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || data.message || 'Verification failed');
        }

        const transaction = data.transaction;
        setVerificationMessage(transaction.status === 'success' ? 'Payment verified' : 'Payment received');
        setCustomerEmail(transaction.customer?.email || '');
        setPaidAmount(typeof transaction.amount === 'number' ? transaction.amount / 100 : null);
      } catch (error) {
        console.error('Error verifying payment:', error);
        setVerificationMessage('Payment received. Confirmation is still being finalized.');
      } finally {
        setVerificationLoading(false);
      }
    };

    verifyPayment();
  }, [reference]);

  const orderTotal = useMemo(() => {
    if (paidAmount && product?.currency) {
      return formatPrice(paidAmount, product.currency);
    }

    if (product) {
      return formatPrice(product.price, product.currency || 'NGN');
    }

    return '';
  }, [paidAmount, product]);

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
          <h1 className="mb-2 text-2xl font-semibold">Order not found</h1>
          <p className="mb-5 text-muted-foreground">We could not load this order confirmation.</p>
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
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 md:px-6 md:py-10">
        <Link
          href={`/product/${product.id}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to product
        </Link>

        <section className="space-y-5 border-b pb-6">
          <div className="flex items-center gap-3 text-primary">
            <CheckCircle2 className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Order confirmed</h1>
              <p className="mt-1 text-sm text-muted-foreground">Your payment has been received and this order is ready.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Badge variant="secondary">{verificationLoading ? 'Verifying payment...' : verificationMessage}</Badge>
            {reference ? <Badge variant="outline">Ref: {reference}</Badge> : null}
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <section className="space-y-5">
            <div className="overflow-hidden rounded-2xl border bg-muted/30">
              {product.thumbnail ? (
                <img src={product.thumbnail} alt={product.name} className="aspect-[4/5] w-full object-cover" />
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center bg-muted">
                  <Package className="h-14 w-14 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="space-y-3 border-b pb-5">
              <h2 className="text-2xl font-semibold">{product.name}</h2>
              <p className="leading-7 text-muted-foreground">{product.description}</p>
            </div>
          </section>

          <section className="space-y-5">
            <div className="space-y-4 border-b pb-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Order total</span>
                <span className="text-base font-semibold text-foreground">{orderTotal}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Payment reference</span>
                <span>{reference || '—'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Receipt email</span>
                <span>{customerEmail || '—'}</span>
              </div>
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

            <div className="grid gap-3 sm:grid-cols-2">
              <Link href={`/product/${product.id}`} className="block">
                <Button variant="outline" className="w-full">
                  <Package className="mr-2 h-4 w-4" />
                  View product
                </Button>
              </Link>
              <Link href={sellerHref} className="block">
                <Button className="w-full">
                  <Receipt className="mr-2 h-4 w-4" />
                  Back to store
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
