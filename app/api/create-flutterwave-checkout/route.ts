import { NextResponse } from 'next/server';
import { FlutterwaveService } from '@/services/flutterwaveService';
import { getPlanFlutterwaveId, getPlanPrice, type PlanId, type BillingPeriod } from '@/lib/plans';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: Request) {
  try {
    const { planId, billingPeriod, userId, email, name } = await request.json();

    if (!userId || !planId || !billingPeriod) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Handle free plan downgrade directly
    if (planId === 'free') {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        plan: 'free',
        subscriptionStatus: 'canceled',
        updatedAt: new Date().toISOString()
      });
      return NextResponse.json({ success: true, redirect: '/dashboard/settings/plan-billing' });
    }

    // Get Flutterwave plan ID
    const flutterwavePlanId = getPlanFlutterwaveId(planId as PlanId, billingPeriod as BillingPeriod);
    const amount = getPlanPrice(planId as PlanId, billingPeriod as BillingPeriod, 'NGN');

    if (!flutterwavePlanId) {
      return NextResponse.json({ error: 'Invalid plan selected or plan not available for Flutterwave' }, { status: 400 });
    }

    const tx_ref = `sub_${userId}_${planId}_${billingPeriod}_${Date.now()}`;
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const initializationData = {
      tx_ref,
      amount,
      currency: 'NGN',
      redirect_url: `${origin}/dashboard/settings/plan-billing?status=success`,
      customer: {
        email: email,
        name: name || 'User',
      },
      meta: {
        userId,
        planId,
        billingPeriod,
      },
      payment_plan: flutterwavePlanId,
      customizations: {
        title: 'Pasive Subscription',
        description: `Upgrade to ${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan`,
        logo: `${origin}/logo.png`, // Update with actual logo URL
      },
    };

    const result = await FlutterwaveService.initializePayment(initializationData);

    if (result.status && result.link) {
      return NextResponse.json({ link: result.link });
    } else {
      return NextResponse.json({ error: result.message || 'Failed to initialize payment' }, { status: 500 });
    }
  } catch (error) {
    console.error('Flutterwave Checkout Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
