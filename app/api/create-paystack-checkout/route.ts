import { NextResponse } from 'next/server';
import { PaystackService } from '@/services/paystackService';
import { getPlanPaystackCode, getPlanPrice, type PlanId, type BillingPeriod } from '@/lib/plans';
import { doc, updateDoc } from 'firebase/firestore';
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

    // Get Paystack plan code
    const paystackPlanCode = getPlanPaystackCode(planId as PlanId, billingPeriod as BillingPeriod);
    const amount = getPlanPrice(planId as PlanId, billingPeriod as BillingPeriod, 'NGN');

    if (!paystackPlanCode) {
      return NextResponse.json({ error: 'Invalid plan selected or plan not available for Paystack' }, { status: 400 });
    }

    const reference = `sub_${userId}_${planId}_${billingPeriod}_${Date.now()}`;
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const initializationData = {
      reference,
      amount,
      email,
      currency: 'NGN',
      callback_url: `${origin}/dashboard/settings/plan-billing?status=success&reference=${reference}`,
      plan: paystackPlanCode,
      metadata: {
        userId,
        planId,
        billingPeriod,
        custom_fields: [
          {
            display_name: "Customer Name",
            variable_name: "customer_name",
            value: name || 'User'
          },
          {
            display_name: "Plan",
            variable_name: "plan",
            value: planId
          }
        ]
      },
    };

    const result = await PaystackService.initializeTransaction(initializationData);

    if (result.status && result.url) {
      return NextResponse.json({ link: result.url });
    } else {
      return NextResponse.json({ error: result.message || 'Failed to initialize payment' }, { status: 500 });
    }
  } catch (error) {
    console.error('Paystack Checkout Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
