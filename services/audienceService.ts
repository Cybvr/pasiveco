
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
  Timestamp
} from 'firebase/firestore';

export interface AudienceSegment {
  id?: string;
  userId: string;
  name: string;
  description: string;
  criteria: {
    countries?: string[];
    devices?: string[];
    eventTypes?: string[];
    dateRange?: {
      start: Date;
      end: Date;
    };
    minViews?: number;
    minClicks?: number;
  };
  audienceCount: number;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AudienceInsight {
  id?: string;
  userId: string;
  metric: string;
  value: number;
  change: number;
  period: '24h' | '7d' | '30d';
  timestamp: Timestamp;
}

export interface Visitor {
  id?: string;
  userId: string;
  sessionId: string;
  firstVisit: Timestamp;
  lastVisit: Timestamp;
  totalViews: number;
  totalClicks: number;
  country?: string;
  city?: string;
  device?: string;
  referrer?: string;
  isReturning: boolean;
}

export const createAudienceSegment = async (segmentData: Omit<AudienceSegment, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'audience'), {
      ...segmentData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating audience segment:', error);
    throw error;
  }
};

export const getUserAudienceSegments = async (userId: string): Promise<AudienceSegment[]> => {
  try {
    const q = query(
      collection(db, 'audience'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AudienceSegment[];
  } catch (error) {
    console.error('Error fetching audience segments:', error);
    throw error;
  }
};

export const updateAudienceSegment = async (segmentId: string, updates: Partial<AudienceSegment>) => {
  try {
    const segmentRef = doc(db, 'audience', segmentId);
    await updateDoc(segmentRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating audience segment:', error);
    throw error;
  }
};

export const deleteAudienceSegment = async (segmentId: string) => {
  try {
    await deleteDoc(doc(db, 'audience', segmentId));
  } catch (error) {
    console.error('Error deleting audience segment:', error);
    throw error;
  }
};

export const trackVisitor = async (visitorData: Omit<Visitor, 'id'>) => {
  try {
    // Check if visitor already exists
    const q = query(
      collection(db, 'visitors'),
      where('userId', '==', visitorData.userId),
      where('sessionId', '==', visitorData.sessionId)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      // Update existing visitor
      const visitorDoc = querySnapshot.docs[0];
      await updateDoc(visitorDoc.ref, {
        lastVisit: visitorData.lastVisit,
        totalViews: visitorData.totalViews,
        totalClicks: visitorData.totalClicks,
        isReturning: true
      });
      return visitorDoc.id;
    } else {
      // Create new visitor
      const docRef = await addDoc(collection(db, 'visitors'), visitorData);
      return docRef.id;
    }
  } catch (error) {
    console.error('Error tracking visitor:', error);
    throw error;
  }
};

export const getUserVisitors = async (userId: string, timeRange: '7d' | '30d' | '90d' = '30d'): Promise<Visitor[]> => {
  try {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const q = query(
      collection(db, 'visitors'),
      where('userId', '==', userId),
      where('lastVisit', '>=', Timestamp.fromDate(startDate)),
      orderBy('lastVisit', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Visitor[];
  } catch (error) {
    console.error('Error fetching user visitors:', error);
    throw error;
  }
};

export const getAudienceInsights = async (userId: string): Promise<AudienceInsight[]> => {
  try {
    const q = query(
      collection(db, 'audienceInsights'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AudienceInsight[];
  } catch (error) {
    console.error('Error fetching audience insights:', error);
    throw error;
  }
};
