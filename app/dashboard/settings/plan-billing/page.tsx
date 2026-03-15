'use client';

import { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { pricingPlans } from "@/lib/plans";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import PricingPlans from "@/app/common/website/PricingPlans";
import Invoices from "./invoices";

export default function BillingPage() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const fetchSubscription = async () => {
      try {
        console.log('🔍 Fetching subscription for user:', user.uid);
        console.log('👤 Current user data from auth:', { 
          plan: user?.plan, 
          email: user?.email 
        });

        const response = await fetch(`/api/subscriptions/${user.uid}`);
        console.log('🔄 Subscription API response status:', response.status);

        if (!response.ok) {
          console.log(`❌ Subscription API returned status: ${response.status}`);
          // Set default subscription data - use lowercase for consistency with pricingPlans
          setSubscription({ plan: 'free', status: 'no_subscription' });
          return;
        }

        const data = await response.json();
        console.log('📋 Subscription data received:', JSON.stringify(data, null, 2));

        // Ensure plan is lowercase to match pricingPlans object keys
        if (data && data.plan) {
          data.plan = data.plan.toLowerCase();
        }

        setSubscription(data);
      } catch (error) {
        console.error('❌ Error fetching subscription:', error);
        // Don't show error toast to users - just set default data
        setSubscription({ plan: 'free', status: 'no_subscription' });
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user?.uid]);

  const handleManageSubscription = async () => {
    try {
      if (!user?.uid) {
        toast.error('You must be logged in to manage your subscription');
        return;
      }

      const response = await fetch('/api/create-customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.uid }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create customer portal session');
      }

      // Redirect to Stripe customer portal
      window.location.href = data.url;
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error('Failed to open customer portal');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';

    // Handle both Firestore Timestamp objects and regular timestamps
    const date = timestamp.seconds 
      ? new Date(timestamp.seconds * 1000) 
      : new Date(timestamp);

    return date.toLocaleDateString();
  };

  // Determine the current plan safely
  const currentPlan = subscription?.plan || 'free';

  // Check if the plan exists in pricingPlans
  const planExists = pricingPlans[currentPlan] !== undefined;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Billing & Subscription</h2>
        <p className="text-muted-foreground">Manage your subscription and payment details.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Your current subscription details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-60" />
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-8 w-32 mt-4" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <span className="font-semibold">Current plan:</span>
                <span>{planExists ? pricingPlans[currentPlan].name : 'Free'}</span>
                <Badge variant={subscription?.status === 'active' || subscription?.status === 'trialing' ? 'default' : 'outline'}>
                  {subscription?.status === 'trialing' 
                    ? `Free Trial (${Math.ceil((new Date(subscription.trialEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left)`
                    : subscription?.status === 'active' 
                    ? 'Active' 
                    : 'Inactive'}
                </Badge>
              </div>

              {subscription?.subscription?.currentPeriodEnd && (
                <div className="mb-4">
                  <span className="font-semibold">Renews on:</span>{' '}
                  {formatDate(subscription.subscription.currentPeriodEnd)}
                </div>
              )}

              {subscription?.status === 'active' && (
                <div className="mb-4">
                  <Button onClick={handleManageSubscription}>
                    Manage Subscription
                  </Button>
                </div>
              )}

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Plan Features:</h3>
                <ul className="space-y-2">
                  {planExists && pricingPlans[currentPlan]?.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Available Plans</h3>
        <PricingPlans 
          currentPlan={currentPlan} 
          subscription={subscription}
          onManageSubscription={handleManageSubscription}
        />
      </div>

      <div className="mt-8">
        <Invoices userId={user?.uid} />
      </div>
    </div>
  );
}