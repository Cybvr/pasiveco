'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useCurrency } from '@/context/CurrencyContext';
import { pricingPlans, type PlanId, type BillingPeriod, getPlanPrice } from "@/lib/plans";
import { Switch } from "@/components/ui/switch";
import { formatCurrency } from '@/utils/currency';
import { cn } from '@/lib/utils';

interface PricingPlansProps {
  onSelectPlan?: (planId: PlanId, billingPeriod: BillingPeriod) => void;
  currentPlan?: string | null;
  defaultBillingPeriod?: BillingPeriod;
  subscription?: {
    plan?: string | null;
    status?: string | null;
  } | null;
  onManageSubscription?: () => Promise<void> | void;
  showDowngradeOption?: boolean;
  embedded?: boolean;
}

export default function PricingPlans({ 
  onSelectPlan, 
  currentPlan,
  defaultBillingPeriod = 'annual',
  subscription,
  onManageSubscription,
  showDowngradeOption = true,
  embedded = false,
}: PricingPlansProps) {
  const { user } = useAuth();
  const { currency } = useCurrency();
  const initialBillingPeriod: BillingPeriod =
    defaultBillingPeriod === 'annual' || defaultBillingPeriod === 'monthly'
      ? defaultBillingPeriod
      : 'annual';
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>(initialBillingPeriod);

  const plans = Object.entries(pricingPlans).filter(([id]) => id !== 'free');

  // Detect active plan simply from props or user state
  const activePlan = (
    subscription?.plan || 
    currentPlan || 
    user?.plan || 
    'free'
  ).toLowerCase();

  const handleUpgrade = async (planId: string) => {
    if (!user?.uid) {
      toast.error('Please log in to upgrade');
      return;
    }

    try {
      const response = await fetch('/api/create-flutterwave-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          billingPeriod,
          userId: user.uid,
          email: user.email,
          name: user.displayName || 'User',
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create checkout session');

      if (data.link) {
        window.location.href = data.link;
      } else {
        throw new Error('No checkout link returned');
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

    // For Flutterwave, we might want to guide them to a dashboard or show them their current status
    // since there's no direct equivalent to Stripe's Customer Portal.
    toast.message('Subscription management', {
      description: 'Please contact support to cancel or change your subscription, or stay tuned for our upcoming billing dashboard.'
    });
  };

  return (
    <div
      className={cn(
        "bg-card max-w-7xl mx-auto",
        embedded ? "rounded-2xl border p-4 md:p-6" : "rounded-lg border p-4"
      )}
    >
      <div
        className={cn(
          "flex flex-col md:flex-row justify-between gap-6",
          embedded ? "mb-8 items-center justify-center" : "mb-12 items-center justify-center"
        )}
      >
        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3">
          <span className={`text-sm font-medium ${billingPeriod === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>
            Monthly
          </span>
          <Switch
            checked={billingPeriod === 'annual'}
            onCheckedChange={(checked) => setBillingPeriod(checked ? 'annual' : 'monthly')}
            aria-label="Toggle yearly billing"
          />
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${billingPeriod === 'annual' ? 'text-foreground' : 'text-muted-foreground'}`}>
              Yearly
            </span>
            <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-tight text-primary">
              Up to 50% Off
            </span>
          </div>
        </div>
      </div>

      <div className={cn("grid grid-cols-1 md:grid-cols-3", embedded ? "gap-5 mb-8" : "gap-8 mb-12")}>
        {plans.map(([planId, plan]: [string, any]) => {
          const isPlanAvailable = plan[billingPeriod] !== undefined;
          const price = getPlanPrice(planId as PlanId, billingPeriod, currency);

          return (
            <div
              key={planId}
              className={`flex flex-col ${embedded ? 'p-6 rounded-[2rem]' : 'p-8 rounded-[2.5rem]'} border-2 transition-all duration-300 ${
                activePlan === planId 
                  ? 'border-primary shadow-2xl shadow-primary/10 ring-4 ring-primary/5' 
                  : 'border-muted hover:border-muted-foreground/20'
              } bg-card relative overflow-hidden group`}
            >
              {planId === 'pro' && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-6 py-1 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest">
                  MOST POPULAR
                </div>
              )}
              
              <div className={embedded ? "mb-6" : "mb-8"}>
                <div className="text-2xl font-semibold tracking-tight text-foreground">{plan.name}</div>
                <p className="text-sm text-muted-foreground mt-2 min-h-[40px] leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <div className={cn("min-h-[80px] flex flex-col justify-center", embedded ? "mb-8" : "mb-10")}>
                {!isPlanAvailable ? (
                  <div className="flex flex-col">
                    <span className="text-4xl font-black text-muted-foreground/30">N/A</span>
                    <span className="text-xs font-bold text-muted-foreground mt-1 uppercase tracking-wider">
                      Not available on {billingPeriod}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black tracking-tighter">
                        {formatCurrency(price, currency)}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-muted-foreground mt-1 uppercase tracking-widest">
                      Billed {billingPeriod === 'annual' ? 'yearly' : 'monthly'}
                      {billingPeriod === 'annual' && ` (~${formatCurrency(price / 12, currency)} / mo)`}
                    </span>
                  </div>
                )}
              </div>

              <div className={cn("flex-grow border-t border-muted/50", embedded ? "mb-6 pt-6" : "mb-8 pt-8")}>
                <ul className="space-y-4">
                  {plan.features.map((feature: string) => (
                    <li key={feature} className="flex items-start">
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                        <Check className="h-3 w-3 text-primary" strokeWidth={4} />
                      </div>
                      <span className="text-sm font-medium leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                className={`w-full h-14 rounded-2xl text-base font-black tracking-tighter transition-all duration-300 ${
                  activePlan === planId 
                    ? "bg-muted text-muted-foreground cursor-default" 
                    : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0"
                }`}
                disabled={!isPlanAvailable || (activePlan === planId && subscription?.status === 'active') || subscription?.status === 'past_due'}
                onClick={() => {
                  if (onSelectPlan) {
                    onSelectPlan(planId as PlanId, billingPeriod);
                    return;
                  }
                  handleUpgrade(planId);
                }}
              >
                {activePlan === planId ? 'CURRENT PLAN' : plan.isTrial ? 'START 7-DAY FREE TRIAL' : 'UPGRADE NOW'}
              </Button>
            </div>
          );
        })}
      </div>

      {showDowngradeOption && activePlan !== 'free' && (
        <div className={cn("text-center border-t border-muted/50", embedded ? "pt-6" : "pt-8")}>
          <button
            onClick={() => onSelectPlan ? onSelectPlan('free', billingPeriod) : handleUpgrade('free')}
            className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
          >
            Switch to Free Forever
          </button>
          <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-tight">
            You'll keep your access until the end of your current period
          </p>
        </div>
      )}
    </div>
  );
}
