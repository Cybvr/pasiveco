import { convertAmount, type CurrencyCode } from '@/utils/currency';

interface BaseEmailPlan {
  name: string;
  description: string;
  recipientsLabel: string;
  features: readonly string[];
}

interface FreeEmailPlan extends BaseEmailPlan {
  type: 'free';
  price: 0;
}

interface SubscriptionEmailPlan extends BaseEmailPlan {
  type: 'subscription';
  monthly: {
    price: number;
    paystackPlanCode: string | null;
  };
  annual: {
    price: number;
    paystackPlanCode: string | null;
  };
}

export const emailPlans = {
  free: {
    type: 'free' as const,
    name: 'Free',
    description: 'For testing email campaigns with a small list.',
    recipientsLabel: '0-500 recipients / mo',
    price: 0,
    features: [
      'Send campaigns to up to 500 recipients each month',
      'Basic email editor and campaign scheduling',
      'Open and click tracking',
    ] as const,
  },
  reach: {
    type: 'subscription' as const,
    name: 'Reach',
    description: 'For growing stores sending regular campaigns and automations.',
    recipientsLabel: 'Up to 5,000 recipients / mo',
    monthly: {
      price: 9000,
      paystackPlanCode: process.env.PAYSTACK_EMAIL_REACH_MONTHLY_PLAN_CODE || null,
    },
    annual: {
      price: 36000,
      paystackPlanCode: process.env.PAYSTACK_EMAIL_REACH_ANNUAL_PLAN_CODE || null,
    },
    features: [
      'Everything in Free',
      'AI subject lines and content ideas',
      'Welcome, cart recovery, and post-purchase automations',
    ] as const,
  },
};

export type EmailPlanId = keyof typeof emailPlans;
export type EmailBillingPeriod = 'monthly' | 'annual';

export const getEmailPlanPrice = (
  planId: EmailPlanId,
  billingPeriod: EmailBillingPeriod,
  currency: CurrencyCode = 'NGN'
): number => {
  const plan = emailPlans[planId];
  if (!plan || plan.type === 'free') return 0;

  const periodData = plan[billingPeriod];
  return Math.round(convertAmount(periodData.price, 'NGN', currency));
};

export const getEmailPlanPriceInNgn = (
  planId: EmailPlanId,
  billingPeriod: EmailBillingPeriod
): number => {
  const plan = emailPlans[planId];
  if (!plan || plan.type === 'free') return 0;
  return plan[billingPeriod].price;
};

export const getEmailPlanPaystackCode = (
  planId: EmailPlanId,
  billingPeriod: EmailBillingPeriod
): string | null => {
  const plan = emailPlans[planId];
  if (!plan || plan.type === 'free') return null;
  return plan[billingPeriod].paystackPlanCode;
};
