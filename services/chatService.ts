
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

export interface ChatMessage {
  id?: string;
  userId: string;
  profileId: string;
  message: string;
  response: string;
  timestamp: Timestamp;
  sessionId: string;
}

export interface AvatarConfig {
  id?: string;
  userId: string;
  name: string;
  personality: string;
  instructions: string;
  contextFile: string | null;
  responseStyle: "professional" | "casual" | "friendly" | "expert";
  enabled: boolean;
  knowledgeBase?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const createAvatarConfig = async (configData: Omit<AvatarConfig, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'avatarConfigs'), {
      ...configData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating avatar config:', error);
    throw error;
  }
};

export const getAvatarConfig = async (userId: string): Promise<AvatarConfig | null> => {
  try {
    // Handle preview mode
    if (userId === 'preview-user') {
      return {
        id: 'preview',
        userId: 'preview-user',
        name: 'Digital Twin',
        personality: 'I am a helpful and knowledgeable assistant representing the profile owner.',
        instructions: 'Answer questions about my background, skills, services, and experience. Be helpful and provide accurate information.',
        contextFile: null,
        responseStyle: 'professional',
        enabled: true,
        knowledgeBase: '',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
    }

    const q = query(collection(db, 'avatarConfigs'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as AvatarConfig;
  } catch (error) {
    console.error('Error fetching avatar config:', error);
    throw error;
  }
};

export const updateAvatarConfig = async (configId: string, updates: Partial<AvatarConfig>) => {
  try {
    const configRef = doc(db, 'avatarConfigs', configId);
    await updateDoc(configRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating avatar config:', error);
    throw error;
  }
};

export const saveChatMessage = async (messageData: Omit<ChatMessage, 'id' | 'timestamp'>) => {
  try {
    const docRef = await addDoc(collection(db, 'chatMessages'), {
      ...messageData,
      timestamp: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving chat message:', error);
    throw error;
  }
};

export const getChatHistory = async (profileId: string, sessionId: string, limitCount: number = 50): Promise<ChatMessage[]> => {
  try {
    const q = query(
      collection(db, 'chatMessages'),
      where('profileId', '==', profileId),
      where('sessionId', '==', sessionId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ChatMessage)).reverse();
  } catch (error) {
    console.error('Error fetching chat history:', error);
    throw error;
  }
};

export const getRecentChatHistory = async (profileId: string, sessionId: string, limitCount: number = 5): Promise<ChatMessage[]> => {
  try {
    const q = query(
      collection(db, 'chatMessages'),
      where('profileId', '==', profileId),
      where('sessionId', '==', sessionId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ChatMessage)).reverse();
  } catch (error) {
    console.error('Error fetching recent chat history:', error);
    return [];
  }
};
