
import { db } from '@/lib/firebase';
import { collection, getDocs, getDoc, doc, updateDoc, addDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

export interface Feature {
  id: string;
  title: string;
  description: string;
  href: string;
  slug: string;
  icon?: string;
  content?: string;
  featuredImage?: string;
  imageUrl?: string; // Keep for backwards compatibility
  createdAt?: Date;
  updatedAt?: Date;
}

export const featuresService = {
  async getAllFeatures() {
    const snapshot = await getDocs(collection(db, 'features'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Feature));
  },

  async updateFeature(id: string, feature: Partial<Feature>) {
    const docRef = doc(db, 'features', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return await setDoc(docRef, feature);
    }
    return await updateDoc(docRef, feature);
  },

  async createFeature(feature: Feature) {
    const slug = feature.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return await addDoc(collection(db, 'features'), { ...feature, slug });
  },

  async deleteFeature(id: string) {
    return await deleteDoc(doc(db, 'features', id));
  },

  async getFeature(id: string) {
    const docRef = await getDoc(doc(db, 'features', id));
    return docRef.exists() ? { id: docRef.id, ...docRef.data() } as Feature : null;
  }
};
