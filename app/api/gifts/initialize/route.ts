import { NextResponse } from 'next/server';
import { PaystackService } from '@/services/paystackService';
import { BitnobService } from '@/services/bitnobService';
import { adminDb, adminAuth } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Resolves the correct Firebase Auth UID for a creator.
 * The creatorId passed from the frontend may be an old Firestore doc ID, not the Auth UID.
 * We look up all user docs with that username and verify which doc ID is the real Auth UID.
 */
async function resolveCreatorAuthUid(creatorName: string, fallbackDocId: string): Promise<string> {
  try {
    const sanitized = creatorName.replace(/^@/, '').trim();
    const snap = await adminDb.collection('users').where('username', '==', sanitized).get();

    for (const doc of snap.docs) {
      try {
        // If this doc ID is a valid Auth UID, getUser() will succeed
        await adminAuth.getUser(doc.id);
        return doc.id; // This is the real Auth UID
      } catch {
        // Not a valid Auth UID, try next doc
      }
    }
  } catch (err) {
    console.error('Error resolving creator Auth UID:', err);
  }
  return fallbackDocId; // Best-effort fallback
}

export async function POST(request: Request) {
  try {
    const {
      creatorId,
      creatorName,
      amount,
      currency = 'NGN',
      paymentMethod,
      senderName,
      senderEmail,
      message,
      senderId
    } = await request.json();

    if (!creatorId || !amount || !paymentMethod) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (paymentMethod === 'paystack' && !process.env.PAYSTACK_SECRET_KEY) {
      return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 500 });
    }

    // Resolve the real Firebase Auth UID for the creator
    const resolvedCreatorId = await resolveCreatorAuthUid(creatorName, creatorId);
    console.log(`Gift: resolved creatorId ${creatorId} → ${resolvedCreatorId}`);

    const reference = `gift_${resolvedCreatorId}_${Date.now()}`;
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
    const sanitizedCreatorName = (creatorName || '').replace(/^@/, '');

    // Save the pending gift record using Admin SDK (bypasses security rules)
    let giftId: string | null = null;
    try {
      const giftRef = await adminDb.collection('gifts').add({
        creatorId: resolvedCreatorId,
        creatorName: sanitizedCreatorName,
        senderId: senderId || null,
        senderName: senderName || 'Anonymous',
        senderEmail: senderEmail || 'anonymous@pasive.co',
        amount,
        currency,
        message: message || '',
        status: 'pending',
        paymentMethod,
        reference,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      giftId = giftRef.id;
      console.log(`Gift record created: ${giftId}`);
    } catch (dbError) {
      console.error('Failed to save gift record:', dbError);
      // Continue — don't block the payment
    }

    if (paymentMethod === 'paystack') {
      const result = await PaystackService.initializeTransaction({
        reference,
        amount,
        email: senderEmail || 'gift@pasive.co',
        currency,
        callback_url: `${origin}/${encodeURIComponent(sanitizedCreatorName)}?status=gift_success&reference=${reference}`,
        metadata: {
          giftId,
          creatorId: resolvedCreatorId,
          type: 'gift',
          senderName: senderName || 'Anonymous',
        },
      });

      if (result.status && result.url) {
        return NextResponse.json({ link: result.url, giftId });
      }
      return NextResponse.json({ error: result.message || 'Failed to initialize Paystack', details: result }, { status: 400 });
    }

    if (paymentMethod === 'crypto') {
      const result = await BitnobService.createCheckout({
        amount: Math.round(amount * 100),
        email: senderEmail || 'gift@pasive.co',
        description: `Gift to ${sanitizedCreatorName} on Pasive`,
        reference,
        callbackUrl: `${origin}/api/webhooks/bitnob`,
        successUrl: `${origin}/${encodeURIComponent(sanitizedCreatorName)}?status=gift_success&reference=${reference}`,
        errorUrl: `${origin}/${encodeURIComponent(sanitizedCreatorName)}?status=gift_error`,
      });

      if (result.status && result.data?.checkoutUrl) {
        return NextResponse.json({ link: result.data.checkoutUrl, giftId });
      }
      return NextResponse.json({ error: result.message || 'Failed to initialize Bitnob' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
  } catch (error: any) {
    console.error('Gift Initialization Crash:', error);
    return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 });
  }
}
