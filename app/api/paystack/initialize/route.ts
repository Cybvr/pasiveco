import { NextRequest, NextResponse } from 'next/server';
import { PaymentGatewayService } from '@/services/paymentGatewayService';
import { StripeService } from '@/services/stripeService';

export async function POST(request: NextRequest) {
  try {
    const {
      userId,
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

    let customerId: string | null = null;

    if (userId && typeof userId === 'string' && currency && ['USD', 'EUR', 'GBP', 'CAD', 'AUD'].includes(String(currency).toUpperCase())) {
      customerId = await StripeService.ensureCustomer({ userId, email });
    }

    const initialization = await PaymentGatewayService.initializeCheckout({
      email,
      amount,
      currency: currency || 'USD',
      productId,
      productName: productName || 'Product',
      slug: slug || '',
      hostname: request.nextUrl.host,
      customerId,
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
    const authorizationUrl =
      'url' in initialization
        ? initialization.url
        : 'link' in initialization
          ? initialization.link
          : undefined;

    const initializationId = 'id' in initialization ? initialization.id : undefined;

    return NextResponse.json({
      success: true,
      authorizationUrl,
      id: initializationId,
    });
  } catch (error) {
    console.error('Checkout initialize route error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize transaction' },
      { status: 500 }
    );
  }
}
