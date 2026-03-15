
import { useContext } from 'react';
import { useAuth as useAuthContext } from '@/context/AuthContext';
import { isInTrialPeriod } from '@/lib/plans';

export const useAuth = () => {
  const auth = useAuthContext();
  const isTrialing = auth.user ? isInTrialPeriod(new Date(auth.user.createdAt)) : false;
const trialType = 'free';
return { ...auth, isTrialing, trialType };
  return { ...auth, isTrialing };
};
