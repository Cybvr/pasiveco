import { NextRequest, NextResponse } from 'next/server';
import { StripeService } from '@/services/stripeService';
import { FlutterwaveService } from '@/services/flutterwaveService';
import { createTransaction } from '@/services/transactionsService';

export async function POST(request: NextRequest) {
  try {
    const { reference, transactionId } = await request.json();

    if (!reference && !transactionId) {
      return NextResponse.json({ error: 'Reference or Transaction ID is required' }, { status: 400 });
    }

    // Handle Prototype mode
    if (reference?.startsWith('PROTOTYPE-')) {
      return NextResponse.json({
        success: true,
        message: 'PROTOTYPE: Transaction simulated successfully',
        transaction: { status: 'success', reference },
      });
    }

    let verification: any;
    let gateway: 'stripe' | 'flutterwave' | null = null;

    if (reference?.startsWith('cs_')) {
      // Stripe Checkout Session
      gateway = 'stripe';
      verification = await StripeService.verifySession(reference);
    } else if (transactionId || reference?.startsWith('flw_')) {
      // Flutterwave
      gateway = 'flutterwave';
      verification = await FlutterwaveService.verifyPayment(transactionId || reference);
    } else {
      return NextResponse.json({ error: 'Unsupported reference format' }, { status: 400 });
    }

    if (!verification.status || !verification.data) {
      return NextResponse.json(
        { success: false, message: verification.message || 'Unable to verify transaction' },
        { status: 400 }
      );
    }

    const data = verification.data;
    let status = '';
    let amount = 0;
    let currency = '';
    let metadata: any = {};
    let customerEmail = '';

    if (gateway === 'stripe') {
      status = data.payment_status === 'paid' ? 'success' : 'failed';
      amount = (data.amount_total || 0) / 100;
      currency = (data.currency || 'USD').toUpperCase();
      metadata = data.metadata || {};
      customerEmail = data.customer_email || '';
    } else {
      status = data.status === 'successful' ? 'success' : 'failed';
      amount = data.amount || 0;
      currency = (data.currency || 'USD').toUpperCase();
      metadata = data.meta || {};
      customerEmail = data.customer?.email || '';
    }

    if (status === 'success') {
      try {
        await createTransaction({
          sellerId: metadata.seller_id || metadata.sellerId || '',
          productId: metadata.product_id || metadata.productId || '',
          productName: metadata.product_name || metadata.productName || 'Product',
          customerName: metadata.customer_name || metadata.customerName || '',
          customerEmail: customerEmail,
          customerPhone: metadata.customer_phone || metadata.customerPhone || '',
          reference: reference || transactionId,
          amount: amount,
          currency: currency,
          couponDiscount: Number(metadata.coupon_discount || metadata.couponDiscount || 0),
          affiliate: metadata.affiliate || '',
          yourProfit: amount * 0.9,
          customCharge: Number(metadata.custom_charge || metadata.customCharge || 0),
          payoutDate: null,
          variation: metadata.variation || '',
          status: 'success'
        });
      } catch (dbError) {
        console.error('Error saving transaction to DB:', dbError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Transaction verified',
      status,
      data: verification.data,
    });
  } catch (error) {
    console.error('Verification route error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify transaction' },
      { status: 500 }
    );
  }
}
