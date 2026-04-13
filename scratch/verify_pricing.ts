
import { getPlanPrice, getPlanStripePriceId, PlanId, BillingPeriod } from '../lib/plans';

const testPlans = ['starter', 'pro', 'growth'] as PlanId[];
const testPeriods = ['monthly', 'quarterly', 'biannual', 'annual'] as BillingPeriod[];

console.log('--- Pricing Verification ---');

testPlans.forEach(planId => {
  console.log(`\nPlan: ${planId.toUpperCase()}`);
  testPeriods.forEach(period => {
    const price = getPlanPrice(planId, period);
    const stripeId = getPlanStripePriceId(planId, period);
    console.log(`${period.padEnd(10)}: Price=${price.toString().padEnd(10)} StripeID=${stripeId || 'N/A'}`);
  });
});

console.log('\n--- Trial Verification ---');
import { pricingPlans } from '../lib/plans';
Object.entries(pricingPlans).forEach(([id, plan]) => {
  console.log(`${id.padEnd(10)}: isTrial=${plan.isTrial} trialDays=${plan.trialDays || 0}`);
});
