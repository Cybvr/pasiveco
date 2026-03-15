
import { CookiePreferences } from '@/types';

export const getCookiePreferences = (): CookiePreferences | null => {
  const cookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('cookiePreferences='));
  
  return cookie ? JSON.parse(cookie.split('=')[1]) : null;
};

export const setCookiePreferences = (preferences: CookiePreferences): void => {
  document.cookie = `cookiePreferences=${JSON.stringify(preferences)};max-age=${60*60*24*365};path=/;SameSite=Strict`;
};

export const clearCookiePreferences = (): void => {
  document.cookie = 'cookiePreferences=;max-age=0;path=/';
};
