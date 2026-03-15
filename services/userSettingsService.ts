
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
  setDoc
} from 'firebase/firestore';

export interface UserSettings {
  id?: string;
  userId: string;
  notifications: {
    email: boolean;
    sms: boolean;
    marketing: boolean;
    analytics: boolean;
    qrScans: boolean;
    profileViews: boolean;
  };
  privacy: {
    profilePublic: boolean;
    showAnalytics: boolean;
    allowIndexing: boolean;
    showVisitorData: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
    dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
    currency: string;
  };
  plan: 'free' | 'premium' | 'business';
  subscription?: {
    stripeCustomerId?: string;
    subscriptionId?: string;
    status: 'active' | 'cancelled' | 'past_due' | 'incomplete';
    currentPeriodEnd?: Timestamp;
  };
  billing: {
    email?: string;
    address?: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
    vatNumber?: string;
  };
  integrations: {
    googleAnalytics?: {
      trackingId: string;
      enabled: boolean;
    };
    facebook?: {
      pixelId: string;
      enabled: boolean;
    };
    zapier?: {
      webhookUrl: string;
      enabled: boolean;
    };
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const createUserSettings = async (userId: string, settings: Partial<UserSettings> = {}) => {
  try {
    const defaultSettings: UserSettings = {
      userId,
      notifications: {
        email: true,
        sms: false,
        marketing: false,
        analytics: true,
        qrScans: true,
        profileViews: true
      },
      privacy: {
        profilePublic: true,
        showAnalytics: true,
        allowIndexing: true,
        showVisitorData: false
      },
      preferences: {
        theme: 'auto',
        language: 'en',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        currency: 'USD'
      },
      plan: 'free',
      billing: {},
      integrations: {},
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      ...settings
    };

    const docRef = await addDoc(collection(db, 'userSettings'), defaultSettings);
    return docRef.id;
  } catch (error) {
    console.error('Error creating user settings:', error);
    throw error;
  }
};

export const getUserSettings = async (userId: string): Promise<UserSettings | null> => {
  try {
    const q = query(collection(db, 'userSettings'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as UserSettings;
  } catch (error) {
    console.error('Error fetching user settings:', error);
    throw error;
  }
};

export const updateUserSettings = async (settingsId: string, updates: Partial<UserSettings>) => {
  try {
    const settingsRef = doc(db, 'userSettings', settingsId);
    await updateDoc(settingsRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating user settings:', error);
    throw error;
  }
};

export const updateUserNotifications = async (userId: string, notifications: Partial<UserSettings['notifications']>) => {
  try {
    const settings = await getUserSettings(userId);
    if (!settings) throw new Error('User settings not found');
    
    await updateUserSettings(settings.id!, {
      notifications: {
        ...settings.notifications,
        ...notifications
      }
    });
  } catch (error) {
    console.error('Error updating user notifications:', error);
    throw error;
  }
};

export const updateUserPrivacy = async (userId: string, privacy: Partial<UserSettings['privacy']>) => {
  try {
    const settings = await getUserSettings(userId);
    if (!settings) throw new Error('User settings not found');
    
    await updateUserSettings(settings.id!, {
      privacy: {
        ...settings.privacy,
        ...privacy
      }
    });
  } catch (error) {
    console.error('Error updating user privacy:', error);
    throw error;
  }
};

export const updateUserPreferences = async (userId: string, preferences: Partial<UserSettings['preferences']>) => {
  try {
    const settings = await getUserSettings(userId);
    if (!settings) throw new Error('User settings not found');
    
    await updateUserSettings(settings.id!, {
      preferences: {
        ...settings.preferences,
        ...preferences
      }
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
};

export const updateUserSubscription = async (userId: string, subscription: UserSettings['subscription']) => {
  try {
    const settings = await getUserSettings(userId);
    if (!settings) throw new Error('User settings not found');
    
    await updateUserSettings(settings.id!, {
      subscription,
      plan: subscription?.status === 'active' ? 'premium' : 'free'
    });
  } catch (error) {
    console.error('Error updating user subscription:', error);
    throw error;
  }
};

export const updateUserIntegrations = async (userId: string, integrations: Partial<UserSettings['integrations']>) => {
  try {
    const settings = await getUserSettings(userId);
    if (!settings) throw new Error('User settings not found');
    
    await updateUserSettings(settings.id!, {
      integrations: {
        ...settings.integrations,
        ...integrations
      }
    });
  } catch (error) {
    console.error('Error updating user integrations:', error);
    throw error;
  }
};

export const deleteUserSettings = async (settingsId: string) => {
  try {
    await deleteDoc(doc(db, 'userSettings', settingsId));
  } catch (error) {
    console.error('Error deleting user settings:', error);
    throw error;
  }
};
