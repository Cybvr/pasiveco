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

export interface UserProfile {
  id?: string;
  userId: string;
  username: string;
  displayName: string;
  bio: string;
  profilePicture: string;
  isPublic?: boolean;
  links: Array<{
    id: string;
    title: string;
    url: string;
    type: string;
  }>;
  socialLinks: Array<{
    id: string;
    platform: string;
    url: string;
    active?: boolean;
  }>;
  theme: string;
  appearance?: {
    buttonShape?: 'rounded' | 'square' | 'pill';
    fontFamily?: 'inter' | 'roboto' | 'poppins' | 'open-sans' | 'lato' | 'montserrat' | 'nunito' | 'raleway' | 'ubuntu' | 'playfair-display' | 'merriweather' | 'oswald' | 'source-sans-pro' | 'work-sans' | 'dm-sans';
    fontSize?: 'small' | 'medium' | 'large';
    buttonSize?: 'small' | 'medium' | 'large';
    buttonColor?: string;
    textColor?: string;
  };
  gender?: string;
  dob?: string;
  phoneNumber?: string;
  source?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const createUserProfile = async (profileData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const cleanedProfileData = {
      ...profileData,
      isPublic: profileData.isPublic !== undefined ? profileData.isPublic : true, // Default to public
    };

    const docRef = await addDoc(collection(db, 'user_profiles'), {
      ...cleanedProfileData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const q = query(collection(db, 'user_profiles'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as UserProfile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const getUserProfileByUsername = async (username: string): Promise<UserProfile | null> => {
  try {
    console.log('Searching for profile with username:', username);
    const profilesRef = collection(db, 'user_profiles');
    const q = query(profilesRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);

    console.log('Query results:', querySnapshot.size, 'documents found');
    
    if (querySnapshot.empty) {
      console.log('No profile found for username:', username);
      return null;
    }

    const doc = querySnapshot.docs[0];
    const profileData = { id: doc.id, ...doc.data() } as UserProfile;
    console.log('Found profile:', profileData);
    return profileData;
  } catch (error) {
    console.error('Error fetching user profile by username:', error);
    throw error;
  }
};

export const updateUserProfile = async (profileId: string, updates: Partial<UserProfile>) => {
  try {
    const profileRef = doc(db, 'user_profiles', profileId);

    await updateDoc(profileRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const deleteUserProfile = async (profileId: string) => {
  try {
    await deleteDoc(doc(db, 'user_profiles', profileId));
  } catch (error) {
    console.error('Error deleting user profile:', error);
    throw error;
  }
};