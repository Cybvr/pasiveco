import { NextRequest, NextResponse } from 'next/server';
import { PaystackService } from '@/services/paystackService';
import { createTransaction } from '@/services/transactionsService';

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json();

    if (!reference || typeof reference !== 'string') {
      return NextResponse.json({ error: 'Reference is required' }, { status: 400 });
    }

    const verification = await PaystackService.verifyTransaction(reference);

    if (!verification.status || !verification.data) {
      return NextResponse.json(
        {
          success: false,
          message: verification.message || 'Unable to verify transaction',
        },
        { status: 400 }
      );
    }

    const transaction = verification.data;
    const amount = transaction.amount || 0;

    if (transaction.status === 'success') {
      try {
        await createTransaction({
          sellerId: transaction.metadata?.seller_id || '',
          productId: transaction.metadata?.product_id || '',
          productName: transaction.metadata?.product_name || 'Product',
          customerName: transaction.metadata?.customer_name || '',
          customerEmail: transaction.customer?.email || '',
          customerPhone: transaction.metadata?.customer_phone || '',
          reference: transaction.reference,
          amount: amount / 100, // Convert from kobo
          currency: transaction.currency || 'NGN',
          couponDiscount: transaction.metadata?.coupon_discount || 0,
          affiliate: transaction.metadata?.affiliate || '',
          yourProfit: (amount / 100) * 0.9, // Provisional profit (e.g. 90%)
          customCharge: transaction.metadata?.custom_charge || 0,
          payoutDate: null,
          variation: transaction.metadata?.variation || '',
          status: 'success'
        });
      } catch (dbError) {
        console.error('Error saving transaction to DB:', dbError);
        // We still return success to the client because the payment was actually verified
      }
    }

    return NextResponse.json({
      success: true,
      message: verification.message,
      transaction: verification.data,
    });
  } catch (error) {
    console.error('Paystack verification route error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify transaction' },
      { status: 500 }
    );
  }
}
