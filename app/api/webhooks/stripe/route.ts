// @/app/api/webhooks/stripe/route.ts

// @/app/api/webhooks/stripe/route.ts

import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { doc, getDoc, updateDoc, collection, setDoc, Timestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
  }

  const body = await request.text();
  const sig = headers().get('stripe-signature') || '';

  if (!endpointSecret) {
    return NextResponse.json({ error: 'Webhook configuration error' }, { status: 500 });
  }

  try {
    const event = stripe.webhooks.constructEvent(body, sig, endpointSecret);

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.trial_will_end':
        await handleSubscriptionChange(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object);
        break;
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

async function getUserIdFromCustomer(customerId: string) {
  if (!customerId) return null;

  const customer = await stripe.customers.retrieve(customerId);

  // First check if userId exists in metadata
  if (customer.metadata?.userId) {
    // Verify this user exists in Firestore
    const userRef = doc(db, 'users', customer.metadata.userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      // Make sure stripeCustomerId is correct in user document
      if (userSnap.data().stripeCustomerId !== customerId) {
        await updateDoc(userRef, { stripeCustomerId: customerId });
      }
      return customer.metadata.userId;
    }
  }

  // Search by email
  if (customer.email) {
    const usersRefByEmail = collection(db, 'users');
    const qByEmail = query(usersRefByEmail, where('email', '==', customer.email));
    const querySnapshotByEmail = await getDocs(qByEmail);

    if (!querySnapshotByEmail.empty) {
      const userId = querySnapshotByEmail.docs[0].id;

      // Update both Stripe and Firestore for future webhook calls
      await Promise.all([
        stripe.customers.update(customerId, { metadata: { userId } }),
        updateDoc(doc(db, 'users', userId), { stripeCustomerId: customerId })
      ]);

      return userId;
    }
  }

  // Last resort: find user with matching stripeCustomerId
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('stripeCustomerId', '==', customerId));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const userId = querySnapshot.docs[0].id;
    // Ensure customer metadata is up to date
    await stripe.customers.update(customerId, { metadata: { userId } });
    return userId;
  }

  return null;
}

async function handleSubscriptionChange(subscription: any) {
  const customerId = subscription.customer;
  const userId = await getUserIdFromCustomer(customerId);
  if (!userId) return;

  // Determine the plan from the subscription
  const priceId = subscription.items.data[0].price.id;
  let planId = 'free';

  // Map from Stripe price ID back to our plan IDs - ensure lowercase consistently
  const proPriceIds = ['price_1RAT0fHfPlG49dwk4CcCpZBi', 'price_1RF4fVHfPlG49dwk9fdm70xg'];
  // Handle trial conversion to paid plan
  if (subscription.status === 'trialing' && subscription.trial_end) {
    planId = 'free';
  }
  const basicPriceIds = ['price_1RF4cgHfPlG49dwkGq2vydvf', 'price_1RF4e4HfPlG49dwkrfag8upM'];

  if (proPriceIds.includes(priceId)) {
    planId = 'pro';
  } else if (basicPriceIds.includes(priceId)) {
    planId = 'basic';
  }

  // Log subscription changes
  console.log('Subscription update:', {
    userId,
    priceId,
    planId,
    subscriptionStatus: subscription.status
  });

  const now = Timestamp.now();
  const subscriptionData = {
    plan: planId, // Ensure this is lowercase to match pricingPlans keys
    subscriptionId: subscription.id,
    subscriptionStatus: subscription.status,
    subscriptionPeriodEnd: Timestamp.fromMillis(subscription.current_period_end * 1000),
    updatedAt: now
  };

  // Update user's plan in Firestore
  if (subscription.status === 'active' || subscription.status === 'trialing') {
    await updateDoc(doc(db, 'users', userId), { 
      ...subscriptionData, 
      plan: planId, // Explicitly set the plan field
      subscriptionVerified: true,
      lastVerified: Timestamp.now()
    });
  }

  // Store subscription details in the subscriptions collection
  const subscriptionRef = doc(db, 'subscriptions', subscription.id);
  const subscriptionDoc = {
    userId,
    customerId,
    planId,
    status: subscription.status,
    currentPeriodEnd: Timestamp.fromMillis(subscription.current_period_end * 1000),
    currentPeriodStart: Timestamp.fromMillis(subscription.current_period_start * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    updatedAt: now
  };

  // Check if document exists and update or create accordingly
  const subscriptionSnap = await getDoc(subscriptionRef);
  if (subscriptionSnap.exists()) {
    await updateDoc(subscriptionRef, subscriptionDoc);
  } else {
    await setDoc(subscriptionRef, {
      ...subscriptionDoc,
      id: subscription.id,
      createdAt: now
    });
  }
}

async function handleSubscriptionCanceled(subscription: any) {
  const customerId = subscription.customer;
  const userId = await getUserIdFromCustomer(customerId);
  if (!userId) return;

  const now = Timestamp.now();

  // Update user and subscription records
  await Promise.all([
    updateDoc(doc(db, 'users', userId), {
      plan: 'free', // Always use lowercase 'free'
      subscriptionStatus: 'canceled',
      subscriptionId: subscription.id,
      updatedAt: now
    }),
    updateDoc(doc(db, 'subscriptions', subscription.id), {
      status: 'canceled',
      updatedAt: now
    })
  ]);
}

async function handleInvoicePaid(invoice: any) {
  const customerId = invoice.customer;
  const userId = await getUserIdFromCustomer(customerId);
  if (!userId) return;

  // Add invoice to invoices collection
  await setDoc(doc(db, 'invoices', invoice.id), {
    id: invoice.id,
    userId,
    customerId,
    subscriptionId: invoice.subscription,
    status: invoice.status,
    amountPaid: invoice.amount_paid,
    currency: invoice.currency,
    invoiceUrl: invoice.hosted_invoice_url,
    pdfUrl: invoice.invoice_pdf,
    periodStart: Timestamp.fromMillis(invoice.period_start * 1000),
    periodEnd: Timestamp.fromMillis(invoice.period_end * 1000),
    createdAt: Timestamp.now()
  });

  // Update user subscription if this was for a new plan
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    const priceId = subscription.items.data[0].price.id;

    // Map from Stripe price ID back to our plan IDs - ensure lowercase consistently
    const proPriceIds = ['price_1RAT0fHfPlG49dwk4CcCpZBi', 'price_1RF4fVHfPlG49dwk9fdm70xg'];
    const basicPriceIds = ['price_1RF4cgHfPlG49dwkGq2vydvf', 'price_1RF4e4HfPlG49dwkrfag8upM'];
    let planId = 'free';

    if (proPriceIds.includes(priceId)) planId = 'pro';
    else if (basicPriceIds.includes(priceId)) planId = 'basic';

    // Update the user document with the new plan
    await updateDoc(doc(db, 'users', userId), { 
      plan: planId,
      subscriptionStatus: subscription.status,
      updatedAt: Timestamp.now()
    });
  }
}

async function handleInvoicePaymentFailed(invoice: any) {
  const customerId = invoice.customer;
  const userId = await getUserIdFromCustomer(customerId);
  if (!userId) return;

  // Update user record to indicate payment failure
  await updateDoc(doc(db, 'users', userId), {
    paymentFailed: true,
    updatedAt: Timestamp.now()
  });
}