// services/templateService.ts

import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, getDoc, getDocs, deleteDoc, query, where, Timestamp } from 'firebase/firestore';

interface TemplateData {
  name: string;
  customization: {
    frame: string;
    frameText: string;
    frameColor: string;
    backgroundColor: string;
    qrCodeColor: string;
    logo: string;
  };
}

interface Template extends TemplateData {
  id: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export async function createTemplate(userId: string, templateData: TemplateData): Promise<Template> {
  try {
    const docRef = await addDoc(collection(db, 'templates'), {
      ...templateData,
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return {
      id: docRef.id,
      userId,
      ...templateData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
  } catch (error) {
    console.error('Error creating template:', error);
    throw new Error('Failed to create template');
  }
}

export async function getUserTemplates(userId: string): Promise<Template[]> {
  try {
    const q = query(collection(db, 'templates'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Template));
  } catch (error) {
    console.error('Error fetching user templates:', error);
    throw new Error('Failed to fetch user templates');
  }
}

export async function getTemplate(templateId: string): Promise<Template | null> {
  try {
    const docRef = doc(db, 'templates', templateId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Template;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching template:', error);
    throw new Error('Failed to fetch template');
  }
}

export async function updateTemplate(templateId: string, templateData: Partial<TemplateData>): Promise<Template> {
  try {
    const docRef = doc(db, 'templates', templateId);
    await updateDoc(docRef, {
      ...templateData,
      updatedAt: Timestamp.now()
    });
    const updatedDoc = await getDoc(docRef);
    return { id: updatedDoc.id, ...updatedDoc.data() } as Template;
  } catch (error) {
    console.error('Error updating template:', error);
    throw new Error('Failed to update template');
  }
}

export async function deleteTemplate(templateId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'templates', templateId));
  } catch (error) {
    console.error('Error deleting template:', error);
    throw new Error('Failed to delete template');
  }
}