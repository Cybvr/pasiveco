import { NextRequest, NextResponse } from 'next/server';
import { loops, LOOPS_TEMPLATES } from '@/lib/loops';

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
  const { tx_ref, amount, currency, customer, meta } = data;

  console.log('Flutterwave Payment Successful:', {
    tx_ref,
    productId: meta?.productId,
    customerEmail: customer?.email,
    amount,
  });

  // Business logic: Update Firestore, grant access, etc.

  if (loops && customer?.email) {
    try {
      await loops.sendTransactionalEmail({
        transactionalId: LOOPS_TEMPLATES.PURCHASE_CONFIRMATION,
        email: customer.email,
        dataVariables: {
          productId: meta?.productId || '',
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
