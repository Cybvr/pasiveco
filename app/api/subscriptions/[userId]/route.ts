// @/app/api/subscriptions/[userId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit, DocumentData } from 'firebase/firestore';
import { stripe } from '@/lib/stripe';
import { isInTrialPeriod } from '@/lib/plans';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;
    console.log('🔍 Subscription API called for userId:', userId);

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (!stripe) {
      console.error('Stripe is not configured');
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
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
    const isTrialing = isInTrialPeriod(userData.createdAt.toDate());

    // Return trial status if user is in trial period
    if (isTrialing) {
      return NextResponse.json({
        plan: 'free',
        status: 'trialing',
        trialEnd: new Date(userData.createdAt.toDate().getTime() + (14 * 24 * 60 * 60 * 1000))
      });
    }

    // Regular subscription check logic
    const subscriptionId = userData.subscriptionId;
    const stripeCustomerId = userData.stripeCustomerId;

    // Get subscription data
    let subscriptionData = null;
    if (subscriptionId) {
      try {
        const subscriptionSnap = await getDoc(doc(db, 'subscriptions', subscriptionId));
        if (subscriptionSnap.exists()) {
          subscriptionData = subscriptionSnap.data();
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      }
    }

    // Get invoices - try all possible query methods in order of preference
    let invoices: DocumentData[] = [];
    try {
      // Try queries in sequence - by userId, subscriptionId, then customerId
      const queryOptions = [
        userId ? query(
          collection(db, 'invoices'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc'),
          limit(10)
        ) : null,
        subscriptionId ? query(
          collection(db, 'invoices'),
          where('subscriptionId', '==', subscriptionId),
          orderBy('createdAt', 'desc'),
          limit(10)
        ) : null,
        stripeCustomerId ? query(
          collection(db, 'invoices'),
          where('customerId', '==', stripeCustomerId),
          orderBy('createdAt', 'desc'),
          limit(10)
        ) : null
      ].filter(Boolean);

      // Try each query until we find invoices
      for (const q of queryOptions) {
        if (!q) continue;
        const snap = await getDocs(q);
        if (snap.size > 0) {
          invoices = snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          break;
        }
      }
    } catch (error) {
      console.error('Error fetching invoices from Firestore:', error);
    }

    // Fallback to Stripe API if no invoices found in Firestore
    if (invoices.length === 0 && stripeCustomerId) {
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
            // Ensure createdAt has the right format expected by the frontend
            createdAt: { seconds: invoice.created, nanoseconds: 0 }
          }));
        }
      } catch (stripeError) {
        console.error('Error fetching invoices from Stripe:', stripeError);
      }
    }

    // Get Stripe subscription details if needed
    let stripeSubscription = null;
    if (subscriptionId) {
      try {
        stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
      } catch (error) {
        console.error('Error fetching Stripe subscription:', error);
      }
    }

    // Validate subscription status
    let status = userData.subscriptionStatus;
    let plan = userData.plan;

    // Double check with Stripe data
    if (stripeSubscription?.status === 'active') {
      status = 'active';
      // Get current price ID
      const priceId = stripeSubscription.items.data[0]?.price.id;

      // Validate plan based on price
      const proPriceIds = ['price_1RAT0fHfPlG49dwk4CcCpZBi', 'price_1RF4fVHfPlG49dwk9fdm70xg'];
      if (proPriceIds.includes(priceId)) {
        plan = 'pro';
      }
    }

    return NextResponse.json({
      userId,
      plan: plan || 'free',
      status: status || 'no_subscription',
      subscriptionId,
      subscription: subscriptionData,
      stripeSubscription,
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