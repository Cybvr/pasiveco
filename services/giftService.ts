import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
} from 'firebase/firestore';

export interface GiftRecord {
  id: string;
  creatorId: string;
  creatorName: string;
  senderId: string | null;
  senderName: string;
  senderEmail: string;
  amount: number;
  currency: string;
  message: string;
  status: 'pending' | 'success' | 'failed';
  paymentMethod: 'paystack' | 'crypto';
  reference: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Fetch gifts sent by a user
 */
export const getSentGifts = async (userId: string): Promise<GiftRecord[]> => {
  try {
    const q = query(
      collection(db, 'gifts'),
      where('senderId', '==', userId),
      where('status', 'in', ['success', 'completed']),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as GiftRecord[];
  } catch (error) {
    console.error('Error fetching sent gifts:', error);
    return [];
  }
};

/**
 * Fetch gifts received by a creator
 */
export const getReceivedGifts = async (creatorId: string): Promise<GiftRecord[]> => {
  try {
    const q = query(
      collection(db, 'gifts'),
      where('creatorId', '==', creatorId),
      where('status', 'in', ['success', 'completed']),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as GiftRecord[];
  } catch (error) {
    console.error('Error fetching received gifts:', error);
    return [];
  }
};
