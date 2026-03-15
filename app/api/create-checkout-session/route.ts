// @/app/api/create-checkout-session/route.ts

import { stripe } from '@/lib/stripe';
import { NextResponse, headers } from 'next/server';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getPlanStripePriceId } from '@/lib/plans';

export async function POST(request: Request) {
  try {
    const { planId, billingPeriod, userId, email } = await request.json();
    
    if (!userId || !planId) {
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
      return NextResponse.json({ success: true });
    }
    
    if (!billingPeriod) {
      return NextResponse.json({ error: 'Missing billing period' }, { status: 400 });
    }
    
    // Get Stripe price ID from our plans configuration
    const stripePriceId = getPlanStripePriceId(planId, billingPeriod);
    if (!stripePriceId) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }
    
    let stripeCustomerId = null;
    
    try {
      // Check if user already has a Stripe customer ID
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      stripeCustomerId = userSnap.exists() ? userSnap.data()?.stripeCustomerId : null;
      
      // If no customer ID exists, create a new customer in Stripe
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: email,
          metadata: {
            userId: userId  // Always include userId in metadata
          }
        });
        stripeCustomerId = customer.id;
        console.log(`✅ Created new Stripe customer: ${stripeCustomerId} for user: ${userId}`);
        
        // Save Stripe customer ID to user record
        if (userSnap.exists()) {
          await updateDoc(userRef, {
            stripeCustomerId: stripeCustomerId,
            email: email // Ensure email is also stored
          });
          console.log('✅ Updated existing user with stripeCustomerId');
        } else {
          // Create new user document if it doesn't exist
          await setDoc(userRef, {
            email: email,
            stripeCustomerId: stripeCustomerId,
            plan: 'free',
            createdAt: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Error creating/updating user:', error);
      // Create a customer anyway if Firestore update fails
      if (!stripeCustomerId) {
        try {
          const customer = await stripe.customers.create({
            email: email,
            metadata: {
              userId: userId
            }
          });
          stripeCustomerId = customer.id;
        } catch (stripeError) {
          console.error('Error creating Stripe customer:', stripeError);
          return NextResponse.json(
            { error: 'Failed to create customer' },
            { status: 500 }
          );
        }
      }
    }
    
    // Get the origin from the headers to handle different domains
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL;
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/dashboard/settings/plan-billing?success=true`,
      cancel_url: `${origin}/dashboard/settings/plans?canceled=true`,
      metadata: {
        userId: userId,
        planId: planId,
        billingPeriod: billingPeriod
      },
    });
    
    return NextResponse.json({ id: session.id });
  } catch (error) {
    console.error('Checkout session error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
