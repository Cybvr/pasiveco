import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const termiiApiKey = process.env.TERMII_API_KEY;
    const termiiSenderId = process.env.TERMII_SENDER_ID || 'N-Alert';

    if (!termiiApiKey) {
      return NextResponse.json({ error: 'Termii API Key is missing' }, { status: 500 });
    }

    const payload = {
      api_key: termiiApiKey,
      message_type: 'NUMERIC',
      to: phone.replace('+', ''), // Termii expects numbers without the +
      from: termiiSenderId,
      channel: 'dnd', // Best for OTPs in Nigeria to bypass Do-Not-Disturb routing
      pin_attempts: 3,
      pin_time_to_live: 10,
      pin_length: 6,
      pin_placeholder: '< 1234 >',
      message_text: 'Your Pasive verification code is < 1234 >. It expires in 10 minutes.',
      pin_type: 'NUMERIC'
    };

    const response = await fetch('https://api.ng.termii.com/api/sms/otp/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok || !data.pinId) {
      return NextResponse.json({ error: data.message || 'Failed to send OTP' }, { status: 400 });
    }

    // Return the pinId so the frontend can securely use it for verification
    return NextResponse.json({ success: true, pinId: data.pinId });

  } catch (error) {
    console.error('Termii send OTP error:', error);
    return NextResponse.json({ error: 'Internal server error while sending OTP' }, { status: 500 });
  }
}
