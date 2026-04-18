// @/app/api/subscriptions/[userId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit, DocumentData } from 'firebase/firestore';
import { stripe } from '@/lib/stripe';
import { isInTrialPeriod, getTrialEndDate, pricingPlans } from '@/lib/plans';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    console.log('🔍 Subscription API called for userId:', userId);

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Default response for error cases
    const defaultResponse = {
      plan: 'free',
      status: 'no_subscription'
    };

    // Get user data
    const userRef = doc(db, 'users', userId);
    let userSnap;
    try {
      userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        return NextResponse.json(defaultResponse);
      }
    } catch (error) {
      console.error('❌ Error fetching user from Firestore:', error);
      return NextResponse.json(defaultResponse);
    }

    const userData = userSnap.data();
    const createdAt = userData.createdAt?.toDate ? userData.createdAt.toDate() : new Date(userData.createdAt);
    const isTrialing = isInTrialPeriod(createdAt);

    // Return trial status if user is in trial period
    if (isTrialing) {
      return NextResponse.json({
        plan: 'free',
        status: 'trialing',
        trialEnd: getTrialEndDate(createdAt)
      });
    }

    // Regular subscription check logic
    const subscriptionId = userData.subscriptionId;
    const stripeCustomerId = userData.stripeCustomerId;
    const subscriptionType = userData.subscriptionType || (stripeCustomerId ? 'stripe' : null);

    // Get invoices from Firestore
    let invoices: DocumentData[] = [];
    try {
      const q = query(
        collection(db, 'invoices'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const snap = await getDocs(q);
      invoices = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching invoices from Firestore:', error);
    }

    // Fallback to Stripe API if no invoices found in Firestore and it's a Stripe user
    if (invoices.length === 0 && stripeCustomerId && stripe) {
      try {
        const stripeInvoices = await stripe.invoices.list({
          customer: stripeCustomerId,
          limit: 5,
        });

        if (stripeInvoices.data.length > 0) {
          invoices = stripeInvoices.data.map((invoice) => ({
            id: invoice.id,
            userId: userId,
            customerId: stripeCustomerId,
            subscriptionId: invoice.subscription,
            status: invoice.status,
            amountPaid: invoice.amount_paid,
            currency: invoice.currency,
            invoiceUrl: invoice.hosted_invoice_url,
            pdfUrl: invoice.invoice_pdf,
            createdAt: { seconds: invoice.created, nanoseconds: 0 }
          }));
        }
      } catch (stripeError) {
        console.error('Error fetching invoices from Stripe:', stripeError);
      }
    }

    // Get subscription details
    let externalSubscription = null;
    if (subscriptionId && subscriptionType === 'stripe' && stripe) {
      try {
        externalSubscription = await stripe.subscriptions.retrieve(subscriptionId);
      } catch (error) {
        console.error('Error fetching Stripe subscription:', error);
      }
    }

    // Validate status
    let status = userData.subscriptionStatus || 'no_subscription';
    let plan = (userData.plan || 'free').toLowerCase();

    // Double check with Stripe data if applicable
    if (subscriptionType === 'stripe' && (externalSubscription as any)?.status === 'active') {
      status = 'active';
    }

    return NextResponse.json({
      userId,
      plan,
      status,
      subscriptionId,
      subscriptionType,
      subscription: externalSubscription,
      invoices,
      updatedAt: userData.updatedAt
    });

  } catch (error) {
    console.error('Error in subscription API:', error);
    return NextResponse.json({
      plan: 'free',
      status: 'no_subscription'
    });
  }
}