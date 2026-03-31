import { NextRequest, NextResponse } from 'next/server';
import { PaymentGatewayService } from '@/services/paymentGatewayService';

export async function POST(request: NextRequest) {
  try {
    const {
      email,
      amount,
      currency,
      productId,
      productName,
      slug,
      metadata = {},
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

    const initialization = await PaymentGatewayService.initializeCheckout({
      email,
      amount,
      currency: currency || 'USD',
      productId,
      productName: productName || 'Product',
      slug: slug || '',
      hostname: request.nextUrl.host,
      metadata: {
        ...metadata,
        productId,
      },
    });

    if (!initialization.status) {
      return NextResponse.json(
        {
          success: false,
          message: initialization.message || 'Unable to initialize transaction',
        },
        { status: 400 }
      );
    }

    // Return the authorization URL (Stripe Checkout or Flutterwave Payment Link)
    return NextResponse.json({
      success: true,
      authorizationUrl: initialization.url || initialization.link,
      id: initialization.id, // For Stripe
    });
  } catch (error) {
    console.error('Checkout initialize route error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize transaction' },
      { status: 500 }
    );
  }
}
