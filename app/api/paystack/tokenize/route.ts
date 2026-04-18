import { NextRequest, NextResponse } from 'next/server';
import { PaystackService } from '@/services/paystackService';

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json();

    if (!userId || !email) {
      return NextResponse.json({ success: false, message: 'Missing user details' }, { status: 400 });
    }

    const reference = `tokenize_${userId}_${Date.now()}`;
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // To save a card, Paystack requires a valid transaction. 
    // We charge NGN 50 (5000 kobo), which is the minimum.
    // In a real production app, you might want to automatically refund this via webhook.
    const initialization = await PaystackService.initializeTransaction({
      email,
      amount: 50,
      currency: 'NGN',
      reference,
      callback_url: `${origin}/dashboard/settings/plan-billing?card_saved=true`,
      metadata: {
        userId,
        is_tokenization: true, // Custom flag to identify this type of transaction
        custom_fields: [
          {
            display_name: "Purpose",
            variable_name: "purpose",
            value: "Card Verification"
          }
        ]
      },
    });

    if (!initialization.status) {
      return NextResponse.json(
        { success: false, message: initialization.message || 'Unable to initialize card setup' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, url: initialization.url });
  } catch (error: any) {
    console.error('Tokenize route error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to setup card' },
      { status: 500 }
    );
  }
}
