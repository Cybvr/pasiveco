import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { PaystackService } from '@/services/paystackService';
import {
  getEmailPlanPaystackCode,
  getEmailPlanPriceInNgn,
  type EmailBillingPeriod,
  type EmailPlanId,
} from '@/lib/email-plans';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(request: Request) {
  try {
    const { planId, billingPeriod, userId, email, name } = await request.json();

    if (!userId || !planId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const selectedPlanId = planId as EmailPlanId;
    const selectedBillingPeriod = (billingPeriod || 'monthly') as EmailBillingPeriod;

    if (selectedPlanId === 'free') {
      await adminDb.collection('users').doc(userId).set(
        {
          emailPlan: 'free',
          emailSubscriptionStatus: 'active',
          emailSubscriptionType: 'free',
          emailBillingPeriod: null,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      return NextResponse.json({ success: true, redirect: '/dashboard/email' });
    }

    const paystackPlanCode = getEmailPlanPaystackCode(selectedPlanId, selectedBillingPeriod);
    const amount = getEmailPlanPriceInNgn(selectedPlanId, selectedBillingPeriod);

    if (!paystackPlanCode) {
      return NextResponse.json(
        { error: 'Email Paystack plan code is not configured for this billing period' },
        { status: 400 }
      );
    }

    const reference = `email_${userId}_${selectedPlanId}_${selectedBillingPeriod}_${Date.now()}`;
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const result = await PaystackService.initializeTransaction({
      reference,
      amount,
      email,
      currency: 'NGN',
      callback_url: `${origin}/dashboard/email?status=success&reference=${reference}`,
      plan: paystackPlanCode,
      metadata: {
        subscriptionScope: 'email',
        userId,
        emailPlanId: selectedPlanId,
        billingPeriod: selectedBillingPeriod,
        custom_fields: [
          {
            display_name: 'Customer Name',
            variable_name: 'customer_name',
            value: name || 'User',
          },
          {
            display_name: 'Email Plan',
            variable_name: 'email_plan',
            value: selectedPlanId,
          },
        ],
      },
    });

    if (result.status && result.url) {
      return NextResponse.json({ link: result.url });
    }

    return NextResponse.json(
      { error: result.message || 'Failed to initialize email checkout' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Email Paystack Checkout Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
