'use client'

import PricingPlans from '@/app/common/website/PricingPlans'
import FaqSection from '@/app/common/website/FaqSection'
import { BillingPeriod, PlanId } from '@/lib/plans'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

export default function PricingPage() {
  const { user } = useAuth();

  const handleSelectPlan = async (planId: PlanId, billingPeriod: BillingPeriod) => {
    // If not logged in, go to register
    if (!user?.uid) {
      window.location.href = `/auth/register?plan=${planId}&period=${billingPeriod}`
      return
    }

    // If logged in, handle the upgrade directly
    try {
      const response = await fetch('/api/create-paystack-checkout', {
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
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/95">
      <div className="container px-4 py-12 sm:py-16 lg:py-24">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold tracking-tight text-foreground">Simple, transparent pricing</h1>
          <p className="mt-2 text-xl text-muted-foreground">Choose the plan that works best for you</p>
        </div>
        <PricingPlans 
          currentPlan={user?.plan || "free"}
          onSelectPlan={handleSelectPlan}
        />
      </div>
      <FaqSection />
    </div>
  )
}
