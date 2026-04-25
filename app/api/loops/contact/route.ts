import { NextRequest, NextResponse } from 'next/server';
import { transactionalEmailService } from '@/services/transactionalEmailService';

export async function POST(request: NextRequest) {

  try {
    const { email, firstName, userId, source } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    // Send welcome email via Resend
    await transactionalEmailService.sendWelcomeEmail({
      email,
      userName: firstName || 'there',
      ctaUrl: 'https://pasive.co/dashboard'
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Resend] Contact registration error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
