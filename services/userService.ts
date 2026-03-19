import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';

export interface UserLink {
  id: string;
  title: string;
  url: string;
  type: string;
  description?: string;
  thumbnail?: string;
  active?: boolean;
  clicks?: number;
  ctr?: number;
}

export interface UserSocialLink {
  id: string;
  platform: string;
  url: string;
  thumbnail?: string;
  active?: boolean;
}

export interface User {
  id?: string;
  userId?: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
  isActive: boolean;
  isAdmin?: boolean;
  role: 'user' | 'admin' | 'moderator';
  metadata?: {
    signUpMethod: 'email' | 'google' | 'facebook';
    ipAddress?: string;
    userAgent?: string;
  };
  username?: string;
  bio?: string;
  profilePicture?: string | null;
  bannerImage?: string | null;
  slug?: string;
  category?: string;
  links?: UserLink[];
  socialLinks?: UserSocialLink[];
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
}

const usersCollection = collection(db, 'users');

const sanitizeUsername = (username?: string | null) => (username || '').replace(/^@/, '').trim();

const normalizeUser = (userId: string, data: Record<string, unknown>): User => {
  const user = data as unknown as User;
  return {
    ...user,
    id: userId,
    userId,
    username: sanitizeUsername(user.username),
    profilePicture: user.profilePicture ?? user.photoURL ?? null,
    links: Array.isArray(user.links) ? user.links : [],
    socialLinks: Array.isArray(user.socialLinks) ? user.socialLinks : [],
  };
};

const toMillis = (value?: Timestamp | null) => (value instanceof Timestamp ? value.toMillis() : 0);

const sortUsersByRecentUpdate = (users: User[]) =>
  [...users].sort((a, b) => {
    const updatedDiff = toMillis(b.updatedAt) - toMillis(a.updatedAt);
    if (updatedDiff !== 0) {
      return updatedDiff;
    }

    return (a.displayName || a.username || a.slug || '').localeCompare(b.displayName || b.username || b.slug || '');
  });

const hasDiscoverableIdentity = (user: User) =>
  Boolean(user.userId && (sanitizeUsername(user.username) || user.displayName?.trim() || user.slug?.trim()));

export const createUser = async (userData: Omit<User, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
  try {
    const cleanedUserData = {
      ...userData,
      username: sanitizeUsername(userData.username),
      slug: userData.slug || sanitizeUsername(userData.username) || '',
      links: userData.links || [],
      socialLinks: userData.socialLinks || [],
    };

    const docRef = await addDoc(usersCollection, {
      ...cleanedUserData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const getUser = async (userId: string): Promise<User | null> => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return normalizeUser(docSnap.id, docSnap.data());
    }
    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const q = query(usersCollection, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const userDoc = querySnapshot.docs[0];
    return normalizeUser(userDoc.id, userDoc.data());
  } catch (error) {
    console.error('Error fetching user by email:', error);
    throw error;
  }
};

export const getUserByUsername = async (username: string): Promise<User | null> => {
  try {
    const normalizedUsername = sanitizeUsername(username);
    const q = query(usersCollection, where('username', '==', normalizedUsername));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const userDoc = querySnapshot.docs[0];
    return normalizeUser(userDoc.id, userDoc.data());
  } catch (error) {
    console.error('Error fetching user by username:', error);
    throw error;
  }
};

export const updateUser = async (userId: string, updates: Partial<User>) => {
  try {
    const userRef = doc(db, 'users', userId);
    const existingUser = await getDoc(userRef);
    const normalizedUpdates = {
      ...updates,
      username: updates.username !== undefined ? sanitizeUsername(updates.username) : updates.username,
      updatedAt: Timestamp.now(),
    };

    if (!existingUser.exists()) {
      await setDoc(userRef, {
        email: updates.email || '',
        emailVerified: false,
        isActive: true,
        role: 'user',
        createdAt: Timestamp.now(),
        ...normalizedUpdates,
      }, { merge: true });
      return;
    }

    await updateDoc(userRef, normalizedUpdates);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const updateUserLastLogin = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      lastLoginAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating user last login:', error);
    throw error;
  }
};

export const deactivateUser = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      isActive: false,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error deactivating user:', error);
    throw error;
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const q = query(usersCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((userDoc) => normalizeUser(userDoc.id, userDoc.data()));
  } catch (error) {
    console.warn('Falling back to unsorted users query:', error);

    const snapshot = await getDocs(usersCollection);
    const users = snapshot.docs.map((userDoc) => normalizeUser(userDoc.id, userDoc.data()));

    return users.sort((a, b) => {
      const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0;
      const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0;
      return dateB - dateA;
    });
  }
};

export const getPublicUsers = async (): Promise<User[]> => {
  try {
    const users = await getAllUsers();
    return sortUsersByRecentUpdate(users.filter(hasDiscoverableIdentity));
  } catch (error) {
    console.error('Error fetching discoverable users:', error);
    throw error;
  }
};

export const deleteUser = async (userId: string) => {
  try {
    await deleteDoc(doc(db, 'users', userId));
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};
