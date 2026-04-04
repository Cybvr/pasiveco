import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { pinId, pin } = await request.json();

    if (!pinId || !pin) {
      return NextResponse.json({ error: 'Pin ID and Pin are required' }, { status: 400 });
    }

    const termiiApiKey = process.env.TERMII_API_KEY;

    if (!termiiApiKey) {
      return NextResponse.json({ error: 'Termii API Key is missing' }, { status: 500 });
    }

    const payload = {
      api_key: termiiApiKey,
      pin_id: pinId,
      pin: pin
    };

    const response = await fetch('https://api.ng.termii.com/api/sms/otp/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok || data.verified !== 'true' && data.verified !== true) {
      return NextResponse.json({ error: data.message || 'Invalid verification code' }, { status: 400 });
    }

    // Return success when Termii successfully verifies the pin
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Termii verify OTP error:', error);
    return NextResponse.json({ error: 'Internal server error while verifying OTP' }, { status: 500 });
  }
}
