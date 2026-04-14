import { NextRequest, NextResponse } from 'next/server';
import { loops, LOOPS_TEMPLATES } from '@/lib/loops';
import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('verif-hash');
    const secretHash = process.env.FLUTTERWAVE_WEBHOOK_HASH;

    if (!signature || signature !== secretHash) {
      return NextResponse.json({ error: 'Invalid verification hash' }, { status: 401 });
    }

    const payload = await request.json();
    const { event, data } = payload;

    switch (event) {
      case 'charge.completed':
        await handleSuccessfulPayment(data);
        break;
      case 'transfer.completed':
        await handleTransferCompleted(data);
        break;
      default:
        console.log(`Unhandled Flutterwave event: ${event}`);
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Flutterwave Webhook Error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleSuccessfulPayment(data: any) {
  const { tx_ref, amount, currency, customer, meta, id: transactionId, plan: flutterwavePlanId } = data;

  console.log('Flutterwave Payment Successful:', {
    tx_ref,
    userId: meta?.userId,
    planId: meta?.planId,
    customerEmail: customer?.email,
    amount,
  });

  // Handle Subscription Upgrades
  if (meta?.userId && meta?.planId) {
    const userId = meta.userId;
    const planId = meta.planId;
    const billingPeriod = meta.billingPeriod;

    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        plan: planId,
        subscriptionStatus: 'active',
        subscriptionId: transactionId.toString(),
        subscriptionType: 'flutterwave',
        flutterwavePlanId: flutterwavePlanId || null,
        billingPeriod: billingPeriod,
        updatedAt: serverTimestamp(),
      });

      // Log the transaction
      await addDoc(collection(db, 'invoices'), {
        userId,
        amountPaid: amount,
        currency: currency,
        status: 'paid',
        planId,
        billingPeriod,
        transactionId: transactionId.toString(),
        gateway: 'flutterwave',
        createdAt: serverTimestamp(),
      });

      console.log(`✅ User ${userId} upgraded to ${planId} via Flutterwave`);
    } catch (dbError) {
      console.error('Error updating user subscription in Firestore:', dbError);
    }
  }

  // Business logic: Send confirmation email
  if (loops && customer?.email) {
    try {
      await loops.sendTransactionalEmail({
        transactionalId: LOOPS_TEMPLATES.PURCHASE_CONFIRMATION,
        email: customer.email,
        dataVariables: {
          productId: meta?.planId || meta?.productId || 'Subscription Upgrade',
          amount: amount.toString(),
        },
      });
    } catch (err) {
      console.error('[Loops] Failed to send purchase confirmation:', err);
    }
  }
}

async function handleTransferCompleted(data: any) {
  const { reference, amount, status, complete_message } = data;
  console.log('Flutterwave Transfer Completed:', {
    reference,
    amount,
    status,
    message: complete_message,
  });

  // Update payout record in Firestore if status is 'SUCCESSFUL'
}
