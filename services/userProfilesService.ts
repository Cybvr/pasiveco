import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';

export interface UserProfile {
  id?: string;
  userId: string;
  username: string;
  displayName: string;
  bio: string;
  profilePicture: string | null;
  bannerImage?: string | null;
  slug: string;
  isPublic?: boolean;
  links: Array<{
    id: string;
    title: string;
    url: string;
    type: string;
    description?: string;
    thumbnail?: string;
    active?: boolean;
    clicks?: number;
    ctr?: number;
  }>;
  socialLinks: Array<{
    id: string;
    platform: string;
    url: string;
    thumbnail?: string;
    active?: boolean;
  }>;
  theme?: string;
  appearance?: Record<string, unknown>;
  gender?: string;
  dob?: string;
  phoneNumber?: string;
  source?: string;
  backgroundType?: 'color' | 'image';
  backgroundColor?: string;
  backgroundImage?: string | null;
  pageBackgroundType?: 'color' | 'image';
  pageBackgroundColor?: string;
  pageBackgroundImage?: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const userProfilesCollection = collection(db, 'user_profiles');

const toMillis = (value?: Timestamp | null) => (value instanceof Timestamp ? value.toMillis() : 0);

const sortProfilesByRecentUpdate = (profiles: UserProfile[]) =>
  [...profiles].sort((a, b) => {
    const updatedDiff = toMillis(b.updatedAt) - toMillis(a.updatedAt);
    if (updatedDiff !== 0) {
      return updatedDiff;
    }

    return (a.displayName || a.username || a.slug || '').localeCompare(b.displayName || b.username || b.slug || '');
  });

const sanitizeUsername = (username?: string | null) => (username || '').replace(/^@/, '').trim();
const hasDiscoverableIdentity = (profile: UserProfile) =>
  Boolean(profile.userId && (sanitizeUsername(profile.username) || profile.displayName?.trim() || profile.slug?.trim()));

export const createUserProfile = async (profileData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const cleanedProfileData = {
      ...profileData,
      isPublic: profileData.isPublic !== undefined ? profileData.isPublic : true,
    };

    const docRef = await addDoc(userProfilesCollection, {
      ...cleanedProfileData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const q = query(userProfilesCollection, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const profileDoc = querySnapshot.docs[0];
    return { id: profileDoc.id, ...profileDoc.data() } as UserProfile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const getPublicUserProfiles = async (): Promise<UserProfile[]> => {
  try {
    const snapshot = await getDocs(userProfilesCollection);
    const profiles = snapshot.docs
      .map((profileDoc) => ({ id: profileDoc.id, ...profileDoc.data() } as UserProfile))
      .filter((profile) => profile.isPublic !== false && hasDiscoverableIdentity(profile));

    return sortProfilesByRecentUpdate(profiles);
  } catch (error) {
    console.error('Error fetching public user profiles:', error);
    throw error;
  }
};

export const getUserProfileByUsername = async (username: string): Promise<UserProfile | null> => {
  try {
    const normalizedUsername = sanitizeUsername(username);
    const q = query(userProfilesCollection, where('username', '==', normalizedUsername));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const profileDoc = querySnapshot.docs[0];
    return { id: profileDoc.id, ...profileDoc.data() } as UserProfile;
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
      updatedAt: Timestamp.now(),
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
