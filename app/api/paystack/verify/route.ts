import { NextRequest, NextResponse } from 'next/server';
import { PaystackService } from '@/services/paystackService';

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
