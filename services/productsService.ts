
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
  limit,
  Timestamp
} from 'firebase/firestore';
import { slugify } from '@/utils/slugify';

export interface ProductLesson {
  title: string;
  content?: string;
  videoUrl?: string;
}

export interface ProductAvailabilitySlot {
  day: string;
  start: string;
  end: string;
}

export interface ProductDetails {
  eventDateTime?: string;
  eventLocation?: string;
  quantityAvailable?: number;
  lessons?: ProductLesson[];
  dripSchedule?: string;
  enrollmentLimit?: number | null;
  fileName?: string;
  fileUrl?: string;
  billingInterval?: 'monthly' | 'yearly';
  perks?: string[];
  sessionLength?: number;
  availability?: ProductAvailabilitySlot[];
  videoLink?: string;
  includedProducts?: Array<{
    id: string;
    name: string;
  }>;
  deliveryMode?: 'silent_email' | 'silent_qr_email';
}

export interface Product {
  id?: string;
  userId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  url?: string;
  images: string[];
  thumbnail: string;
  status: 'active' | 'inactive' | 'draft';
  tags: string[];
  details?: ProductDetails;
  inventory: {
    quantity: number;
    trackInventory: boolean;
  };
  shipping: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    shippingRequired: boolean;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  paymentIntegration?: {
    paystack?: {
      enabled: boolean;
      publicKey: string;
    };
  };
  slug: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const createProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    console.log('Creating product in Firebase:', productData.name);
    console.log('User ID:', productData.userId);
    
    const slug = `${slugify(productData.name)}-${Math.random().toString(36).substring(2, 7)}`;
    
    const docRef = await addDoc(collection(db, 'products'), {
      ...productData,
      slug,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    console.log('Product created successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating product:', error);
    console.error('Product data that failed:', productData);
    throw error;
  }
};

export const getProduct = async (productId: string): Promise<Product | null> => {
  try {
    const docRef = doc(db, 'products', productId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product;
    }
    return null;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

export const getUserProducts = async (userId: string): Promise<Product[]> => {
  try {
    const q = query(
      collection(db, 'products'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
  } catch (error) {
    console.error('Error fetching user products:', error);
    throw error;
  }
};

export const updateProduct = async (productId: string, updates: Partial<Product>) => {
  try {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (productId: string) => {
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    const q = query(
      collection(db, 'products'),
      where('category', '==', category),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
};

export const getAllLatestProducts = async (limitCount = 10): Promise<Product[]> => {
  try {
    const q = query(
      collection(db, 'products'),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
  } catch (error) {
    console.error('Error fetching latest products:', error);
    throw error;
  }
};
export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  try {
    const q = query(collection(db, 'products'), where('slug', '==', slug), limit(1));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Product;
    }
    return null;
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    throw error;
  }
};
