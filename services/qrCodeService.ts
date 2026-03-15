import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  increment
} from 'firebase/firestore';

export interface QRCodeRecord {
  id?: string;
  userId: string;
  name: string;
  url: string;
  type: 'profile' | 'custom' | 'url' | 'vcard' | 'wifi' | 'text';
  foreground: string;
  background: string;
  size: number;
  margin: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  logo?: string;
  logoSize: number;
  scanCount: number;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastScanned?: Timestamp;
}

export const createQRCode = async (qrData: Omit<QRCodeRecord, 'id' | 'createdAt' | 'updatedAt' | 'scanCount'>) => {
  try {
    const docRef = await addDoc(collection(db, 'qrCodes'), {
      ...qrData,
      scanCount: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating QR code:', error);
    throw error;
  }
};

export const getUserQRCodes = async (userId: string): Promise<QRCodeRecord[]> => {
  try {
    const q = query(
      collection(db, 'qrCodes'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as QRCodeRecord[];
  } catch (error) {
    console.error('Error fetching user QR codes:', error);
    throw error;
  }
};

export const getQRCode = async (qrCodeId: string): Promise<QRCodeRecord | null> => {
  try {
    const docRef = doc(db, 'qrCodes', qrCodeId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as QRCodeRecord;
    }
    return null;
  } catch (error) {
    console.error('Error fetching QR code:', error);
    throw error;
  }
};

export const updateQRCode = async (qrCodeId: string, updates: Partial<QRCodeRecord>) => {
  try {
    const qrCodeRef = doc(db, 'qrCodes', qrCodeId);
    await updateDoc(qrCodeRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating QR code:', error);
    throw error;
  }
};

export const deleteQRCode = async (qrCodeId: string) => {
  try {
    await deleteDoc(doc(db, 'qrCodes', qrCodeId));
  } catch (error) {
    console.error('Error deleting QR code:', error);
    throw error;
  }
};

export const incrementScanCount = async (qrCodeId: string) => {
  try {
    const qrCodeRef = doc(db, 'qrCodes', qrCodeId);
    await updateDoc(qrCodeRef, {
      scanCount: increment(1),
      lastScanned: Timestamp.now()
    });
  } catch (error) {
    console.error('Error incrementing scan count:', error);
    throw error;
  }
};