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
  annual: {
    price: number;
    stripePriceId: string;
  };
  monthly: {
    price: number;
    stripePriceId: string;
  };
}

export const pricingPlans = {
  free: {
    type: 'free' as const,
    name: 'Free',
    description: '14-day free trial with basic features',
    price: 0,
    credits: 5,
    features: [
      "5 Custom Links",
      "Basic Bio Page",
      "Social Media Links",
      "Basic Analytics",
      "Standard Templates",
      "Community Support",
    ] as const,
    stripePriceId: null,
    isTrial: true,
    trialDays: 14
  },
  basic: {
    type: 'subscription' as const,
    name: 'Starter',
    description: 'Perfect for individuals and creators',
    credits: 25,
    annual: {
      price: 4200, // $42/year (30% discount)
      stripePriceId: 'price_1RF4e4HfPlG49dwkrfag8upM'
    },
    monthly: {
      price: 5000, // $50/month
      stripePriceId: 'price_1RF4cgHfPlG49dwkGq2vydvf'
    },
    features: [
      "25 Custom Links",
      "Advanced Bio Page",
      "Social Media Integration",
      "Link Analytics",
      "Custom Appearance",
      "5 Products/Services",
      "Email Support",
    ] as const,
    isTrial: false
  },
  pro: {
    type: 'subscription' as const,
    name: 'Pro',
    description: 'For businesses and power users',
    credits: 'Unlimited',
    annual: {
      price: 8400, // $84/year (30% discount)
      stripePriceId: 'price_1RF4fVHfPlG49dwk9fdm70xg'
    },
    monthly: {
      price: 10000, // $100/month
      stripePriceId: 'price_1RAT0fHfPlG49dwk4CcCpZBi'
    },
    features: [
      "Unlimited Links",
      "Premium Bio Pages",
      "Advanced Analytics",
      "Custom Domain",
      "Unlimited Products",
      "Paystack Integration",
      "AI Chat Assistant",
      "Custom Branding",
      "Priority Support",
    ] as const,
    isTrial: false
  }
};

export type PlanId = keyof typeof pricingPlans;
export type BillingPeriod = 'monthly' | 'annual';

export const getPlanPrice = (planId: PlanId, billingPeriod: BillingPeriod): number => {
  const plan = pricingPlans[planId];
  if (plan.type === 'free') return 0;
  return plan[billingPeriod].price;
};

export const getPlanStripePriceId = (planId: PlanId, billingPeriod: BillingPeriod): string | null => {
  const plan = pricingPlans[planId];
  if (plan.type === 'free') return null;
  return plan[billingPeriod].stripePriceId;
};

export const isInTrialPeriod = (createdAt: Date): boolean => {
  const trialDays = pricingPlans.free.trialDays || 0;
  const trialEnd = new Date(createdAt);
  trialEnd.setDate(trialEnd.getDate() + trialDays);
  return new Date() < trialEnd;
};