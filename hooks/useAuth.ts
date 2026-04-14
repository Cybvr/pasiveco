import { useContext } from 'react';
import { useAuth as useAuthContext } from '@/context/AuthContext';
import { isInTrialPeriod, getTrialDaysLeft } from '@/lib/plans';

export const useAuth = () => {
  const auth = useAuthContext();
  
  // Use Firebase creationTime if available, otherwise check for Firestore createdAt or fallback
  const creationTime = auth.user?.metadata?.creationTime 
    ? new Date(auth.user.metadata.creationTime) 
    : (auth.user as any)?.createdAt?.toDate 
      ? (auth.user as any).createdAt.toDate() 
      : new Date();

  const isTrialing = auth.user ? isInTrialPeriod(creationTime) : false;
  const trialDaysLeft = auth.user ? getTrialDaysLeft(creationTime) : 0;
  const trialType = 'free';

  return { ...auth, isTrialing, trialDaysLeft, trialType };
};
