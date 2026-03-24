'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import nookies from 'nookies';

interface User extends FirebaseUser {
  displayName: string | null;
  photoURL: string | null;
  plan: string | null;
  isAdmin: boolean;
  isPinEnabled: boolean;
  pin?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user token for cookie
          const token = await firebaseUser.getIdToken();
          nookies.set(undefined, 'session', token, { path: '/' });

          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const userData = userDoc.data();

          setUser({
            ...firebaseUser,
            plan: userData?.plan || null,
            isAdmin: userData?.isAdmin || false,
            isPinEnabled: userData?.isPinEnabled || false,
            pin: userData?.pin || '',
          } as User);
        } catch (err) {
          console.error('Error loading user data:', err);
          setUser({
            ...firebaseUser,
            plan: null,
            isAdmin: false,
            isPinEnabled: false,
          } as User);
        }
      } else {
        setUser(null);
        nookies.destroy(undefined, 'session');
      }
      setLoading(false);
    });

    // Set up token refresh
    const intervalId = setInterval(async () => {
      if (auth.currentUser) {
        const token = await auth.currentUser.getIdToken(true);
        nookies.set(undefined, 'session', token, { path: '/' });
      }
    }, 10 * 60 * 1000); // Refresh every 10 minutes

    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};