'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import nookies from 'nookies';
import { updateUserLastLogin } from '@/services/userService';

interface User extends FirebaseUser {
  displayName: string | null;
  photoURL: string | null;
  plan: string | null;
  emailPlan: string | null;
  emailSubscriptionStatus: string | null;
  emailBillingPeriod: string | null;
  isAdmin: boolean;
  isPinEnabled: boolean;
  pin?: string;
  username: string;
  bio: string;
  phoneNumber: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  impersonatedUser: User | null;
  impersonateUser: (user: User) => void;
  stopImpersonating: () => void;
  isImpersonating: boolean;
  realUser: User | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [impersonatedUser, setImpersonatedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load impersonated user from session storage if exists
    const storedImpersonation = sessionStorage.getItem('impersonatedUser');
    if (storedImpersonation) {
      try {
        setImpersonatedUser(JSON.parse(storedImpersonation));
      } catch (e) {
        console.error('Error parsing impersonated user', e);
        sessionStorage.removeItem('impersonatedUser');
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user token for cookie
          const token = await firebaseUser.getIdToken();
          nookies.set(undefined, 'session', token, { path: '/' });

          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const userData = userDoc.data();
          const lastSignInAt = firebaseUser.metadata.lastSignInTime
            ? new Date(firebaseUser.metadata.lastSignInTime)
            : null;
          const storedLastLoginAt = userData?.lastLoginAt?.toDate?.() ?? null;

          if (
            lastSignInAt &&
            (!storedLastLoginAt || Math.abs(lastSignInAt.getTime() - storedLastLoginAt.getTime()) > 60 * 1000)
          ) {
            await updateUserLastLogin(firebaseUser.uid, lastSignInAt);
          }

          setUser({
            ...firebaseUser,
            displayName: userData?.displayName || firebaseUser.displayName || null,
            photoURL: userData?.profilePicture || userData?.photoURL || firebaseUser.photoURL || null,
            plan: userData?.plan || null,
            emailPlan: userData?.emailPlan || null,
            emailSubscriptionStatus: userData?.emailSubscriptionStatus || null,
            emailBillingPeriod: userData?.emailBillingPeriod || null,
            isAdmin: userData?.isAdmin || false,
            isPinEnabled: userData?.isPinEnabled || false,
            pin: userData?.pin || '',
            username: userData?.username || '',
            bio: userData?.bio || '',
            phoneNumber: userData?.phoneNumber || firebaseUser.phoneNumber || null,
          } as User);
        } catch (err) {
          console.error('Error loading user data:', err);
          setUser({
            ...firebaseUser,
            plan: null,
            emailPlan: null,
            emailSubscriptionStatus: null,
            emailBillingPeriod: null,
            isAdmin: false,
            isPinEnabled: false,
            phoneNumber: firebaseUser.phoneNumber || null,
          } as User);
        }
      } else {
        setUser(null);
        setImpersonatedUser(null);
        sessionStorage.removeItem('impersonatedUser');
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

  const impersonateUser = (targetUser: User) => {
    setImpersonatedUser(targetUser);
    sessionStorage.setItem('impersonatedUser', JSON.stringify(targetUser));
  };

  const stopImpersonating = () => {
    setImpersonatedUser(null);
    sessionStorage.removeItem('impersonatedUser');
  };

  return (
    <AuthContext.Provider
      value={{
        user: impersonatedUser || user,
        realUser: user,
        impersonatedUser,
        impersonateUser,
        stopImpersonating,
        isImpersonating: !!impersonatedUser,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
