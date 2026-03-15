
import { db } from '@/lib/firebase';
import { collection, getDocs, getDoc, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { BarChart3, QrCode, Link, ShoppingCart, Brain } from 'lucide-react';

// Icon mapping for solutions
export const solutionIconMap = {
  'BarChart3': BarChart3,
  'QrCode': QrCode,
  'Link': Link,
  'ShoppingCart': ShoppingCart,
  'Brain': Brain
};

export interface Solution {
  id: string;
  title: string;
  description: string;
  href: string;
  slug: string;
  icon?: string;
  content?: string;
  featuredImage?: string;
}

export const solutionsService = {
  async getAllSolutions() {
    const snapshot = await getDocs(collection(db, 'solutions'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Solution));
  },

  async updateSolution(id: string, solution: Partial<Solution>) {
    return await updateDoc(doc(db, 'solutions', id), solution);
  },

  async createSolution(solution: Solution) {
    const slug = solution.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return await addDoc(collection(db, 'solutions'), { ...solution, slug });
  },

  async deleteSolution(id: string) {
    return await deleteDoc(doc(db, 'solutions', id));
  },

  async getSolution(id: string) {
    const docRef = await getDoc(doc(db, 'solutions', id));
    return docRef.exists() ? { id: docRef.id, ...docRef.data() } as Solution : null;
  }
};
