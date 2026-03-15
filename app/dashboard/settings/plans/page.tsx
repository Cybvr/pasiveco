'use client'
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import PricingPlans from "@/app/common/website/PricingPlans";
import Invoices from "../plan-billing/invoices";
import { Card } from "@/components/ui/card";

export default function PlansPage() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);

  // Remove the useEffect hook related to fetching subscription status

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Current Plan</h2>
        <div className="space-y-2">
          <p><span className="font-medium">Plan:</span> Free</p>
        </div>
      </Card>

      <div>
        <h2 className="text-2xl font-bold tracking-tight">Available Plans</h2>
        <p className="text-muted-foreground">Choose the perfect plan for your needs.</p>
      </div>

      <PricingPlans currentPlan={'free'} subscription={null} />
      <Invoices userId={user?.uid} />
    </div>
  );
}
