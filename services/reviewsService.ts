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
  updateDoc,
  increment
} from 'firebase/firestore';

export interface Review {
  id?: string;
  productId: string;
  userId: string;
  userName: string;
  userImage?: string;
  rating: number;
  comment: string;
  createdAt: Timestamp;
}

export const addReview = async (reviewData: Omit<Review, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'reviews'), {
      ...reviewData,
      createdAt: Timestamp.now()
    });

    // Update product average rating
    const productRef = doc(db, 'products', reviewData.productId);
    const productSnap = await getDoc(productRef);
    
    if (productSnap.exists()) {
      const product = productSnap.data();
      const currentRating = product.rating || 0;
      const currentCount = product.reviewsCount || 0;
      
      const newCount = currentCount + 1;
      const newRating = ((currentRating * currentCount) + reviewData.rating) / newCount;
      
      await updateDoc(productRef, {
        rating: Number(newRating.toFixed(1)),
        reviewsCount: newCount,
        updatedAt: Timestamp.now()
      });
    }

    return docRef.id;
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
};

export const getProductReviews = async (productId: string): Promise<Review[]> => {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('productId', '==', productId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Review[];
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
};

export const hasUserPurchasedProduct = async (userId: string, productId: string, userEmail: string): Promise<boolean> => {
  try {
    // Check by email in transactions
    const q = query(
      collection(db, 'transactions'),
      where('productId', '==', productId),
      where('customerEmail', '==', userEmail),
      where('status', '==', 'success')
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking purchase status:', error);
    return false;
  }
};
