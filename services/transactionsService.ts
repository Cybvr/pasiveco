import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  doc as firestoreDoc,
  setDoc
} from 'firebase/firestore';
import { Transaction } from '@/types/transaction';

export const createTransaction = async (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'transactions'), {
      ...transactionData,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
};

export const getSellerTransactions = async (sellerId: string): Promise<Transaction[]> => {
  try {
    const q = query(
      collection(db, 'transactions'),
      where('sellerId', '==', sellerId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Transaction[];
  } catch (error) {
    console.error('Error fetching seller transactions:', error);
    throw error;
  }
};

export const getTransactionByReference = async (reference: string): Promise<Transaction | null> => {
  try {
    const q = query(collection(db, 'transactions'), where('reference', '==', reference));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Transaction;
    }
    return null;
  } catch (error) {
    console.error('Error fetching transaction by reference:', error);
    throw error;
  }
};
export const getAffiliateTransactions = async (affiliateId: string): Promise<Transaction[]> => {
  try {
    const q = query(
      collection(db, 'transactions'),
      where('affiliate', '==', affiliateId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Transaction[];
  } catch (error) {
    console.error('Error fetching affiliate transactions:', error);
    throw error;
  }
};

export const getCustomerTransactions = async (customerEmail: string): Promise<Transaction[]> => {
  try {
    const q = query(
      collection(db, 'transactions'),
      where('customerEmail', '==', customerEmail),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Transaction[];
  } catch (error) {
    console.error('Error fetching customer transactions:', error);
    throw error;
  }
};
