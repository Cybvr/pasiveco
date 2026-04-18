import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export interface ServerAnalyticsEvent {
  userId: string;
  eventType: 'gift_received' | 'sale_completed';
  eventData: {
    amount?: number;
    currency?: string;
    senderName?: string;
    giftId?: string;
    reference?: string;
    [key: string]: any;
  };
  timestamp?: any;
}

export const trackServerEvent = async (event: ServerAnalyticsEvent) => {
  try {
    await adminDb.collection('analytics').add({
      ...event,
      timestamp: FieldValue.serverTimestamp(),
    });
    console.log(`[Analytics] Tracked server event: ${event.eventType}`);
  } catch (error) {
    console.error('[Analytics] Error tracking server event:', error);
  }
};
