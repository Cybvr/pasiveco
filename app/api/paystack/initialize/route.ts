import { NextRequest, NextResponse } from 'next/server';
import { PaystackService } from '@/services/paystackService';

export async function POST(request: NextRequest) {
  try {
    const {
      email,
      amount,
      currency,
      productId,
      productName,
      customerName,
      customerPhone,
      orderNote,
      channels,
      sellerId,
      affiliate,
      couponDiscount,
      customCharge,
      variation,
      slug,
    } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ success: false, error: 'A valid amount is required' }, { status: 400 });
    }

    if (!productId || typeof productId !== 'string') {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    const normalizedSlug = typeof slug === 'string' && slug.trim() ? slug.trim() : '';
    const callbackPath = normalizedSlug
      ? `/${normalizedSlug}/product/${productId}/confirmation`
      : `/product/${productId}/confirmation`;

    const callbackUrl = new URL(callbackPath, request.nextUrl.origin);

    const initialization = await PaystackService.initializeTransaction({
      email,
      amount: PaystackService.convertToKobo(amount, currency || 'NGN'),
      currency: currency || 'NGN',
      callback_url: callbackUrl.toString(),
      channels: Array.isArray(channels) ? channels : undefined,
      metadata: {
        product_id: productId,
        product_name: productName || 'Product',
        customer_name: customerName || '',
        customer_phone: customerPhone || '',
        order_note: orderNote || '',
        seller_id: sellerId || '',
        coupon_discount: typeof couponDiscount === 'number' ? couponDiscount : 0,
        affiliate: affiliate || '',
        custom_charge: typeof customCharge === 'number' ? customCharge : 0,
        variation: variation || '',
      },
    });

    if (!initialization.status || !initialization.data?.authorization_url) {
      return NextResponse.json(
        {
          success: false,
          message: initialization.message || 'Unable to initialize transaction',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      authorizationUrl: initialization.data.authorization_url,
      reference: initialization.data.reference,
    });
  } catch (error) {
    console.error('Paystack initialize route error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize transaction' },
      { status: 500 }
    );
  }
}
