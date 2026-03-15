
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { PaystackService } from '@/services/paystackService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    // Verify webhook signature
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);

    switch (event.event) {
      case 'charge.success':
        await handleSuccessfulPayment(event.data);
        break;
      case 'charge.failed':
        await handleFailedPayment(event.data);
        break;
      default:
        console.log(`Unhandled event: ${event.event}`);
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleSuccessfulPayment(data: any) {
  try {
    const { reference, metadata, customer, amount } = data;
    
    // Here you would typically:
    // 1. Update order status in your database
    // 2. Send confirmation email to customer
    // 3. Grant access to digital product
    // 4. Update analytics
    
    console.log('Payment successful:', {
      reference,
      productId: metadata?.product_id,
      customerEmail: customer?.email,
      amount: amount / 100, // Convert from kobo
    });

    // TODO: Implement your business logic here
    // Example: Update order in Firebase
    // await updateOrderStatus(reference, 'completed');
    // await grantProductAccess(customer.email, metadata.product_id);
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}

async function handleFailedPayment(data: any) {
  try {
    const { reference, metadata } = data;
    
    console.log('Payment failed:', {
      reference,
      productId: metadata?.product_id,
    });

    // TODO: Implement failure handling
    // Example: Update order status, send notification
  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
}
