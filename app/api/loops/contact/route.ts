import { NextRequest, NextResponse } from 'next/server';
import { loops, LOOPS_TEMPLATES } from '@/lib/loops';

export async function POST(request: NextRequest) {
  if (!loops) {
    return NextResponse.json({ success: false, error: 'Loops not configured' }, { status: 500 });
  }

  try {
    const { email, firstName, userId, source } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    // Upsert the contact in Loops (SDK v2 uses single object arg)
    await loops.createContact({
      email,
      properties: {
        firstName: firstName || '',
        userId: userId || '',
        source: source || 'register',
      },
    });

    // Fire the 'signup' event to trigger any onboarding sequences (Loops)
    await loops.sendEvent({
      email,
      eventName: 'signup',
    });

    // Send welcome transactional email
    await loops.sendTransactionalEmail({
      transactionalId: LOOPS_TEMPLATES.WELCOME,
      email,
      dataVariables: {
        firstName: firstName || 'there',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Loops] createContact error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
