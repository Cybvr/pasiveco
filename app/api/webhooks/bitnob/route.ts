import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb, adminAuth } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { loops, LOOPS_TEMPLATES } from '@/lib/loops';
import { trackServerEvent } from '@/services/serverAnalyticsService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-bitnob-signature');

    if (process.env.BITNOB_WEBHOOK_SECRET && signature) {
      const hash = crypto
        .createHmac('sha256', process.env.BITNOB_WEBHOOK_SECRET)
        .update(body)
        .digest('hex');

      if (hash !== signature) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    }

    const event = JSON.parse(body);

    if (event.event === 'checkout.paid' || event.event === 'checkout.completed') {
      const { reference } = event.data;
      
      console.log('Bitnob Crypto Payment Success:', reference);
      
      try {
        const snap = await adminDb.collection('gifts').where('reference', '==', reference).limit(1).get();

        if (!snap.empty) {
          const giftDoc = snap.docs[0];
          const giftData = giftDoc.data();
          
          await giftDoc.ref.update({
            status: 'success',
            updatedAt: FieldValue.serverTimestamp(),
            bitnobData: event.data
          });
          console.log('Gift record updated to success via Bitnob');

          // Notify Sender
          if (loops && giftData.senderEmail) {
            await loops.sendTransactionalEmail({
              transactionalId: LOOPS_TEMPLATES.PURCHASE_CONFIRMATION,
              email: giftData.senderEmail,
              dataVariables: {
                productId: `Gift to ${giftData.creatorName}`,
                amount: giftData.amount.toString(),
              },
            });
          }

          // Notify Creator
          if (loops && giftData.creatorId) {
            try {
              const creator = await adminAuth.getUser(giftData.creatorId);
              if (creator.email) {
                await loops.sendTransactionalEmail({
                  transactionalId: LOOPS_TEMPLATES.PURCHASE_CONFIRMATION,
                  email: creator.email,
                  dataVariables: {
                    productId: `Crypto Gift from ${giftData.senderName || 'a supporter'}`,
                    amount: giftData.amount.toString(),
                  },
                });
              }
            } catch (err) {
              console.error('Failed to notify creator via Loops (Bitnob):', err);
            }
          }

          // Track in Analytics
          if (giftData?.creatorId) {
            await trackServerEvent({
              userId: giftData.creatorId,
              eventType: 'gift_received',
              eventData: {
                amount: giftData.amount,
                currency: giftData.currency,
                senderName: giftData.senderName,
                giftId: giftDoc.id,
                reference: reference
              }
            });
          }
        } else {
          console.warn('Gift not found for reference:', reference);
        }
      } catch (err) {
        console.error('Error updating gift from Bitnob webhook:', err);
      }
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Bitnob Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
