'use client';

import { useState } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { pricingPlans, type PlanId, type BillingPeriod, getPlanPrice } from "@/lib/plans";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { loadStripe } from '@stripe/stripe-js';
import { toast } from "sonner";

interface PricingPlansProps {
  onSelectPlan?: (planId: PlanId, billingPeriod: BillingPeriod) => void;
  currentPlan?: string;
  defaultBillingPeriod?: BillingPeriod;
  subscription?: any;
  onManageSubscription?: () => Promise<void>;
  showDowngradeOption?: boolean;
}

export default function PricingPlans({ 
  onSelectPlan, 
  currentPlan,
  defaultBillingPeriod = 'monthly',
  subscription,
  onManageSubscription,
  showDowngradeOption = true
}: PricingPlansProps) {
  const { user } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>(defaultBillingPeriod);
  const annualDiscount = 20; // 20% discount for annual billing
  const plans = Object.entries(pricingPlans);

  // Ensure we have a lowercase string for comparison with plan IDs
  const activePlan = ((subscription?.status === 'active' ? subscription?.plan : null) || currentPlan || 'free').toLowerCase();

  const handleUpgrade = async (planId: string) => {
    if (!user?.uid) {
      toast.error('Please log in to upgrade');
      return;
    }

    try {
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

      if (!stripe) {
        throw new Error('Failed to initialize Stripe');
      }

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          billingPeriod,
          userId: user.uid,
          email: user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId: data.id });

      if (error) {
        throw error;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to process upgrade');
    }
  };

  const handleManageSubscription = async () => {
    if (onManageSubscription) {
      await onManageSubscription();
      return;
    }

    if (!user?.uid) {
      toast.error('You must be logged in to manage your subscription');
      return;
    }

    try {
      const response = await fetch('/api/create-customer-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      window.location.href = data.url;
    } catch (error) {
      toast.error('Failed to open customer portal');
    }
  };

  return (
    <div className="p-4 bg-card rounded-lg border">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-bold">Choose a Plan</h1>
        <div className="flex items-center space-x-2">
          <Label htmlFor="billing-period">Monthly</Label>
          <Switch
            id="billing-period"
            checked={billingPeriod === 'annual'}
            onCheckedChange={(checked) => setBillingPeriod(checked ? 'annual' : 'monthly')}
          />
          <Label htmlFor="billing-period">Annual ({annualDiscount}% off)</Label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map(([planId, plan]) => (
          <div
            key={planId}
            className={`flex flex-col p-8 rounded-[2rem] border-2 transition-all duration-300 ${
              activePlan === planId ? 'border-primary shadow-2xl shadow-primary/10' : 'border-muted hover:border-muted-foreground/20'
            } bg-card relative overflow-hidden`}
          >
            {planId === 'creator_plus' && (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 rounded-bl-xl text-xs font-bold uppercase tracking-wider">
                Most Popular
              </div>
            )}
            <div className="mb-6">
              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
            </div>
            {/* Added spacing and consistent price display */}
            <div className="mb-8 flex items-baseline gap-1">
              <span className="text-5xl font-black italic tracking-tighter">
                ${plan.type === 'free' ? '0' : getPlanPrice(planId as PlanId, billingPeriod).toLocaleString()}
              </span>
              {plan.type !== 'free' && <span className="text-muted-foreground font-medium">/{billingPeriod === 'annual' ? 'yr' : 'mo'}</span>}
            </div>

            <div className="flex-grow">
              <ul className="space-y-2 mb-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                    <span className="text-sm font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              className="w-full mt-auto"
              variant={activePlan === planId ? "secondary" : "default"}
              onClick={() => {
                if (planId === 'free' && activePlan === 'free') {
                  return;
                }
                if (onSelectPlan) {
                  onSelectPlan(planId as PlanId, billingPeriod);
                  return;
                }
                handleUpgrade(planId);
              }}
              disabled={
    (activePlan === planId && subscription?.status === 'active') || 
    (planId === 'free' && activePlan !== 'free') ||
    (subscription?.status === 'past_due')
  }
            >
              {activePlan === 'free' && subscription?.status === 'trialing' 
                ? `Free Trial (${Math.ceil((new Date(subscription.trialEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left)`
                : activePlan === planId 
                ? 'Current Plan' 
                : 'Select Plan'}
            </Button>
          </div>
        ))}
      </div>

      {showDowngradeOption && activePlan !== 'free' && (
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            className="text-muted-foreground"
            onClick={() => {
              if (onSelectPlan) {
                onSelectPlan('free', billingPeriod);
                return;
              }
              // Use the handleManageSubscription if the user wants to cancel subscription
              if (activePlan !== 'free' && subscription?.status === 'active') {
                handleManageSubscription();
                return;
              }
              handleUpgrade('free');
            }}
          >
            Downgrade to Free Plan
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Your paid features will remain active until the end of your billing period
          </p>
        </div>
      )}
    </div>
  );
}