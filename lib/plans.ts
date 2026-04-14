// Plan configuration with trial support
import { convertAmount, type CurrencyCode } from '@/utils/currency';

interface BasePricingPlan {
  name: string;
  description: string;
  features: readonly string[];
  credits: number | 'Unlimited';
  isTrial?: boolean;
  trialDays?: number;
}

interface FreePlan extends BasePricingPlan {
  type: 'free';
  price: 0;
  stripePriceId: null;
}

interface SubscriptionPlan extends BasePricingPlan {
  type: 'subscription';
  monthly: {
    price: number;
    stripePriceId: string;
    flutterwavePlanId: string;
  };
  annual: {
    price: number;
    stripePriceId: string;
    flutterwavePlanId: string;
  };
}

export const pricingPlans = {
  free: {
    type: 'free' as const,
    name: 'Free Forever',
    description: 'Customizable link-in-bio and essential tools',
    price: 0,
    priceUsd: 0,
    credits: 5,
    features: [
      "Customizable link-in-bio",
      "Smart Reply Auto-DMs",
      "Sell with 9% Seller Fees",
      "Auto-updating Media Kits",
      "Courses with Video Hosting",
      "5 Email Automations",
    ] as const,
    stripePriceId: null,
    isTrial: false,
    trialDays: 0
  },
  starter: {
    type: 'subscription' as const,
    name: 'Pasive Starter',
    description: 'For new businesses still figuring things out.',
    credits: 'Unlimited',
    monthly: {
      price: 5000,
      stripePriceId: 'price_starter_monthly',
      flutterwavePlanId: '157543'
    },
    annual: {
      price: 30000,
      stripePriceId: 'price_starter_annual',
      flutterwavePlanId: '157546'
    },
    features: [
      "Simple Website",
      "Record Sales",
      "Manage Orders Efficiently",
      "Basic Analytics",
      "Email Support",
    ] as const,
    isTrial: true,
    trialDays: 7
  },
  pro: {
    type: 'subscription' as const,
    name: 'Pasive Pro',
    description: 'For small businesses with staff & growing needs.',
    credits: 'Unlimited',
    monthly: {
      price: 10000,
      stripePriceId: 'price_pro_monthly',
      flutterwavePlanId: '157544'
    },
    annual: {
      price: 75000,
      stripePriceId: 'price_pro_annual',
      flutterwavePlanId: '157547'
    },
    features: [
      "Everything in Starter",
      "Business Manager",
      "Analytics",
      "Storefront Templates",
      "Priority Support",
    ] as const,
    isTrial: true,
    trialDays: 7
  },
  growth: {
    type: 'subscription' as const,
    name: 'Pasive Growth',
    description: 'For growing businesses with a small team & multiple locations.',
    credits: 'Unlimited',
    monthly: {
      price: 25000,
      stripePriceId: 'price_growth_monthly',
      flutterwavePlanId: '157545'
    },
    annual: {
      price: 250000,
      stripePriceId: 'price_growth_annual',
      flutterwavePlanId: '157548'
    },
    features: [
      "Everything in Pro",
      "Business Automation",
      "Multiple Locations",
      "Advanced Inventory",
      "Dedicated Account Manager",
    ] as const,
    isTrial: true,
    trialDays: 7
  }
};

export type PlanId = keyof typeof pricingPlans;
export type BillingPeriod = 'monthly' | 'annual';

export const getPlanPrice = (planId: PlanId, billingPeriod: BillingPeriod, currency: CurrencyCode = 'NGN'): number => {
  const plan = pricingPlans[planId];
  if (plan.type === 'free') return 0;
  
  const periodData = (plan as any)[billingPeriod];
  if (!periodData) return 0; // Or handle N/A cases appropriately

  return Math.round(convertAmount((periodData as any).price || 0, 'NGN', currency));
};

export const getPlanStripePriceId = (planId: PlanId, billingPeriod: BillingPeriod): string | null => {
  const plan = pricingPlans[planId];
  if (plan.type === 'free') return null;
  
  const periodData = (plan as any)[billingPeriod];
  return periodData ? periodData.stripePriceId : null;
};

export const getPlanFlutterwaveId = (planId: PlanId, billingPeriod: BillingPeriod): string | null => {
  const plan = pricingPlans[planId];
  if (plan.type === 'free') return null;
  
  const periodData = (plan as any)[billingPeriod];
  return periodData ? periodData.flutterwavePlanId : null;
};

// Global trial reset date - any user who signed up before this date 
// will have their trial start from this date instead.
const TRIAL_RESET_DATE = new Date('2026-04-14T00:00:00Z');

export const getTrialEndDate = (createdAt: Date, planId: PlanId = 'free'): Date | null => {
  const plan = pricingPlans[planId];
  const trialDays = plan.trialDays || 0;
  if (trialDays === 0) return null;

  // Use the signup date or the reset date, whichever is later
  const effectiveStartDate = new Date(Math.max(createdAt.getTime(), TRIAL_RESET_DATE.getTime()));
  
  const trialEnd = new Date(effectiveStartDate);
  trialEnd.setDate(trialEnd.getDate() + trialDays);
  return trialEnd;
};

export const isInTrialPeriod = (createdAt: Date, planId: PlanId = 'free'): boolean => {
  const trialEnd = getTrialEndDate(createdAt, planId);
  if (!trialEnd) return false;
  return new Date() < trialEnd;
};

export const getTrialDaysLeft = (createdAt: Date, planId: PlanId = 'free'): number => {
  const trialEnd = getTrialEndDate(createdAt, planId);
  if (!trialEnd) return 0;

  const now = new Date();
  const diffTime = trialEnd.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
};
