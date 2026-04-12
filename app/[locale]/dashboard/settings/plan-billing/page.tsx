'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from "@/hooks/useAuth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { pricingPlans } from "@/lib/plans";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import PricingPlans from "@/app/common/website/PricingPlans";
import Invoices from "./invoices";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SavedCardsSection from '@/components/dashboard/SavedCardsSection'

export default function BillingPage() {
  const { user } = useAuth();
  const router = useRouter()
  const searchParams = useSearchParams()
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPlansModalOpen, setIsPlansModalOpen] = useState(false);

  useEffect(() => {
    const cardsState = searchParams.get('cards')

    if (cardsState === 'updated') {
      toast.success('Card saved')
      router.replace('/dashboard/settings/plan-billing')
    } else if (cardsState === 'cancelled') {
      toast.message('Card setup was cancelled')
      router.replace('/dashboard/settings/plan-billing')
    }
  }, [router, searchParams])

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

  const formatDate = (timestamp: any) => {
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
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Your Plan</CardTitle>
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
                <Button variant="outline" onClick={() => setIsPlansModalOpen(true)}>
                  Switch Plan
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isPlansModalOpen} onOpenChange={setIsPlansModalOpen}>
        <DialogContent className="w-[95vw] max-w-[900px] h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Available Plans</DialogTitle>
            <DialogDescription>Choose a plan that fits your goals.</DialogDescription>
          </DialogHeader>
          <PricingPlans 
            currentPlan={currentPlan} 
            subscription={subscription}
            onManageSubscription={handleManageSubscription}
          />
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Manage saved cards for your purchases.</CardDescription>
        </CardHeader>
        <CardContent>
          <SavedCardsSection />
        </CardContent>
      </Card>

      <Invoices userId={user?.uid} />
    </div>
  );
}
