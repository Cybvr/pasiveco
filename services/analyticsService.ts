
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
  limit
} from 'firebase/firestore';

export interface AnalyticsEvent {
  id?: string;
  userId: string;
  eventType: 'page_view' | 'link_click' | 'profile_visit' | 'product_view';
  eventData: {
    url?: string;
    linkId?: string;
    productId?: string;
    referrer?: string;
    userAgent?: string;
    ip?: string;
    country?: string;
    city?: string;
    device?: string;
  };
  sessionId?: string;
  timestamp: Timestamp;
}

export interface AnalyticsStats {
  totalViews: number;
  totalClicks: number;
  uniqueVisitors: number;
  topCountries: Array<{ country: string; count: number }>;
  topDevices: Array<{ device: string; count: number }>;
  recentActivity: AnalyticsEvent[];
}

export const trackEvent = async (eventData: Omit<AnalyticsEvent, 'id' | 'timestamp'>) => {
  try {
    const docRef = await addDoc(collection(db, 'analytics'), {
      ...eventData,
      timestamp: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error tracking analytics event:', error);
    throw error;
  }
};

export const getUserAnalytics = async (userId: string, timeRange: '7d' | '30d' | '90d' = '30d'): Promise<AnalyticsStats> => {
  try {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const q = query(
      collection(db, 'analytics'),
      where('userId', '==', userId),
      where('timestamp', '>=', Timestamp.fromDate(startDate)),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const events = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AnalyticsEvent[];

    // Calculate stats
    const totalViews = events.filter(e => e.eventType === 'page_view').length;
    const totalClicks = events.filter(e => e.eventType === 'link_click').length;
    const uniqueVisitors = new Set(events.map(e => e.sessionId)).size;
    
    // Top countries
    const countryCount: { [key: string]: number } = {};
    events.forEach(e => {
      if (e.eventData.country) {
        countryCount[e.eventData.country] = (countryCount[e.eventData.country] || 0) + 1;
      }
    });
    const topCountries = Object.entries(countryCount)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top devices
    const deviceCount: { [key: string]: number } = {};
    events.forEach(e => {
      if (e.eventData.device) {
        deviceCount[e.eventData.device] = (deviceCount[e.eventData.device] || 0) + 1;
      }
    });
    const topDevices = Object.entries(deviceCount)
      .map(([device, count]) => ({ device, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalViews,
      totalClicks,
      uniqueVisitors,
      topCountries,
      topDevices,
      recentActivity: events.slice(0, 10)
    };
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    throw error;
  }
};

export const getRecentEvents = async (userId: string, limitCount: number = 10): Promise<AnalyticsEvent[]> => {
  try {
    const q = query(
      collection(db, 'analytics'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AnalyticsEvent[];
  } catch (error) {
    console.error('Error fetching recent events:', error);
    throw error;
  }
};
