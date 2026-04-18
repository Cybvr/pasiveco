
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { PaystackService } from '@/services/paystackService';
import { loops, LOOPS_TEMPLATES } from '@/lib/loops';
import { adminDb, adminAuth } from '@/lib/firebaseAdmin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    // Verify webhook signature
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);

    switch (event.event) {
      case 'charge.success':
        await handleSuccessfulPayment(event.data);
        break;
      case 'charge.failed':
        await handleFailedPayment(event.data);
        break;
      default:
        console.log(`Unhandled event: ${event.event}`);
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleSuccessfulPayment(data: any) {
  try {
    const { reference, metadata, customer, amount } = data;
    
    // Here you would typically:
    // 1. Update order status in your database
    // 2. Send confirmation email to customer
    // 3. Grant access to digital product
    // 4. Update analytics
    
    console.log('Payment successful:', {
      reference,
      productId: metadata?.product_id,
      customerEmail: customer?.email,
      amount: amount / 100, // Convert from kobo
    });

    // TODO: Implement your business logic here
    // Example: Update order in Firebase
    // await updateOrderStatus(reference, 'completed');
    // await grantProductAccess(customer.email, metadata.product_id);

    // Handle Gift Payments
    let giftMetadata = metadata;
    if (typeof giftMetadata === 'string') {
      try { giftMetadata = JSON.parse(giftMetadata); } catch (e) { giftMetadata = {}; }
    }

    let isGift = false;
    let giftDisplayName = 'Gift';
    if (giftMetadata?.type === 'gift' || reference.startsWith('gift_')) {
      isGift = true;
      try {
        let giftId = giftMetadata?.giftId;

        // Fallback: Find gift by reference
        if (!giftId) {
          const snap = await adminDb.collection('gifts').where('reference', '==', reference).limit(1).get();
          if (!snap.empty) giftId = snap.docs[0].id;
        }

        if (giftId) {
          const giftDoc = await adminDb.collection('gifts').doc(giftId).get();
          const giftData = giftDoc.data();
          if (giftData?.creatorName) giftDisplayName = `Gift to @${giftData.creatorName}`;
          
          await adminDb.collection('gifts').doc(giftId).update({
            status: 'success',
            updatedAt: FieldValue.serverTimestamp(),
            paystackData: { reference, customerEmail: customer.email, amount: amount / 100 }
          });
          console.log('🎁 Gift updated to success via webhook');

          // Notify Creator via Loops
          if (loops && giftData?.creatorId) {
            try {
              const creator = await adminAuth.getUser(giftData.creatorId);
              if (creator.email) {
                await loops.sendTransactionalEmail({
                  transactionalId: LOOPS_TEMPLATES.PURCHASE_CONFIRMATION, // Fallback for now
                  email: creator.email,
                  dataVariables: {
                    productId: `Gift from ${giftData.senderName || 'a supporter'}`,
                    amount: (amount / 100).toString(),
                  },
                });
                console.log('📧 Notified creator of gift:', creator.email);
              }
            } catch (err) {
              console.error('Failed to notify creator via Loops:', err);
            }
          }
        } else {
          console.warn('Gift not found for reference:', reference);
        }
      } catch (giftErr) {
        console.error('Error updating gift:', giftErr);
      }
    }

    // Send purchase confirmation email via Loops
    if (loops && customer?.email) {
      try {
        await loops.sendTransactionalEmail({
          transactionalId: LOOPS_TEMPLATES.PURCHASE_CONFIRMATION,
          email: customer.email,
          dataVariables: {
            productId: isGift ? giftDisplayName : (metadata?.product_id || 'Product'),
            amount: (amount / 100).toString(),
          },
        });
      } catch (err) {
        console.error('[Loops] Failed to send purchase confirmation:', err);
      }
    }

    // Save Card Authorization for "Saved Cards" feature
    if (data.authorization && metadata?.userId) {
      try {
        const { authorization } = data;
        const userId = metadata.userId;

        // Check if card is already saved
        const existingSnap = await adminDb.collection('saved_cards')
          .where('userId', '==', userId)
          .where('last4', '==', authorization.last4)
          .where('expMonth', '==', Number(authorization.exp_month))
          .where('expYear', '==', Number(authorization.exp_year))
          .limit(1)
          .get();

        if (existingSnap.empty) {
          await adminDb.collection('saved_cards').add({
            userId,
            authorizationCode: authorization.authorization_code,
            last4: authorization.last4,
            brand: (authorization.brand || 'card').toLowerCase(),
            expMonth: Number(authorization.exp_month),
            expYear: Number(authorization.exp_year),
            bank: authorization.bank || null,
            email: customer.email,
            gateway: 'paystack',
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
            isDefault: false
          });
          console.log('💳 Card saved for user:', userId);
        }
      } catch (cardErr) {
        console.error('Error saving card authorization:', cardErr);
      }
    }
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}

async function handleFailedPayment(data: any) {
  try {
    const { reference, metadata } = data;
    
    console.log('Payment failed:', {
      reference,
      productId: metadata?.product_id,
    });

    // TODO: Implement failure handling
    // Example: Update order status, send notification

    // Send payment failed email via Loops
    if (loops && data?.customer?.email) {
      try {
        await loops.sendTransactionalEmail({
          transactionalId: LOOPS_TEMPLATES.PAYMENT_FAILED,
          email: data.customer.email,
          dataVariables: {
            productId: metadata?.product_id || '',
          },
        });
      } catch (err) {
        console.error('[Loops] Failed to send payment failed email:', err);
      }
    }
  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
}
