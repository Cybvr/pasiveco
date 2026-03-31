import { NextRequest, NextResponse } from 'next/server';
import { StripeService } from '@/services/stripeService';
import { auth } from '@/lib/firebase-admin'; // Assuming admin auth is available

export async function POST(request: NextRequest) {
  try {
    const { email, country } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const connectAccount = await StripeService.createConnectAccount(email, country || 'US');

    if (!connectAccount.status) {
      return NextResponse.json({ error: connectAccount.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      url: connectAccount.url,
      accountId: connectAccount.accountId,
    });
  } catch (error) {
    console.error('Stripe Connect Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
