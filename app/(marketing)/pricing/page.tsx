
'use client'
import PricingPlans from '@/app/common/website/PricingPlans'
import FaqSection from '@/app/common/website/FaqSection'
import { BillingPeriod, PlanId } from '@/types'

export default function PricingPage() {
  const handleSelectPlan = (planId: PlanId, billingPeriod: BillingPeriod) => {
    window.location.href = '/auth/register'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/95">
      <div className="container px-4 py-12 sm:py-16 lg:py-24">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold tracking-tight">Simple, transparent pricing</h1>
          <p className="mt-2 text-xl text-muted-foreground">Choose the plan that works best for you</p>
        </div>
        <PricingPlans 
          currentPlan="free"
          onSelectPlan={handleSelectPlan}
        />
      </div>
      <FaqSection />
    </div>
  )
}
