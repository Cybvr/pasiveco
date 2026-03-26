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
  targetId: string;
  targetType: 'product' | 'community';
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

    // Update target (product or community) average rating
    const collectionName = reviewData.targetType === 'product' ? 'products' : 'communities';
    const targetRef = doc(db, collectionName, reviewData.targetId);
    const targetSnap = await getDoc(targetRef);
    
    if (targetSnap.exists()) {
      const target = targetSnap.data();
      const currentRating = target.rating || 0;
      const currentCount = target.reviewsCount || 0;
      
      const newCount = currentCount + 1;
      const newRating = ((currentRating * currentCount) + reviewData.rating) / newCount;
      
      await updateDoc(targetRef, {
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

export const getReviews = async (targetId: string, targetType: 'product' | 'community'): Promise<Review[]> => {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('targetId', '==', targetId),
      where('targetType', '==', targetType),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Review[];
  } catch (error) {
    console.error('Error fetching reviews:', error);
    // Fallback for old reviews that might only have productId
    if (targetType === 'product') {
       try {
         const qOld = query(
           collection(db, 'reviews'),
           where('productId', '==', targetId),
           orderBy('createdAt', 'desc')
         );
         const querySnapshotOld = await getDocs(qOld);
         return querySnapshotOld.docs.map(doc => ({
           id: doc.id,
           targetId: targetId,
           targetType: 'product',
           ...doc.data()
         })) as Review[];
       } catch (innerError) {
         console.error('Error fetching old product reviews:', innerError);
         throw innerError;
       }
    }
    throw error;
  }
};

export const getProductReviews = (productId: string) => getReviews(productId, 'product');

export const canUserReview = async (userId: string, targetId: string, targetType: 'product' | 'community', userEmail?: string): Promise<boolean> => {
  try {
    // If it's a product, user says "anyone should be able to rate" but traditionally we check purchase.
    // The user explicitly stated: "anyone should be able to rate"
    // So we just check if they are logged in and haven't reviewed yet.
    
    const reviews = await getReviews(targetId, targetType);
    const alreadyReviewed = reviews.some(r => r.userId === userId);
    
    return !alreadyReviewed;
  } catch (error) {
    console.error('Error checking review eligibility:', error);
    return false;
  }
};

export const hasUserPurchasedProduct = async (userId: string, productId: string, userEmail: string): Promise<boolean> => {
  try {
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
