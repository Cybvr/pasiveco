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
    name: 'Free Forever',
    description: 'Customizable link-in-bio and essential tools',
    price: 0,
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
  creator_plus: {
    type: 'subscription' as const,
    name: 'Creator Plus',
    description: 'The most popular plan for ambitious creators',
    credits: 'Unlimited',
    annual: {
      price: 300, // $300/year (about $25/month)
      stripePriceId: 'price_1RF4fVHfPlG49dwk9fdm70xg'
    },
    monthly: {
      price: 30, // $30/month
      stripePriceId: 'price_1RAT0fHfPlG49dwk4CcCpZBi'
    },
    features: [
      "All Free Features",
      "Unlimited daily AI Credits",
      "0% Seller Fees",
      "BNPL (Buy Now Pay Later)",
      "Unlimited Email Sends",
      "Unlimited Memberships",
      "Free Custom Domain",
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