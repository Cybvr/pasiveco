// Plan configuration with trial support
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
  monthly?: {
    price: number;
    stripePriceId: string;
  };
  quarterly?: {
    price: number;
    stripePriceId: string;
  };
  biannual?: {
    price: number;
    stripePriceId: string;
  };
  annual: {
    price: number;
    stripePriceId: string;
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
      stripePriceId: 'price_starter_monthly'
    },
    quarterly: {
      price: 15000,
      stripePriceId: 'price_starter_quarterly'
    },
    biannual: {
      price: 20000,
      stripePriceId: 'price_starter_biannual'
    },
    annual: {
      price: 30000,
      stripePriceId: 'price_starter_annual'
    },
    features: [
      "Simple Website",
      "Record Sales",
      "Manage Orders Efficiently",
      "Basic Analytics",
      "Email Support",
    ] as const,
    isTrial: true,
    trialDays: 14
  },
  pro: {
    type: 'subscription' as const,
    name: 'Pasive Pro',
    description: 'For small businesses with staff & growing needs.',
    credits: 'Unlimited',
    monthly: {
      price: 10000,
      stripePriceId: 'price_pro_monthly'
    },
    quarterly: {
      price: 30000,
      stripePriceId: 'price_pro_quarterly'
    },
    biannual: {
      price: 45000,
      stripePriceId: 'price_pro_biannual'
    },
    annual: {
      price: 75000,
      stripePriceId: 'price_pro_annual'
    },
    features: [
      "Everything in Starter",
      "Sales System",
      "Customer Base Management",
      "Staff Accounts",
      "Priority Support",
    ] as const,
    isTrial: true,
    trialDays: 14
  },
  growth: {
    type: 'subscription' as const,
    name: 'Pasive Growth',
    description: 'For growing businesses with a small team & multiple locations.',
    credits: 'Unlimited',
    monthly: {
      price: 25000,
      stripePriceId: 'price_growth_monthly'
    },
    biannual: {
      price: 150000,
      stripePriceId: 'price_growth_biannual'
    },
    annual: {
      price: 250000,
      stripePriceId: 'price_growth_annual'
    },
    features: [
      "Everything in Pro",
      "Business Automation",
      "Multiple Locations",
      "Advanced Inventory",
      "Dedicated Account Manager",
    ] as const,
    isTrial: true,
    trialDays: 14
  }
};

export type PlanId = keyof typeof pricingPlans;
export type BillingPeriod = 'monthly' | 'quarterly' | 'biannual' | 'annual';

export const getPlanPrice = (planId: PlanId, billingPeriod: BillingPeriod, currency: 'NGN' | 'USD' = 'NGN'): number => {
  const plan = pricingPlans[planId];
  if (plan.type === 'free') return 0;
  
  const periodData = plan[billingPeriod];
  if (!periodData) return 0; // Or handle N/A cases appropriately

  // If currency is USD, we might need a generic conversion if priceUsd isn't defined
  // For now, assume we focus on NGN until plan-specific USD pricing is added
  return (periodData as any).price || 0;
};

export const getPlanStripePriceId = (planId: PlanId, billingPeriod: BillingPeriod): string | null => {
  const plan = pricingPlans[planId];
  if (plan.type === 'free') return null;
  
  const periodData = plan[billingPeriod];
  return periodData ? periodData.stripePriceId : null;
};

export const isInTrialPeriod = (createdAt: Date, planId: PlanId = 'free'): boolean => {
  const plan = pricingPlans[planId];
  const trialDays = plan.trialDays || 0;
  const trialEnd = new Date(createdAt);
  trialEnd.setDate(trialEnd.getDate() + trialDays);
  return new Date() < trialEnd;
};
