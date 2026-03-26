"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CreditCard, Loader2, Package, ShieldCheck, User, Landmark, Phone, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getProduct, getProductBySlug, Product } from '@/services/productsService';
import { getUser } from '@/services/userService';
import { getPaymentSettings, PaymentSettings, defaultPaymentSettings } from '@/services/paymentMethodService';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrency, EXCHANGE_RATE } from '@/utils/currency';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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

export default function CheckoutPage({ params }: { params: Promise<{ id: string; slug: string }> }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeParams = useParams<{ slug: string }>();

  const affiliateId = searchParams.get('ref') || '';

  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(defaultPaymentSettings);
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'bank' | 'ussd' | 'qr'>('card');
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
        let productData = await getProductBySlug(resolvedParams.id);
        if (!productData) {
          productData = await getProduct(resolvedParams.id);
        }
        if (productData) {
          setProduct(productData);
          const [sellerProfile, sellerPayment] = await Promise.all([
            getUser(productData.userId),
            getPaymentSettings(productData.userId)
          ]);
          setSeller(sellerProfile);
          setPaymentSettings(sellerPayment);
          
          // Set default selected method based on what's available
          if (!sellerPayment.acceptedMethods.card) {
            if (sellerPayment.acceptedMethods.bank) setSelectedMethod('bank');
          }
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
  
  const buttonLabel = useMemo(() => {
    if (selectedMethod === 'card') return 'Card ending ***4242';
    if (selectedMethod === 'bank' && seller) return `Pay to ${seller.displayName || seller.username}`;
    return `Pay ${formattedPrice}`;
  }, [selectedMethod, seller, formattedPrice]);

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

    setError('');
    setPaymentLoading(true);

    const channels: string[] = [];
    if (selectedMethod === 'card') channels.push('card');
    else if (selectedMethod === 'bank') channels.push('bank', 'bank_transfer');

    try {
      const initializeResponse = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: buyerEmail,
          amount: product.price,
          currency: product.currency || 'NGN',
          productId: product.id || '',
          productName: product.name,
          customerName: buyerName,
          customerPhone: buyerPhone,
          orderNote: notes,
          channels,
          sellerId: product.userId,
          affiliate: affiliateId,
          couponDiscount: 0,
          customCharge: 0,
          variation: '',
          slug: routeParams.slug,
        }),
      });
      const initializeData = await initializeResponse.json();

      if (!initializeResponse.ok || !initializeData.success || !initializeData.authorizationUrl) {
        throw new Error(initializeData.error || initializeData.message || 'Unable to initialize payment');
      }

      window.location.assign(initializeData.authorizationUrl);
    } catch (paymentError) {
      console.error('Payment initialization failed:', paymentError);
      setError('Could not start payment. Please try again.');
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
          <Link href={`/${routeParams.slug}`}>
            <Button variant="outline">Back to store</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Top nav */}
      <div className="border-b px-4 py-4 md:px-8">
        <div className="mx-auto max-w-6xl">
          <Link
            href={`/${routeParams.slug}/product/${product.id}`}
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
            Complete your details, make payment, and continue to your order receipt.
          </p>
        </div>

        {/* Two-column: summary top (mobile), form left, summary right (desktop) */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">

          {/* LEFT — Form */}
          <div className="order-2 w-full space-y-6 lg:order-1 lg:flex-1">
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
                
                {/* Payment Method selection — integrated into the flow */}
                <div className="rounded-xl border bg-background p-6">
                  <h3 className="mb-4 text-base font-semibold">
                    Payment method
                  </h3>
                  <RadioGroup 
                    value={selectedMethod} 
                    onValueChange={(val: any) => setSelectedMethod(val)}
                    className="grid gap-3 sm:grid-cols-2"
                  >
                    {paymentSettings.acceptedMethods.card && (
                      <div className="flex items-center space-x-2 rounded-lg border p-4 transition-colors hover:bg-muted/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="flex flex-1 items-center gap-3 cursor-pointer text-sm font-medium">
                          <CreditCard className="h-5 w-5 text-muted-foreground" />
                          <span>Credit/Debit Card</span>
                        </Label>
                      </div>
                    )}
                    {paymentSettings.acceptedMethods.bank && (
                      <div className="flex items-center space-x-2 rounded-lg border p-4 transition-colors hover:bg-muted/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                        <RadioGroupItem value="bank" id="bank" />
                        <Label htmlFor="bank" className="flex flex-1 items-center gap-3 cursor-pointer text-sm font-medium">
                          <Landmark className="h-5 w-5 text-muted-foreground" />
                          <span>Bank Account</span>
                        </Label>
                      </div>
                    )}
                  </RadioGroup>
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

                {/* Error — mobile */}
                {error && (
                  <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive lg:hidden">
                    {error}
                  </p>
                )}

                {/* Pay button — mobile */}
                <div className="lg:hidden space-y-3">
                  <Button
                    className="h-12 w-full text-base font-medium"
                    size="lg"
                    onClick={handlePay}
                    disabled={paymentLoading}
                  >
                    {paymentLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {buttonLabel}...</>
                    ) : (
                      <><CreditCard className="mr-2 h-4 w-4" /> {buttonLabel}</>
                    )}
                  </Button>
                  <div className="text-center">
                    <Link
                      href={`/${routeParams.slug}`}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Continue shopping
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* RIGHT — Order summary (sticky) */}
          <div className="order-1 w-full space-y-4 lg:order-2 lg:sticky lg:top-8 lg:w-[380px] lg:self-start">
            <div className="overflow-hidden rounded-xl border bg-background">
              <div className="space-y-4 p-5">

                {/* Order items */}
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Order summary
                </h2>

                {/* Single product row — compact thumbnail + title + description */}
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border bg-muted">
                    {product.thumbnail ? (
                      <img
                        src={product.thumbnail}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium leading-snug">{product.name}</p>
                    {product.description && (
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {product.description}
                      </p>
                    )}
                  </div>
                  <p className="shrink-0 text-sm font-semibold">{formattedPrice}</p>
                </div>

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
                  Payments are secure and processed by our backend payment flow.
                </div>
              </div>
            </div>

            {/* Pay button — desktop */}
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
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {buttonLabel}...</>
                  ) : (
                    <><CreditCard className="mr-2 h-4 w-4" /> {buttonLabel}</>
                  )}
                </Button>
                <div className="text-center">
                  <Link
                    href={`/${routeParams.slug}`}
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

      {/* Floating Sticky Pay Bar — mobile only */}
      {user && product && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/80 p-4 backdrop-blur-md lg:hidden">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Total to pay</p>
              <p className="truncate text-lg font-bold">{formattedPrice}</p>
            </div>
            <Button
              className="px-8 font-semibold"
              onClick={handlePay}
              disabled={paymentLoading}
            >
              {paymentLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                buttonLabel
              )}
            </Button>
          </div>
        </div>
      )}
      
      {/* Spacer for sticky bar on mobile */}
      <div className="h-24 lg:hidden" />
    </main>
  );
}
